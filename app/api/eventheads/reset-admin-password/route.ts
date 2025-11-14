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

    const requestingUser = await users.findOne({ email: admin.email });
    
    if (!requestingUser?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Access denied. Only super admins can reset admin passwords." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { adminId, newPassword } = body;

    if (!adminId || !newPassword) {
      return NextResponse.json(
        { error: "Admin ID and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const adminUser = await users.findById(adminId);

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    if (!adminUser.isAdmin) {
      return NextResponse.json(
        { error: "User is not an admin" },
        { status: 400 }
      );
    }

    if (adminUser.isSuperAdmin && adminUser._id.toString() !== requestingUser._id.toString()) {
      return NextResponse.json(
        { error: "Cannot reset another super admin's password" },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    adminUser.password = hashedPassword;
    await adminUser.save();

    return NextResponse.json(
      {
        success: true,
        message: `Password reset successfully for ${adminUser.firstName} ${adminUser.lastName}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    
    return NextResponse.json(
      { error: error.message || "Failed to reset admin password" },
      { status: 500 }
    );
  }
}
