import { NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import CollegeStudent from "@/models/collegeStudent";

export async function GET() {
  try {
    await Dbconns();

    const students = await CollegeStudent.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      students,
    });
  } catch (error: any) {
    console.error("Error fetching college students:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}
