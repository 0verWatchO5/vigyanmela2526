import { NextRequest, NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import User from "@/models/registration";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await Dbconns();
    const body = await req.json();
    const { firstName, lastName, email, contact, password } = body || {};

    if (!firstName || !lastName || !email || !contact || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await User.findOne({ $or: [{ email }, { contact }] });
    if (existing) {
      const field = existing.email === email ? "email" : "contact";
      return NextResponse.json({ error: `User with this ${field} already exists` }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = await User.create({
      firstName,
      lastName,
      email,
      contact,
      password: hashed,
      isAdmin: false,
    });

    return NextResponse.json({
      success: true,
      user: { id: created._id, firstName, lastName, email, contact },
    }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0];
      return NextResponse.json({ error: `${field} already exists` }, { status: 409 });
    }
    return NextResponse.json({ error: err?.message || "Signup failed" }, { status: 500 });
  }
}
