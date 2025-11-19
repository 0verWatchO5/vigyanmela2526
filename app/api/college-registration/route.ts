import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Dbconns from "@/dbconfig/dbconn";
import CollegeStudent, {
  DEPARTMENT_OPTIONS,
  SEGMENT_OPTIONS,
  YEAR_OF_STUDY_OPTIONS,
} from "@/models/collegeStudent";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ALLOWED_TEAM_SIZES = [2, 3, 4] as const;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^[0-9]{10}$/;

type TeamSizeValue = typeof ALLOWED_TEAM_SIZES[number];

type RawTeamMember = {
  fullName?: string;
  department?: string;
  email?: string;
  contactNumber?: string;
  rollNumber?: string;
  yearOfStudy?: string;
};

type NormalizedMember = {
  fullName: string;
  department: string;
  email: string;
  contactNumber: string;
  rollNumber: string;
  yearOfStudy: string;
};

type NormalizedSubmission = {
  teamName: string;
  projectSummary: string;
  teamSize: TeamSizeValue;
  segments: string[];
  teamMembers: NormalizedMember[];
};

type SanitizedRegistration = NormalizedSubmission & {
  id: string;
  registrationStatus: string;
  submittedAt?: string;
  updatedAt?: string;
};

let collegeIndexesSynced = false;

async function ensureCollegeIndexes() {
  if (collegeIndexesSynced) return;

  try {
    await CollegeStudent.syncIndexes();
  } catch (error) {
    console.error("CollegeStudent index sync error:", error);
  } finally {
    collegeIndexesSynced = true;
  }
}

async function requireLinkedInId(): Promise<string | null> {
  const session = (await getServerSession(authOptions as any)) as any;
  const rawId = session?.user?.id;

  if (typeof rawId !== "string" || !rawId.trim()) {
    return null;
  }

  return rawId;
}

function sanitizeRegistration(doc: any): SanitizedRegistration {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;

  const members: NormalizedMember[] = Array.isArray(obj?.teamMembers)
    ? obj.teamMembers.map((member: any) => ({
        fullName: member.fullName,
        department: member.department,
        email: member.email,
        contactNumber: member.contactNumber,
        rollNumber: member.rollNumber,
        yearOfStudy: member.yearOfStudy,
      }))
    : [];

  return {
    id: obj?._id?.toString?.() ?? obj?.id ?? "",
    teamName: obj.teamName,
    projectSummary: obj.projectSummary,
    teamSize: obj.teamSize as TeamSizeValue,
    segments: Array.isArray(obj.segments) ? obj.segments : [],
    teamMembers: members,
    registrationStatus: obj.registrationStatus ?? "pending",
    submittedAt: obj.submittedAt ? new Date(obj.submittedAt).toISOString() : undefined,
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined,
  };
}

function normalizeTeamMember(raw: RawTeamMember, index: number): NormalizedMember {
  const fullName = typeof raw?.fullName === "string" ? raw.fullName.trim() : "";
  if (!fullName) {
    throw new Error(`Member ${index + 1} is missing a full name`);
  }

  const department = typeof raw?.department === "string" ? raw.department.trim() : "";
  if (!DEPARTMENT_OPTIONS.includes(department)) {
    throw new Error(`Member ${index + 1} has an invalid department`);
  }

  const email = typeof raw?.email === "string" ? raw.email.trim().toLowerCase() : "";
  if (!EMAIL_REGEX.test(email)) {
    throw new Error(`Member ${index + 1} has an invalid email address`);
  }

  const contactNumber = typeof raw?.contactNumber === "string" ? raw.contactNumber.trim() : "";
  if (!PHONE_REGEX.test(contactNumber)) {
    throw new Error(`Member ${index + 1} must have a 10-digit contact number`);
  }

  const rollNumber = typeof raw?.rollNumber === "string" ? raw.rollNumber.trim() : "";
  if (!rollNumber) {
    throw new Error(`Member ${index + 1} is missing a roll number`);
  }

  const yearOfStudy = typeof raw?.yearOfStudy === "string" ? raw.yearOfStudy.trim() : "";
  if (!YEAR_OF_STUDY_OPTIONS.includes(yearOfStudy)) {
    throw new Error(`Member ${index + 1} has an invalid year of study`);
  }

  return {
    fullName,
    department,
    email,
    contactNumber,
    rollNumber,
    yearOfStudy,
  };
}

