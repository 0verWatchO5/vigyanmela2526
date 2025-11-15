import { NextRequest, NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import Visitor from "@/models/visitor";

export async function GET(request: NextRequest) {
  try {
    await Dbconns();

    const visitors = await Visitor.find().sort({ createdAt: -1 }).limit(200).lean();

    return NextResponse.json({ visitors }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch visitors" }, { status: 500 });
  }
}
