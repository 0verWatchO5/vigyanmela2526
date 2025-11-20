import { NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import CollegeStudent from "@/models/collegeStudent";

function sanitize(doc: any) {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  return {
    _id: obj?._id?.toString?.() ?? obj?._id ?? "",
    teamName: obj.teamName,
    projectSummary: obj.projectSummary,
    teamSize: obj.teamSize,
    segments: Array.isArray(obj.segments) ? obj.segments : [],
    teamMembers: Array.isArray(obj.teamMembers)
      ? obj.teamMembers.map((m: any) => ({
          fullName: m.fullName,
          department: m.department,
          email: m.email,
          contactNumber: m.contactNumber,
          rollNumber: m.rollNumber,
          yearOfStudy: m.yearOfStudy,
        }))
      : [],
    registrationStatus: obj.registrationStatus ?? "pending",
    linkedinId: obj.linkedinId || null,
    submittedAt: obj.submittedAt ? new Date(obj.submittedAt).toISOString() : null,
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : null,
  };
}

export async function GET() {
  try {
    await Dbconns();
    const students = await CollegeStudent.find({}).lean();
    return NextResponse.json({ students: students.map(sanitize) }, { status: 200 });
  } catch (error) {
    console.error("Admin college students fetch error", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load college registrations" },
      { status: 500 }
    );
  }
}