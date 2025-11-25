import { NextRequest, NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import Visitor from "@/models/visitor";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Dbconns();

    const body = await request.json();
    const { id } = await params;

    // Validate fields
    const updateData: any = {};
    
    if (body.firstName !== undefined) {
      if (!body.firstName || body.firstName.trim().length < 2) {
        return NextResponse.json({ error: "First name must be at least 2 characters" }, { status: 400 });
      }
      updateData.firstName = body.firstName.trim();
    }

    if (body.lastName !== undefined) {
      if (!body.lastName || body.lastName.trim().length < 2) {
        return NextResponse.json({ error: "Last name must be at least 2 characters" }, { status: 400 });
      }
      updateData.lastName = body.lastName.trim();
    }

    if (body.email !== undefined) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }
      updateData.email = body.email.toLowerCase().trim();
    }

    if (body.contact !== undefined) {
      if (body.contact && !/^[0-9]{10}$/.test(body.contact)) {
        return NextResponse.json({ error: "Contact must be exactly 10 digits" }, { status: 400 });
      }
      updateData.contact = body.contact;
    }

    if (body.age !== undefined) {
      const age = parseInt(body.age, 10);
      if (isNaN(age) || age < 10 || age > 120) {
        return NextResponse.json({ error: "Age must be between 10 and 120" }, { status: 400 });
      }
      updateData.age = age;
    }

    if (body.organization !== undefined) {
      updateData.organization = body.organization?.trim() || null;
    }

    if (body.industry !== undefined) {
      updateData.industry = body.industry?.trim() || null;
    }

    if (body.linkedin !== undefined) {
      updateData.linkedin = body.linkedin?.trim() || null;
    }

    const visitor = await Visitor.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!visitor) {
      return NextResponse.json({ error: "Visitor not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Visitor updated successfully", visitor },
      { status: 200 }
    );
  } catch (err: any) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0];
      return NextResponse.json(
        { error: `A visitor with this ${field} already exists` },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: err?.message || "Failed to update visitor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Dbconns();

    const { id } = await params;

    const visitor = await Visitor.findByIdAndDelete(id);

    if (!visitor) {
      return NextResponse.json({ error: "Visitor not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Visitor deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete visitor" },
      { status: 500 }
    );
  }
}
