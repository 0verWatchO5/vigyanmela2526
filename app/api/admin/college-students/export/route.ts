import { NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import CollegeStudent from "@/models/collegeStudent";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    await Dbconns();
    const students = await CollegeStudent.find({}).lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("College Registrations");

    sheet.columns = [
      { header: "Team ID", key: "teamId", width: 20 },
      { header: "Team Name", key: "teamName", width: 30 },
      { header: "Project Summary", key: "projectSummary", width: 50 },
      { header: "Team Size", key: "teamSize", width: 10 },
      { header: "Segments", key: "segments", width: 40 },
      { header: "Registration Status", key: "status", width: 18 },
      { header: "LinkedIn ID", key: "linkedinId", width: 30 },
      { header: "Submitted At", key: "submittedAt", width: 24 },
      { header: "Member #", key: "memberIndex", width: 10 },
      { header: "Full Name", key: "fullName", width: 25 },
      { header: "Department", key: "department", width: 18 },
      { header: "Year Of Study", key: "yearOfStudy", width: 16 },
      { header: "Email", key: "email", width: 30 },
      { header: "Contact Number", key: "contactNumber", width: 16 },
      { header: "Roll Number", key: "rollNumber", width: 16 },
      { header: "LinkedIn Profile", key: "linkedinProfile", width: 40 },
    ];

    students.forEach((team: any) => {
      const baseRow = {
        teamId: team._id?.toString?.() ?? team._id,
        teamName: team.teamName,
        projectSummary: team.projectSummary,
        teamSize: team.teamSize,
        segments: Array.isArray(team.segments) ? team.segments.join(", ") : "",
        status: team.registrationStatus ?? "pending",
        linkedinId: team.linkedinId || "",
        submittedAt: team.submittedAt
          ? new Date(team.submittedAt).toLocaleString()
          : team.createdAt
          ? new Date(team.createdAt).toLocaleString()
          : "",
      };

      if (Array.isArray(team.teamMembers) && team.teamMembers.length) {
        team.teamMembers.forEach((m: any, idx: number) => {
          sheet.addRow({
            ...baseRow,
            memberIndex: idx + 1,
            fullName: m.fullName,
            department: m.department,
            yearOfStudy: m.yearOfStudy,
            email: m.email,
            contactNumber: m.contactNumber,
            rollNumber: m.rollNumber,
            linkedinProfile: m.linkedinProfile || "",
          });
        });
      } else {
        sheet.addRow(baseRow);
      }
    });

    // Style header
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=college_registrations.xlsx",
      },
    });
  } catch (error) {
    console.error("Excel export error", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to export registrations" },
      { status: 500 }
    );
  }
}
