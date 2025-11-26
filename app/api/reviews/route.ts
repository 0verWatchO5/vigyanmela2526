import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/dbconfig/dbconn";
import Review from "@/models/review";
import Visitor from "@/models/visitor";
import SiteSettings from "@/models/siteSettings";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Fetch reviews for a project (with pagination)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = parseInt(searchParams.get("skip") || "0");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: "Invalid projectId" },
        { status: 400 }
      );
    }

    const reviews = await Review.find({
      projectId: new mongoose.Types.ObjectId(projectId),
      hidden: false, // Only show non-hidden reviews to public
    })
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination (excluding hidden)
    const totalCount = await Review.countDocuments({
      projectId: new mongoose.Types.ObjectId(projectId),
      hidden: false,
    });

    return NextResponse.json({
      reviews,
      totalCount,
      hasMore: skip + limit < totalCount,
    });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in with LinkedIn." },
        { status: 401 }
      );
    }

    // Check strict footfall verification setting
    const settings = await SiteSettings.findOne();
    const strictFootfallEnabled = settings?.strictFootfallEnabled || false;

    if (strictFootfallEnabled) {
      // Verify visitor has approved footfall
      const visitor = await Visitor.findOne({ email: session.user.email });

      if (!visitor) {
        return NextResponse.json(
          { error: "Please make sure you are logged in and your footfall has been approved by the visitor management team." },
          { status: 403 }
        );
      }

      if (!visitor.footfallApproved) {
        return NextResponse.json(
          { error: "Please make sure you are logged in and your footfall has been approved by the visitor management team." },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { projectId, rating, comment } = body;

    // Validation
    if (!projectId || !rating || !comment) {
      return NextResponse.json(
        { error: "projectId, rating, and comment are required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: "Invalid projectId" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this project
    const existingReview = await Review.findOne({
      projectId: new mongoose.Types.ObjectId(projectId),
      reviewerEmail: session.user.email,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this project. You can edit your existing review." },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      projectId: new mongoose.Types.ObjectId(projectId),
      reviewerName: session.user.name || "Anonymous",
      reviewerEmail: session.user.email,
      reviewerLinkedIn: session.user.image || "",
      rating,
      comment: comment.trim(),
    });

    return NextResponse.json(
      { message: "Review created successfully", review },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review", details: error.message },
      { status: 500 }
    );
  }
}
