import { NextRequest, NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import users from "@/models/registration";
import bcrypt from "bcryptjs";
import { generateAdminToken } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    await Dbconns();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await users.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Admin account not properly configured. Please contact system administrator." },
        { status: 500 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = generateAdminToken(user._id.toString(), user.email, user.isSuperAdmin);

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        admin: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 200 }
    );

    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    
    return NextResponse.json(
      {
        error: "Login failed",
        details: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
