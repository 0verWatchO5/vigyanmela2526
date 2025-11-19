import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectYear: {
    type: String,
    required: true,
    enum: ["First Year", "Second Year"],
  },
  projectName: {
    type: String,
    required: true,
    trim: true,
  },
  projectDescription: {
    type: String,
    required: true,
  },
  projectCategory: {
    type: String,
    required: true,
    enum: [
      "Web Development",
      "Mobile App Development",
      "AI/ML",
      "Data Science",
      "IoT",
      "Blockchain",
      "Cybersecurity",
      "Game Development",
      "AR/VR",
      "Cloud Computing",
      "Other",
    ],
  },
  projectPhotos: [{
    type: String, // Cloudinary URLs
  }],
  projectDocumentation: {
    type: String, // Cloudinary URL for PDF
    default: null,
  },
  projectLink: {
    type: String,
    default: null,
  },
  technologyStack: [{
    type: String,
  }],
  targetAudience: [{
    type: String,
    required: true,
  }],
});

const collegeStudentSchema = new mongoose.Schema(
  {
    // Personal Details
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    collegeName: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
    },
    currentYear: {
      type: String,
      required: [true, "Current year of study is required"],
      enum: ["2nd Year", "3rd Year"],
    },
    academicSession: {
      type: String,
      required: [true, "Academic session is required"],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      trim: true,
    },
    linkedinId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Projects
    projects: {
      type: [projectSchema],
      validate: {
        validator: function (projects: any[]) {
          if (this.currentYear === "2nd Year") {
            return projects.length === 1;
          } else if (this.currentYear === "3rd Year") {
            return projects.length === 2;
          }
          return false;
        },
        message: function (props: any) {
          const year = props.instance.currentYear;
          const expected = year === "2nd Year" ? 1 : 2;
          return `${year} students must upload exactly ${expected} project(s)`;
        },
      },
    },

    // Metadata
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

// Index for faster queries
collegeStudentSchema.index({ email: 1 });
collegeStudentSchema.index({ rollNumber: 1 });
collegeStudentSchema.index({ currentYear: 1 });

// Delete existing model if it exists (for hot reloading)
delete mongoose.models.CollegeStudent;

const CollegeStudent = mongoose.model("CollegeStudent", collegeStudentSchema);

export default CollegeStudent;