function hasDuplicate(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

function validateAndNormalizeSubmission(body: unknown): NormalizedSubmission {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid submission payload");
  }

  const payload = body as Record<string, unknown>;

  const teamName = typeof payload.teamName === "string" ? payload.teamName.trim() : "";
  if (!teamName) {
    throw new Error("Team name is required");
  }

  const projectSummary =
    typeof payload.projectSummary === "string" ? payload.projectSummary.trim() : "";
  if (!projectSummary) {
    throw new Error("Project summary is required");
  }

  const numericTeamSize = Number(payload.teamSize);
  if (
    !Number.isInteger(numericTeamSize) ||
    !ALLOWED_TEAM_SIZES.includes(numericTeamSize as TeamSizeValue)
  ) {
    throw new Error("Team size must be 2, 3, or 4 members");
  }
  const teamSize = numericTeamSize as TeamSizeValue;

  const rawSegments = Array.isArray(payload.segments) ? payload.segments : [];
  const normalizedSegments = Array.from(
    new Set(
      rawSegments
        .map((segment): string => (typeof segment === "string" ? segment.trim() : ""))
        .filter((segment): segment is string => SEGMENT_OPTIONS.includes(segment))
    )
  );
  if (normalizedSegments.length === 0) {
    throw new Error("Please select at least one valid segment");
  }

  const rawMembers = Array.isArray(payload.teamMembers)
    ? (payload.teamMembers as RawTeamMember[])
    : [];
  if (rawMembers.length !== teamSize) {
    throw new Error("Provide details for each team member");
  }

  const teamMembers = rawMembers.map((raw, index) => normalizeTeamMember(raw, index));

  const emails = teamMembers.map((member) => member.email);
  if (hasDuplicate(emails)) {
    throw new Error("Each team member must use a unique email address");
  }

  const rollNumbers = teamMembers.map((member) => member.rollNumber.toLowerCase());
  if (hasDuplicate(rollNumbers)) {
    throw new Error("Each team member must use a unique roll number");
  }

  return {
    teamName,
    projectSummary,
    teamSize,
    segments: normalizedSegments,
    teamMembers,
  };
}

export async function GET() {
  try {
    await Dbconns();
    await ensureCollegeIndexes();

    const linkedinId = await requireLinkedInId();
    if (!linkedinId) {
      return NextResponse.json(
        { error: "Sign-in required" },
        { status: 401 }
      );
    }

    const existing = await CollegeStudent.findOne({ linkedinId }).lean();
    if (!existing) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    return NextResponse.json({ data: sanitizeRegistration(existing) }, { status: 200 });
  } catch (error) {
    console.error("College registration lookup error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load registration" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await Dbconns();
    await ensureCollegeIndexes();

    const linkedinId = await requireLinkedInId();
    if (!linkedinId) {
      return NextResponse.json(
        { error: "Please sign in to submit your registration" },
        { status: 401 }
      );
    }

    let submission: NormalizedSubmission;
    try {
      const payload = await request.json();
      submission = validateAndNormalizeSubmission(payload);
    } catch (validationError) {
      return NextResponse.json(
        {
          error:
            (validationError as Error).message || "Invalid registration details",
        },
        { status: 400 }
      );
    }

    const existingByLinkedIn = await CollegeStudent.findOne({ linkedinId }).lean();
    if (existingByLinkedIn) {
      return NextResponse.json(
        {
          error:
            "You have already submitted a registration. Use the edit option to update it.",
        },
        { status: 409 }
      );
    }

    const newRegistration = new CollegeStudent({
      ...submission,
      linkedinId,
    });

    await newRegistration.save();

    return NextResponse.json(
      {
        success: true,
        message: "Registration submitted successfully",
        data: sanitizeRegistration(newRegistration),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("College registration error:", error);

    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate entry detected. Please refresh and try again." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || "Registration failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await Dbconns();
    await ensureCollegeIndexes();

    const linkedinId = await requireLinkedInId();
    if (!linkedinId) {
      return NextResponse.json(
        { error: "Please sign in to update your registration" },
        { status: 401 }
      );
    }

    let submission: NormalizedSubmission;
    try {
      const payload = await request.json();
      submission = validateAndNormalizeSubmission(payload);
    } catch (validationError) {
      return NextResponse.json(
        {
          error:
            (validationError as Error).message || "Invalid registration details",
        },
        { status: 400 }
      );
    }

    const existingRegistration = await CollegeStudent.findOne({ linkedinId });
    if (!existingRegistration) {
      return NextResponse.json(
        { error: "No registration found to update" },
        { status: 404 }
      );
    }

    existingRegistration.set({
      teamName: submission.teamName,
      projectSummary: submission.projectSummary,
      teamSize: submission.teamSize,
      segments: submission.segments,
      teamMembers: submission.teamMembers,
    });

    await existingRegistration.save();

    return NextResponse.json(
      {
        success: true,
        message: "Registration updated successfully",
        data: sanitizeRegistration(existingRegistration),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("College registration update error:", error);

    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate entry detected. Please refresh and try again." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || "Update failed" },
      { status: 500 }
    );
  }
}