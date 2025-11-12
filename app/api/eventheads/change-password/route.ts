import { NextRequest, NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import users from "@/models/registration";
import bcrypt from "bcryptjs";
import { getAdminFromRequest } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {

    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Please login as admin." },
        { status: 401 }
      );
    }

    await Dbconns();

    const body = await request.json();
    const { oldPassword, newPassword, confirmPassword } = body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirm password do not match" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const user = await users
      .findOne({ email: admin.email })
      .select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "No password set. Please contact system administrator." },
        { status: 500 }
      );
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    
    return NextResponse.json(
      { error: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}
