import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Dbconns from "@/dbconfig/dbconn";
import User from "@/models/registration";
import PasswordResetToken from "@/models/passwordResetToken";

export async function POST(req: NextRequest) {
  try {
    const { email, token, password } = await req.json();
    if (!email || !token || !password) {
      return NextResponse.json({ error: "Email, token, and password are required." }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    await Dbconns();

    const user = await User.findOne({ email: email.toLowerCase() }).select("_id +password");
    if (!user) {
      return NextResponse.json({ error: "Invalid reset token or email." }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await PasswordResetToken.findOne({ userId: user._id, tokenHash });
    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    if (resetToken.expiresAt.getTime() < Date.now()) {
      await resetToken.deleteOne();
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    await PasswordResetToken.deleteMany({ userId: user._id });

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to reset password." }, { status: 500 });
  }
}
