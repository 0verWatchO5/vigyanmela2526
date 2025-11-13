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

    const allUsers = await users
      .find({})
      .select("-__v") // Exclude version key
      .sort({ createdAt: -1 }) // Latest first
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: allUsers.length,
        users: allUsers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
