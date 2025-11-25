import { NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import Visitor from "@/models/visitor";

// PUT - Increment footfall count for a visitor
export async function PUT(request: Request) {
  try {
    await Dbconns();

    const body = await request.json();
    const { visitorId } = body;

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "Visitor ID is required" },
        { status: 400 }
      );
    }

    const visitor = await Visitor.findById(visitorId);

    if (!visitor) {
      return NextResponse.json(
        { success: false, error: "Visitor not found" },
        { status: 404 }
      );
    }

    visitor.footfallCount = (visitor.footfallCount || 0) + 1;
    await visitor.save();

    return NextResponse.json({
      success: true,
      message: "Footfall count incremented successfully",
      visitor: {
        _id: visitor._id,
        footfallCount: visitor.footfallCount,
      },
    });
  } catch (error) {
    console.error("Error incrementing footfall count:", error);
    return NextResponse.json(
      { success: false, error: "Failed to increment footfall count" },
      { status: 500 }
    );
  }
}
