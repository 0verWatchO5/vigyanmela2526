import mongoose, { Schema, Document, models } from "mongoose";

export interface PasswordResetTokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
}

const passwordResetTokenSchema = new Schema<PasswordResetTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken =
  models.PasswordResetToken || mongoose.model<PasswordResetTokenDocument>("PasswordResetToken", passwordResetTokenSchema);

export default PasswordResetToken;
