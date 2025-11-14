import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Resend } from "resend";
import Dbconns from "@/dbconfig/dbconn";
import Visitor from "@/models/visitor";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {

    await Dbconns();

    const formData = await request.formData();
    
    const firstName = formData.get("firstname") as string;
    const lastName = formData.get("lastname") as string;
    const email = formData.get("email") as string;
    const contact = formData.get("contact") as string;
    const ageVal = formData.get("age") as string;
    const organization = formData.get("organization") as string;
    const industry = formData.get("industry") as string;
    const linkedin = (formData.get("linkedin") as string) || "";
    // const idCardFile = formData.get("idcard") as File;

    console.log("[register] incoming form values:", {
      firstName,
      lastName,
      email,
      contact,
      age: ageVal,
      organization,
      industry,
      linkedin,
    });

    if (!firstName || !lastName || !email || !contact || !ageVal || !organization || !industry) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (contact.length < 10) {
      return NextResponse.json(
        { error: "Contact number must be at least 10 digits" },
        { status: 400 }
      );
    }

    const age = parseInt(ageVal as string, 10);
    if (isNaN(age) || age < 10 || age > 120) {
      return NextResponse.json({ error: "Please provide a valid age between 10 and 120" }, { status: 400 });
    }

    // Check duplicates in visitors collection (we only store visitors)
    const existingVisitor = await Visitor.findOne({ $or: [{ email }, { contact }] });
    if (existingVisitor) {
      if (existingVisitor.email === email) {
        return NextResponse.json(
          { error: "A visitor with this email already exists" },
          { status: 409 }
        );
      } else if (existingVisitor.contact === contact) {
        return NextResponse.json(
          { error: "A visitor with this contact number already exists" },
          { status: 409 }
        );
      }
    }

    // const uploadResult = await new Promise<any>((resolve, reject) => {
    //   const uploadStream = cloudinary.uploader.upload_stream(
    //     {
    //       resource_type: "image",
    //       folder: "vigyanmela_idcards",
    //       transformation: [
    //         { width: 1200, height: 1200, crop: "limit" }, // Limit max dimensions
    //         { quality: "auto:good" }, // Auto optimize quality
    //       ],
    //     },
    //     (error, result) => {
    //       if (error) reject(error);
    //       else resolve(result);
    //     }
    //   );
    //   // uploadStream.end(buffer);
    // });

    // Create and save only a Visitor document
    const visitor = new Visitor({
      firstName,
      lastName,
      email,
      contact,
      age,
      organization,
      industry,
      linkedin,
      // idCardUrl: uploadResult?.secure_url,
      // idCardPublicId: uploadResult?.public_id,
    });

    const savedVisitor = await visitor.save();
    console.log("[register] visitor saved id:", savedVisitor._id?.toString?.());

    // Send confirmation email via Resend (if API key is available)
    let emailStatus: { ok: boolean; info?: any; error?: string } = { ok: false };
    try {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const html = `
          <p>Hi ${savedVisitor.firstName || "there"},</p>
          <p>You're registered for <strong>VigyanMela 2526</strong>. Check your email for your ticket.</p>
          <p>Thanks,<br/>VigyanMela Team</p>
        `;
        console.log("[register] sending confirmation email to:", savedVisitor.email);

        const resp = await resend.emails.send({
          from: process.env.RESEND_FROM || "onboarding@resend.dev",
          to: savedVisitor.email,
          subject: "VigyanMela 2526 — Registration confirmed",
          html,
        });

        emailStatus = { ok: true, info: resp };
        console.log("[register] resend send response:", resp);
      } else {
        emailStatus = { ok: false, error: "RESEND_API_KEY not configured" };
        console.warn("[register] RESEND_API_KEY not configured");
      }
    } catch (err: any) {
      emailStatus = { ok: false, error: err?.message || String(err) };
      console.error("[register] resend error:", err);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: {
          id: savedVisitor._id,
          firstName: savedVisitor.firstName,
          lastName: savedVisitor.lastName,
          email: savedVisitor.email,
          contact: savedVisitor.contact,
          age: savedVisitor.age,
          organization: savedVisitor.organization,
          industry: savedVisitor.industry,
          linkedin: savedVisitor.linkedin,
          idCardUrl: savedVisitor.idCardUrl || null,
        },
        email: emailStatus,
      },
      { status: 201 }
    );
  } catch (error: any) {
    

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      const fieldName = field === 'email' ? 'email address' : field === 'contact' ? 'contact number' : field;
      
      return NextResponse.json(
        {
          error: `A visitor with this ${fieldName} already exists`,
        },
        { status: 409 }
      );
    }



    return NextResponse.json(
      {
        error: "Registration failed",
        details: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
