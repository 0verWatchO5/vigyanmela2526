"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";

interface Review {
  _id: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewPanelProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewPanel({
  projectId,
  projectName,
  isOpen,
  onClose,
}: ReviewPanelProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const limit = 5;

  // Load reviews
  const loadReviews = async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    const currentSkip = reset ? 0 : skip;

    try {
      const response = await fetch(
        `/api/reviews?projectId=${projectId}&limit=${limit}&skip=${currentSkip}`
      );
      const data = await response.json();

      if (reset) {
        setReviews(data.reviews);
        setSkip(limit);
      } else {
        setReviews((prev) => [...prev, ...data.reviews]);
        setSkip((prev) => prev + limit);
      }

      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial reviews when panel opens
  useEffect(() => {
    if (isOpen && projectId) {
      loadReviews(true);
    }
  }, [isOpen, projectId]);

  // Infinite scroll handler
  const handleScroll = () => {
    if (!scrollRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    
    // Load more when user scrolls to 80% of the content
    if (scrollHeight - scrollTop <= clientHeight * 1.2) {
      loadReviews();
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [loading, hasMore, skip]);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    loadReviews(true); // Reload all reviews
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadReviews(true); // Reload all reviews
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("An error occurred while deleting the review");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl transform bg-white shadow-2xl transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Reviews: {projectName}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          ref={scrollRef}
          className="h-[calc(100%-80px)] overflow-y-auto p-6"
        >
          {/* Add Review Button - Only show to authenticated users */}
          {!showForm && session && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-6 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-4 text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
            >
              + Add Your Review
            </button>
          )}

          {/* Sign In Prompt - Only show to unauthenticated users */}
          {!showForm && !session && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 text-center">
              <p className="mb-4 text-gray-700">
                Sign in to leave a review
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    window.location.href = `/auth/login?returnUrl=/projects`;
                  }}
                  className="rounded-lg bg-gray-800 px-6 py-2 text-white hover:bg-gray-900"
                >
                  Sign in with Email
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300"></span>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-gray-500">or</span>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const { signIn } = await import("next-auth/react");
                    signIn("linkedin", { callbackUrl: `/projects` });
                  }}
                  className="rounded-lg bg-[#0a66c2] px-6 py-2 text-white hover:bg-[#004182]"
                >
                  Sign in with LinkedIn
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="/auth/signup" className="text-blue-600 hover:underline">
                  Sign up here
                </a>
              </p>
            </div>
          )}

          {/* Review Form */}
          {showForm && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                {editingReview ? "Edit Your Review" : "Write a Review"}
              </h3>
              <ReviewForm
                projectId={projectId}
                projectName={projectName}
                existingReview={editingReview}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setEditingReview(null);
                }}
              />
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <StarRating rating={review.rating} size="sm" />
                    <p className="mt-1 font-semibold text-gray-900">
                      {review.reviewerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                      {review.createdAt !== review.updatedAt && " (edited)"}
                    </p>
                  </div>

                  {/* Edit/Delete buttons for own reviews */}
                  {session?.user?.email === review.reviewerEmail && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(review)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="py-4 text-center text-gray-500">
                Loading more reviews...
              </div>
            )}

            {/* No more reviews */}
            {!hasMore && reviews.length > 0 && (
              <div className="py-4 text-center text-gray-500">
                No more reviews
              </div>
            )}

            {/* No reviews yet */}
            {!loading && reviews.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                No reviews yet. Be the first to review!
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
