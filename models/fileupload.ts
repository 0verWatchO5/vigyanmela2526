import mongoose, { Schema } from "mongoose";

export interface UploadedImages {

  _id?: string;
  filename: string;
  filetype: string;
  filesize: number;
  width?: number;
  height?: number;
  uploadedAt: Date;
  uploadedBy: string;
  publicId:string,
  url:string
}

const uploadDocuments = new Schema({
  filename: {
    type: String,
    require: [true, "file name is cannot be empty"],
    index: true,
  },

  filetype: {
    type: String,
    require: true,
    enum: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  filesize: {
    type: Number,
    require: true,
  },

  width: {
    type: Number,
    default: null,
  },
  height: {
    type: Number,
    default: null,
  },

  uploadedAt: {
    type: Date,
    index: true,
    default: Date.now,
  },

  uploadedBy: {
    type: String,
    default: "anonymous",
  },

  publicId: { type: String, required: true },  //cloudinary public id
  url: { type: String, required: true },
});


const uploadDocs = mongoose.models.Documents || mongoose.model<UploadedImages>("Documents",uploadDocuments)

export default uploadDocs;