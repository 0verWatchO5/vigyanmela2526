import mongoose, { Schema, Document } from "mongoose";

export interface SiteSettingsDocument extends Document {
  strictFootfallEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema(
  {
    strictFootfallEnabled: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "siteSettings",
  }
);

const SiteSettings = 
  mongoose.models.SiteSettings || 
  mongoose.model<SiteSettingsDocument>("SiteSettings", siteSettingsSchema);

export default SiteSettings;
