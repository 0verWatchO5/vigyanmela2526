import { NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import User from "@/models/registration";
import Visitor from "@/models/visitor";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await Dbconns();
    const { id } = await params;

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Cascade delete: Delete associated visitor ticket if email matches
    let deletedVisitorCount = 0;
    if (deletedUser.email) {
      const deleteResult = await Visitor.deleteMany({ email: deletedUser.email });
      deletedVisitorCount = deleteResult.deletedCount || 0;
    }

    return NextResponse.json({
      success: true,
      message: `User ${deletedUser.firstName} ${deletedUser.lastName} deleted successfully${
        deletedVisitorCount > 0 ? ` (${deletedVisitorCount} associated visitor ticket(s) also deleted)` : ""
      }`,
      deletedVisitorTickets: deletedVisitorCount,
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
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

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.contact) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        contact: body.contact,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
