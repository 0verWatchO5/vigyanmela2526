import { NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import CollegeStudent from "@/models/collegeStudent";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await Dbconns();
    const { id } = await params;

    const deletedStudent = await CollegeStudent.findByIdAndDelete(id);

    if (!deletedStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete student" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await Dbconns();
    const { id } = await params;
    const body = await request.json();

    // Check if it's a status update
    if (body.registrationStatus) {
      const { registrationStatus } = body;

      if (!["pending", "approved", "rejected"].includes(registrationStatus)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }

      const updatedStudent = await CollegeStudent.findByIdAndUpdate(
        id,
        { registrationStatus },
        { new: true, runValidators: true }
      );

      if (!updatedStudent) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        student: updatedStudent,
        message: `Student ${registrationStatus} successfully`,
      });
    }

    // Otherwise, it's a general info update (including slot/room)
    const updateFields: any = {};
    if (body.teamName) updateFields.teamName = body.teamName;
    if (body.projectSummary) updateFields.projectSummary = body.projectSummary;
    if (body.teamSize) updateFields.teamSize = body.teamSize;
    if (Array.isArray(body.segments)) updateFields.segments = body.segments;
    if (Array.isArray(body.teamMembers)) updateFields.teamMembers = body.teamMembers;
    if (body.linkedinId) updateFields.linkedinId = body.linkedinId;
    if (body.hasOwnProperty('slotId')) updateFields.slotId = body.slotId;
    if (body.hasOwnProperty('roomNo')) updateFields.roomNo = body.roomNo;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedStudent = await CollegeStudent.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student: updatedStudent,
      message: "Student updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update student" },
      { status: 500 }
    );
  }
}
