import { NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import Visitor from "@/models/visitor";

// PUT - Approve footfall for a visitor
export async function PUT(request: Request) {
  try {
    await Dbconns();

    const body = await request.json();
    const { visitorId, approve } = body;

    if (!visitorId || typeof approve !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
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

    visitor.footfallApproved = approve;
    await visitor.save();

    return NextResponse.json({
      success: true,
      message: `Footfall ${approve ? "approved" : "revoked"} successfully`,
      visitor: {
        _id: visitor._id,
        footfallApproved: visitor.footfallApproved,
      },
    });
  } catch (error) {
    console.error("Error updating footfall approval:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update footfall approval" },
      { status: 500 }
    );
  }
}
