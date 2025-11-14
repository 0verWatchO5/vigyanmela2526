import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.delete("admin-token");

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Logout failed", details: error.message },
      { status: 500 }
    );
  }
}
