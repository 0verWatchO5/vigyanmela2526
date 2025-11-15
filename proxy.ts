import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/eventheads")) {

    if (pathname === "/eventheads/login") {
      return NextResponse.next();
    }

    const adminData = await verifyAdminToken(request);

    if (!adminData) {

      const loginUrl = new URL("/eventheads/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/eventheads/:path*", // All routes under /eventheads
  ],
};
