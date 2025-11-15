import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Dbconns from "@/dbconfig/dbconn";
import User from "@/models/registration";

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await Dbconns();
  const user = await User.findOne({ email: session.user.email })
    .select("firstName lastName email contact")
    .lean();
  return NextResponse.json({ user: user || null });
}
