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
    if (body.status) {
      const { status } = body;

      if (!["pending", "approved", "rejected"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }

      const updatedStudent = await CollegeStudent.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).select("-password");

      if (!updatedStudent) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        student: updatedStudent,
        message: `Student ${status} successfully`,
      });
    }

    // Otherwise, it's a general info update
    const updateFields: any = {};
    if (body.studentName) updateFields.studentName = body.studentName;
    if (body.email) updateFields.email = body.email;
    if (body.phoneNumber) updateFields.phoneNumber = body.phoneNumber;
    if (body.collegeName) updateFields.collegeName = body.collegeName;
    if (body.currentYear) updateFields.currentYear = body.currentYear;
    if (body.academicSession) updateFields.academicSession = body.academicSession;
    if (body.rollNumber) updateFields.rollNumber = body.rollNumber;

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
    ).select("-password");

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
