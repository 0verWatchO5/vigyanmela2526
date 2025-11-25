import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Resend } from "resend";
import Dbconns from "@/dbconfig/dbconn";
import Visitor from "@/models/visitor";
import User from "@/models/registration";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";

function createTicketCode() {
  let letterPart = "";
  let digitPart = "";
  for (let i = 0; i < 3; i += 1) {
    letterPart += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    digitPart += DIGITS[Math.floor(Math.random() * DIGITS.length)];
  }
  return `${letterPart}${digitPart}`;
}

async function generateUniqueTicketCode(attempt = 0): Promise<string> {
  const code = createTicketCode();
  const exists = await Visitor.exists({ ticketCode: code });
  if (exists) {
    if (attempt >= 7) {
      throw new Error("Could not generate unique ticket code");
    }
    return generateUniqueTicketCode(attempt + 1);
  }
  return code;
}

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

    const age = parseInt(ageVal as string, 10);
    if (isNaN(age) || age < 10 || age > 120) {
      return NextResponse.json({ error: "Please provide a valid age between 10 and 120" }, { status: 400 });
    }

    // Check if user is authenticated via LinkedIn (session exists)
    const session = await getServerSession(authOptions as any) as any;
    const isLinkedInAuth = !!(session && session.user && session.user.email);

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

    // Also check in User collection to prevent duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { contact }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        );
      } else if (existingUser.contact === contact) {
        return NextResponse.json(
          { error: "A user with this contact number already exists" },
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

    // Helper to escape HTML entities (basic)
    const escape = (val: string) =>
      val
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    // Create and save only a Visitor document
    const ticketCode = await generateUniqueTicketCode();

    const visitor = new Visitor({
      firstName,
      lastName,
      email,
      contact,
      age,
      organization,
      industry,
      linkedin,
      ticketCode,
      // idCardUrl: uploadResult?.secure_url,
      // idCardPublicId: uploadResult?.public_id,
    });

    const savedVisitor = await visitor.save();
    console.log("[register] visitor saved id:", savedVisitor._id?.toString?.());

    // If user authenticated via LinkedIn, also create a User record
    // This allows them to appear in the User Management tab
    let savedUser = null;
    if (isLinkedInAuth) {
      try {
        const user = new User({
          firstName,
          lastName,
          email,
          contact,
          age,
          organization,
          industry,
          linkedin: linkedin || session?.user?.image || "", // Store LinkedIn profile or use session image
          idCardUrl: "", // No ID card for LinkedIn users
          idCardPublicId: "", // No ID card for LinkedIn users
          isAdmin: false,
          isSuperAdmin: false,
          // No password - they can only sign in via LinkedIn
        });

        savedUser = await user.save();
        console.log("[register] LinkedIn user also saved in User collection, id:", savedUser._id?.toString?.());
      } catch (userError: any) {
        console.error("[register] Failed to create User record for LinkedIn auth:", userError);
        // Don't fail the whole registration if User creation fails
        // The visitor record is already created
      }
    }

    // Build ticket card HTML, centered with border and VN logo
    const origin = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")) || new URL(request.url).origin;
    const logoUrl = `${origin}/images/VN.png`;
    const ticketHtml = `
      <div style="width:100%;text-align:center;">
        <div style="display:inline-block;text-align:left;max-width:360px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:20px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',sans-serif;color:#111;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
          <div style="text-align:center;margin-bottom:12px;">
            <img src="${logoUrl}" alt="Logo" style="height:60px;width:60px;object-fit:contain" />
          </div>
          <div style="text-align:center;">
            <p style="margin:0;font-size:12px;color:#555">You are attending</p>
            <h1 style="margin:4px 0 0;font-size:20px;font-weight:600">Vigyan Mela 25</h1>
          </div>
          <hr style="margin:16px 0;border:none;border-top:1px solid #eee" />
          <div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#444;margin-bottom:6px;">
            <div style="color:#0a66c2;font-size:14px">📅</div>
            <div>Thu, 11 Dec, 2025 – Fri, 12 Dec, 2025</div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#444;">
            <div style="color:#d93025;font-size:14px">📍</div>
            <div>706, 7th floor, Chetana College Bandra (E), Mumbai, Maharashtra, India</div>
          </div>
          <hr style="margin:16px 0;border:none;border-top:1px solid #f0f0f0" />
          <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#555">Your Booking Details</p>
          <div style="background:#f8f9fa;border-radius:12px;padding:10px 12px;font-size:12px;">
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #ebedef;">
              <span style="color:#666">Ticket ID: </span><span style="font-weight:600;color:#222;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;letter-spacing:1px;">${escape(ticketCode)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #ebedef;">
              <span style="color:#666">Name: </span><span style="font-weight:500;color:#222">${escape(firstName)} ${escape(lastName)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;">
              <span style="color:#666">Phone: </span><span style="font-weight:500;color:#222">${escape(contact)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #ebedef;">
              <span style="color:#666">Email: </span><span style="font-weight:500;color:#222">${escape(email)}</span>
            </div>
          </div>
          <p style="margin:12px 0 0;text-align:center;font-size:10px;color:#888">Present this ticket at entry. Valid ID may be required.</p>
        </div>
      </div>
    `;

    // Send confirmation email via Resend (if API key is available)
    let emailStatus: { ok: boolean; info?: any; error?: string } = { ok: false };
    try {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const html = `
          <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',sans-serif;line-height:1.4;color:#111;">
            <p style="margin:0 0 12px">Hi ${escape(savedVisitor.firstName) || "there"},</p>
            <p style="margin:0 0 12px">You're registered for <strong>Vigyan Mela 25</strong>. Below is your digital ticket.</p>
            ${ticketHtml}
            <p style="margin:16px 0 8px">Add the event to your calendar and follow us on LinkedIn!</p>
            <p style="margin:0;color:#555">Thanks,<br/>VigyanMela Team</p>
          </div>
        `;
        console.log("[register] sending confirmation email to:", savedVisitor.email);

        const resp = await resend.emails.send({
          from: "Vigyan Mela 2025 <placements@chetanacollege.in>",
          to: savedVisitor.email,
          subject: "Vigyan Mela 25 — Registration confirmed",
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
          ticketCode: savedVisitor.ticketCode,
          ticketHtml,
          userId: savedUser?._id || null, // Include user ID if created
          linkedInAuth: isLinkedInAuth, // Flag to indicate auth method
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
