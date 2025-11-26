import mongoose, { Schema, Document } from "mongoose";

export interface VisitorDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  contact?: string;
  ticketCode?: string;
  age?: number;
  organization?: string;
  industry?: string;
  linkedin?: string;
  idCardUrl?: string;
  idCardPublicId?: string;
  footfallApproved: boolean;
  footfallCount: number;
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
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      uppercase: true,
      minlength: [6, "Ticket code must be 6 characters"],
      maxlength: [6, "Ticket code must be 6 characters"],
      match: [/^[A-Z]{3}\d{3}$/, "Ticket code must have 3 letters followed by 3 digits"],
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
    footfallApproved: {
      type: Boolean,
      default: false,
      required: true,
    },
    footfallCount: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "visitor",
  }
);

const Visitor = mongoose.models.Visitor || mongoose.model<VisitorDocument>("Visitor", visitorSchema);

export default Visitor;
