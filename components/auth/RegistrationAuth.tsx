"use client";
import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  callbackUrl?: string;
  title?: string;
  subtitle?: string;
  unauthenticatedClassName?: string;
  hideCredentials?: boolean;
};

export default function RegistrationAuth({
  children,
  className,
  callbackUrl = "/registration",
  title = "Continue registration",
  subtitle = "Sign in with LinkedIn or your account",
  unauthenticatedClassName,
  hideCredentials = false,
}: Props) {
  const { status, data } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperClass = cn("w-full", className);
  const unauthWrapperClass = unauthenticatedClassName
    ? cn("w-full max-w-md", unauthenticatedClassName)
    : cn("w-full max-w-md", className);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError(res.error);
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  if (status === "loading") {
    return <div className={wrapperClass}>Loading authentication...</div>;
  }

  if (status === "unauthenticated") {
    if (hideCredentials) {
      return (
        <div className={unauthWrapperClass}>
          <div className="w-full rounded-2xl border border-border bg-background/50 backdrop-blur p-6 shadow-sm">
            <div className="mb-4 text-center">
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => signIn("linkedin", { callbackUrl })}
                className="w-full rounded-md bg-[#0a66c2] text-white py-2.5 text-sm font-medium hover:brightness-110 transition"
              >
                Continue with LinkedIn
              </button>
              <p className="text-xs text-center text-muted-foreground">
                LinkedIn sign in is required to start your registration.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={unauthWrapperClass}>
        <div className="w-full rounded-2xl border border-border bg-background/50 backdrop-blur p-6 shadow-sm">
          <div className="mb-4 text-center">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
              <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="text-right text-sm">
                <Link href="/auth/reset-password" className="text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <button
                type="button"
                onClick={() => signIn("linkedin", { callbackUrl })}
                className="w-full rounded-md bg-[#0a66c2] text-white py-2.5 text-sm font-medium hover:brightness-110 transition mb-2"
              >
                Continue with LinkedIn
              </button>

              <button
                disabled={loading}
                className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
              {error && <div className="text-sm text-red-500">Wrong email or password</div>}
            </form>

            <div className="text-sm text-muted-foreground mt-1 text-center">
              No account? <Link href="/auth/signup" className="text-blue-600">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">Signed in as {data?.user?.name || data?.user?.email}</span>
        <button 
          onClick={() => signOut({ callbackUrl })}
          className="text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
        >
          Sign out
        </button>
      </div>
      {children}
    </div>
  );
  
}
