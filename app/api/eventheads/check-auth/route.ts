import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const adminData = await getAdminFromRequest(request);

    const token = request.cookies.get("admin-token")?.value;

    return NextResponse.json({
      isAuthenticated: !!adminData,
      hasToken: !!token,
      adminData: adminData || null,
      cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
