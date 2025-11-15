import NextAuth from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import Dbconns from "@/dbconfig/dbconn";
import User from "@/models/registration";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}

export const authOptions = {
  providers: [
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      client: { token_endpoint_auth_method: "client_secret_post" },
      issuer: "https://www.linkedin.com",
      profile: (profile: any) => ({
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }),
      wellKnown: "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      authorization: {
        params: {
          // Add w_member_social to allow creating posts programmatically
          scope: "openid profile email w_member_social",
        },
      },
    }),
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await Dbconns();
        const user = await User.findOne({ email: credentials.email }).select("+password firstName lastName email password");
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return {
          id: (user as any)._id?.toString?.() || undefined,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }: { token: any; account?: any; profile?: any; user?: any }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.id = profile.sub;
      }
      // For credentials sign-in, profile is undefined; use user.id
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken as string;
      const user = session.user ?? (session.user = {} as any);
      user.id = token.id as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
