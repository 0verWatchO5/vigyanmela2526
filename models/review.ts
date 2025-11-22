import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReview extends Document {
  projectId: mongoose.Types.ObjectId;
  reviewerName: string;
  reviewerEmail: string;
  reviewerLinkedIn?: string;
  rating: number;
  comment: string;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "CollegeStudent",
      required: true,
      index: true,
    },
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    reviewerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    reviewerLinkedIn: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding user's review on specific project
reviewSchema.index({ projectId: 1, reviewerEmail: 1 });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);

export default Review;
