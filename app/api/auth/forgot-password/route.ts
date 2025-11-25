import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import Dbconns from "@/dbconfig/dbconn";
import User from "@/models/registration";
import PasswordResetToken from "@/models/passwordResetToken";

const TOKEN_TTL_MINUTES = 60;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await Dbconns();

    const user = await User.findOne({ email: email.toLowerCase() }).select("_id firstName password");

    if (!user || !user.password) {
      // respond success to avoid hinting which emails exist
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
    }

    await PasswordResetToken.deleteMany({ userId: user._id });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    await PasswordResetToken.create({ userId: user._id, tokenHash, expiresAt });

    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
    const resetUrl = `${baseUrl}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    let emailError: string | null = null;

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const html = `
          <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',sans-serif;line-height:1.4;color:#111;">
            <p style="margin:0 0 12px">Hi ${user.firstName || "there"},</p>
            <p style="margin:0 0 12px">We received a request to reset your Vigyan Mela account password.</p>
            <p style="margin:0 0 16px">Click the button below to choose a new password.</p>
            <p style="margin:0 0 24px;text-align:center">
              <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0a66c2;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Reset password</a>
            </p>
            <p style="margin:0 0 12px">If you did not request this change, you can safely ignore this email. The link expires in ${TOKEN_TTL_MINUTES} minutes.</p>
            <p style="margin:16px 0 0;color:#555">Thanks,<br/>Vigyan Mela Team</p>
          </div>
        `;

        await resend.emails.send({
          from: process.env.RESEND_FROM || "placements@chetanacollege.in",
          to: email,
          subject: "Reset your Vigyan Mela password",
          html,
        });
      } catch (error: any) {
        emailError = error?.message || "Email service failed.";
      }
    } else {
      emailError = "Email service not configured.";
    }

    if (emailError) {
      return NextResponse.json(
        { error: "We could not send the reset email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to request password reset." }, { status: 500 });
  }
}
