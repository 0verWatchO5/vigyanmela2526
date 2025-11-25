"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StarRating from "./StarRating";

interface ReviewFormProps {
  projectId: string;
  projectName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  existingReview?: {
    _id: string;
    rating: number;
    comment: string;
  } | null;
  // Optional return URL to use when redirecting unauthenticated users to login
  loginReturnUrl?: string;
}

export default function ReviewForm({
  projectId,
  projectName,
  onSuccess,
  onCancel,
  existingReview,
  loginReturnUrl = "/projects",
}: ReviewFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check authentication
    if (status === "unauthenticated") {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(loginReturnUrl)}`);
      return;
    }

    if (status === "loading") {
      return;
    }

    // Validation
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (comment.trim().length === 0) {
      setError("Please write a comment");
      return;
    }

    setSubmitting(true);

    try {
      const url = existingReview
        ? `/api/reviews/${existingReview._id}`
        : `/api/reviews`;
      
      const method = existingReview ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Success
      if (onSuccess) {
        onSuccess();
      }

      // Reset form if creating new review
      if (!existingReview) {
        setRating(0);
        setComment("");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Rating
        </label>
        <StarRating
          rating={rating}
          interactive
          onRatingChange={setRating}
          size="lg"
        />
      </div>

      <div>
        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Your Review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Write your review for ${projectName}...`}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting || status === "loading"}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {submitting
            ? "Submitting..."
            : existingReview
            ? "Update Review"
            : "Submit Review"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
