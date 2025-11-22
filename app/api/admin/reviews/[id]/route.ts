import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/dbconfig/dbconn";
import Review from "@/models/review";
import { verifyAdminToken } from "@/lib/adminAuth";

// PATCH - Toggle hide/show review (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const adminPayload = await verifyAdminToken(request);
    if (!adminPayload) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { hidden } = body;

    if (typeof hidden !== "boolean") {
      return NextResponse.json(
        { error: "hidden field must be a boolean" },
        { status: 400 }
      );
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { hidden },
      { new: true }
    );

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Review ${hidden ? "hidden" : "shown"} successfully`,
      review,
    });
  } catch (error: any) {
    console.error("Error updating review visibility:", error);
    return NextResponse.json(
      { error: "Failed to update review", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete review (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const adminPayload = await verifyAdminToken(request);
    if (!adminPayload) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review", details: error.message },
      { status: 500 }
    );
  }
}
