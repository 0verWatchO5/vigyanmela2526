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
        { error: "Access denied. Only super admins can make other users admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, password } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const adminPassword = password || "admin123";

    if (adminPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const user = await users.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.isAdmin) {
      return NextResponse.json(
        { error: "User is already an admin" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    user.isAdmin = true;
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: `${user.firstName} ${user.lastName} is now an admin`,
        admin: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          defaultPassword: adminPassword,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    
    return NextResponse.json(
      { error: error.message || "Failed to make user admin" },
      { status: 500 }
    );
  }
}
