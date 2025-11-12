import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-admin-key-change-in-production";

interface AdminPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  iat?: number;
  exp?: number;
}


export function generateAdminToken(userId: string, email: string, isSuperAdmin?: boolean): string {
  const payload: AdminPayload = {
    userId,
    email,
    isAdmin: true,
    isSuperAdmin: isSuperAdmin || false,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "2h", // 2 hours
  });
}


export async function generateAdminTokenEdge(userId: string, email: string): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const token = await new SignJWT({ userId, email, isAdmin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  return token;
}


export async function verifyAdminToken(request: NextRequest): Promise<AdminPayload | null> {
  try {

    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.isAdmin) {
      return null;
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      isAdmin: payload.isAdmin as boolean,
      isSuperAdmin: payload.isSuperAdmin as boolean | undefined,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    
    return null;
  }
}


export async function getAdminFromRequest(request: NextRequest): Promise<AdminPayload | null> {
  return await verifyAdminToken(request);
}
