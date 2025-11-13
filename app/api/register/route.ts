import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import Dbconns from "@/dbconfig/dbconn";
import users from "@/models/registration";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {

    await Dbconns();

    const formData = await request.formData();
    
    const firstName = formData.get("firstname") as string;
    const lastName = formData.get("lastname") as string;
    const email = formData.get("email") as string;
    const contact = formData.get("contact") as string;
    const idCardFile = formData.get("idcard") as File;

    if (!firstName || !lastName || !email || !contact || !idCardFile) {
      return NextResponse.json(
        { error: "All fields are required including ID card" },
        { status: 400 }
      );
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (contact.length < 10) {
      return NextResponse.json(
        { error: "Contact number must be at least 10 digits" },
        { status: 400 }
      );
    }

    const existingUser = await users.findOne({
      $or: [{ email }, { contact }],
    });
    
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

    if (!ALLOWED_FILE_TYPES.includes(idCardFile.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    if (idCardFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 20MB" },
        { status: 400 }
      );
    }

    const bytes = await idCardFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "vigyanmela_idcards",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" }, // Limit max dimensions
            { quality: "auto:good" }, // Auto optimize quality
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const newUser = new users({
      firstName,
      lastName,
      email,
      contact,
      idCardUrl: uploadResult.secure_url,
      idCardPublicId: uploadResult.public_id,
      isAdmin: false,
    });

    await newUser.save();

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      const fieldName = field === 'email' ? 'email address' : field === 'contact' ? 'contact number' : field;
      
      return NextResponse.json(
        {
          error: `A user with this ${fieldName} already exists`,
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
