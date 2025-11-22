import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/dbconfig/dbconn";
import Review from "@/models/review";
import CollegeStudent from "@/models/collegeStudent";
import { verifyAdminToken } from "@/lib/adminAuth";

// GET - Fetch all reviews with project details (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminPayload = await verifyAdminToken(request);
    if (!adminPayload) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    await connectDB();

    // Fetch all reviews and populate project details
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .lean();

    // Get project details for each review
    const reviewsWithProjects = await Promise.all(
      reviews.map(async (review) => {
        const project = await CollegeStudent.findById(review.projectId)
          .select("teamName segments")
          .lean();
        
        return {
          ...review,
          projectName: (project as any)?.teamName || "Unknown Project",
          projectSegments: (project as any)?.segments || [],
        };
      })
    );

    return NextResponse.json({
      success: true,
      reviews: reviewsWithProjects,
    });
  } catch (error: any) {
    console.error("Error fetching admin reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete any review (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminPayload = await verifyAdminToken(request);
    if (!adminPayload) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const deletedReview = await Review.findByIdAndDelete(reviewId);

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
