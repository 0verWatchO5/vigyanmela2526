import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import Dbconns from "@/dbconfig/dbconn";
import fileupload from "@/models/fileupload";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  try {

    await Dbconns();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 20MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "vigyanmela_documents",
          transformation: [
            { width: 1920, height: 1920, crop: "limit" }, // Limit max dimensions
            { quality: "auto:good" }, // Auto optimize quality
          ],
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const newDoc = new fileupload({
      filename: file.name,
      filetype: file.type,
      filesize: file.size,
      width: uploadResult.width,
      height: uploadResult.height,
      uploadedAt: new Date(),
      uploadedBy: title, // Using title as uploader name
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
    });

    await newDoc.save();

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully",
        data: {
          id: newDoc._id,
          filename: newDoc.filename,
          url: newDoc.url,
          publicId: newDoc.publicId,
          size: newDoc.filesize,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    
    return NextResponse.json(
      {
        error: "File upload failed",
        details: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}