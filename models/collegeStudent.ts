import mongoose from "mongoose";

export const DEPARTMENT_OPTIONS = [
  "BSc. IT",
  "BMS",
  "BAF",
  "BBA",
  "BFM",
  "BMM",
];

export const YEAR_OF_STUDY_OPTIONS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
];

export const SEGMENT_OPTIONS = [
  "Technology & Innovation",
  "Environment & Sustainability",
  "Health & Education",
  "Social Good",
  "Creative Science",
];

const teamMemberSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: DEPARTMENT_OPTIONS,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    contactNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
    },
    yearOfStudy: {
      type: String,
      required: true,
      enum: YEAR_OF_STUDY_OPTIONS,
    },
  },
  { _id: false }
);

const collegeStudentSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    projectSummary: {
      type: String,
      required: true,
      trim: true,
    },
    teamSize: {
      type: Number,
      required: true,
      enum: [2, 3, 4],
    },
    segments: {
      type: [
        {
          type: String,
          enum: SEGMENT_OPTIONS,
        },
      ],
      required: true,
      validate: {
        validator: (segments: string[]) => Array.isArray(segments) && segments.length > 0,
        message: "Select at least one segment",
      },
    },
    teamMembers: {
      type: [teamMemberSchema],
      required: true,
      validate: {
        validator(this: { teamSize: number }, members: unknown[]): boolean {
          return Array.isArray(members) && members.length === this.teamSize;
        },
        message: "Team member count must match the provided team size",
      },
    },
    linkedinId: {
      type: String,
      sparse: true,
    },
    registrationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

collegeStudentSchema.index({ teamName: 1 });
collegeStudentSchema.index({ "teamMembers.email": 1 });
collegeStudentSchema.index({ "teamMembers.rollNumber": 1 });
collegeStudentSchema.index({ registrationStatus: 1 });

delete mongoose.models.CollegeStudent;

const CollegeStudent = mongoose.model("CollegeStudent", collegeStudentSchema);

export default CollegeStudent;
