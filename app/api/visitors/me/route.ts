import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Dbconns from "@/dbconfig/dbconn";
import Visitor from "@/models/visitor";

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await Dbconns();
  const visitor = await Visitor.findOne({ email: session.user.email }).lean();
  return NextResponse.json({ visitor: visitor || null });
}
