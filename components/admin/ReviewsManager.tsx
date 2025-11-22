"use client";

import React, { useState, useEffect } from "react";
import StarRating from "../reviews/StarRating";

interface Review {
  _id: string;
  projectName: string;
  projectSegments: string[];
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/reviews");
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews);
      } else {
        console.error("Failed to fetch reviews:", data.error);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      setDeleting(reviewId);
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setReviews(reviews.filter((r) => r._id !== reviewId));
      } else {
        alert(data.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("An error occurred while deleting the review");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter reviews based on search query
  const filteredReviews = reviews.filter((review) => {
    const query = searchQuery.toLowerCase();
    return (
      review.projectName.toLowerCase().includes(query) ||
      review.reviewerName.toLowerCase().includes(query) ||
      review.reviewerEmail.toLowerCase().includes(query) ||
      review.comment.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Reviews Management
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Total Reviews: {reviews.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by project, reviewer, email, or comment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Reviewer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {searchQuery
                    ? "No reviews match your search"
                    : "No reviews yet"}
                </td>
              </tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.projectName}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {review.projectSegments.map((segment) => (
                          <span
                            key={segment}
                            className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
                          >
                            {segment}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {review.reviewerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {review.reviewerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StarRating rating={review.rating} size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-xs truncate text-sm text-gray-700">
                      {review.comment}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                    {review.createdAt !== review.updatedAt && (
                      <span className="block text-xs text-gray-400">
                        (edited)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(review._id)}
                      disabled={deleting === review._id}
                      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:text-gray-400"
                    >
                      {deleting === review._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-2xl font-bold text-gray-900">
            {reviews.length > 0
              ? (
                  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                ).toFixed(1)
              : "0.0"}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Unique Reviewers</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Set(reviews.map((r) => r.reviewerEmail)).size}
          </p>
        </div>
      </div>
    </div>
  );
}
