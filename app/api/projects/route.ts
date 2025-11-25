import { NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import CollegeStudent from "@/models/collegeStudent";

export async function GET(request: Request) {
  try {
    await Dbconns();

    const { searchParams } = new URL(request.url);
    const segment = searchParams.get("segment");

    // Build query - only show approved projects
    const query: { registrationStatus: string; segments?: { $in: string[] } } = {
      registrationStatus: "approved",
    };

    if (segment) {
      query.segments = { $in: [segment] };
    }

    const projects = await CollegeStudent.find(query)
      .select("teamName projectSummary projectImage segments slotId roomNo teamMembers uuid _id")
      .sort({ submittedAt: -1 })
      .lean();

    console.log('Projects API - Total found:', projects.length);
    if (projects.length > 0) {
      console.log('First project slotId/roomNo:', projects[0].slotId, projects[0].roomNo);
    }

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
