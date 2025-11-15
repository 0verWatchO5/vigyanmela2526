import { NextResponse } from "next/server";
import Dbconns from "@/dbconfig/dbconn";
import CollegeStudent from "@/models/collegeStudent";
import bcryptjs from "bcryptjs";

export async function POST(request: Request) {
  try {
    await Dbconns();

    const body = await request.json();
    const {
      studentName,
      email,
      password,
      phoneNumber,
      collegeName,
      currentYear,
      rollNumber,
      projects,
    } = body;

    // Validation
    if (
      !studentName ||
      !email ||
      !password ||
      !phoneNumber ||
      !collegeName ||
      !currentYear ||
      !rollNumber ||
      !projects
    ) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingStudent = await CollegeStudent.findOne({ email });
    if (existingStudent) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Validate project count based on year
    const expectedProjects = currentYear === "2nd Year" ? 1 : 2;
    if (projects.length !== expectedProjects) {
      return NextResponse.json(
        {
          error: `${currentYear} students must upload exactly ${expectedProjects} project(s)`,
        },
        { status: 400 }
      );
    }

    // Validate project years for 3rd year students
    if (currentYear === "3rd Year") {
      const hasFirstYear = projects.some(
        (p: any) => p.projectYear === "First Year"
      );
      const hasSecondYear = projects.some(
        (p: any) => p.projectYear === "Second Year"
      );

      if (!hasFirstYear || !hasSecondYear) {
        return NextResponse.json(
          {
            error:
              "3rd Year students must upload one First Year project and one Second Year project",
          },
          { status: 400 }
        );
      }
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new student registration
    const newStudent = new CollegeStudent({
      studentName,
      email,
      password: hashedPassword,
      phoneNumber,
      collegeName,
      currentYear,
      rollNumber,
      projects,
    });

    await newStudent.save();

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Your application is pending approval.",
        data: {
          id: newStudent._id,
          email: newStudent.email,
          studentName: newStudent.studentName,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("College registration error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email or Roll Number already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
