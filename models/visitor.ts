import mongoose, { Schema, Document } from "mongoose";

export interface VisitorDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  contact?: string;
  age?: number;
  organization?: string;
  industry?: string;
  linkedin?: string;
  idCardUrl?: string;
  idCardPublicId?: string;
}

const visitorSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email cannot be empty"],
      minlength: [5, "Email length must at-least 5 character long"],
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "First name cannot be empty"],
      minlength: [2, "First name must be at least 2 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name cannot be empty"],
      minlength: [2, "Last name must be at least 2 characters"],
      trim: true,
    },
    contact: {
      type: String,
      required: false,
      trim: true,
    },
    idCardUrl: {
      type: String,
      required: false,
    },
    idCardPublicId: {
      type: String,
      required: false,
    },
    age: {
      type: Number,
      required: false,
    },
    organization: {
      type: String,
      required: false,
      trim: true,
    },
    industry: {
      type: String,
      required: false,
      trim: true,
    },
    linkedin: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "visitor",
  }
);

const Visitor = mongoose.models.Visitor || mongoose.model<VisitorDocument>("Visitor", visitorSchema);

export default Visitor;
