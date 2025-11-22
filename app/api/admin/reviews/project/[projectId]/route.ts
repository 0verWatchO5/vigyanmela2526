import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/dbconfig/dbconn";
import Review from "@/models/review";
import { verifyAdminToken } from "@/lib/adminAuth";

// GET - Fetch reviews for a specific project (Admin - includes hidden reviews)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
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

    const { projectId } = await params;

    const reviews = await Review.find({ projectId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error: any) {
    console.error("Error fetching project reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error.message },
      { status: 500 }
    );
  }
}
