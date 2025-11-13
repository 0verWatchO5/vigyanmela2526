import Dbconns from "@/dbconfig/dbconn";

import { NextResponse, NextRequest } from "next/server";

export async function GET() {
  try {
    await Dbconns();
    return NextResponse.json({ status: 200, messages: "successful fetch " });
  } catch (error) {
    
    return NextResponse.json({ Error: error });
  }
}
