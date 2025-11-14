import { NextRequest, NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import users from "@/models/registration";
import { getAdminFromRequest } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
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
        { error: "Access denied. Only super admins can view admin list." },
        { status: 403 }
      );
    }

    const admins = await users
      .find({ isAdmin: true })
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        admins: admins,
        count: admins.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
        { error: "Access denied. Only super admins can remove admin roles." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { adminId } = body;

    if (!adminId) {
      return NextResponse.json(
        { error: "Admin ID is required" },
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

    if (adminUser.isSuperAdmin) {
      return NextResponse.json(
        { error: "Cannot remove super admin role" },
        { status: 403 }
      );
    }

    if (adminUser._id.toString() === requestingUser._id.toString()) {
      return NextResponse.json(
        { error: "Cannot remove your own admin role" },
        { status: 400 }
      );
    }

    adminUser.isAdmin = false;
    adminUser.password = undefined;
    await adminUser.save();

    return NextResponse.json(
      {
        success: true,
        message: `Admin role removed from ${adminUser.firstName} ${adminUser.lastName}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    
    return NextResponse.json(
      { error: error.message || "Failed to remove admin role" },
      { status: 500 }
    );
  }
}
