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
  const [strictFootfallEnabled, setStrictFootfallEnabled] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetchReviews();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const response = await fetch("/api/settings");
      const data = await response.json();

      if (data.success) {
        setStrictFootfallEnabled(data.settings.strictFootfallEnabled);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleToggleStrictFootfall = async () => {
    try {
      const newValue = !strictFootfallEnabled;
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strictFootfallEnabled: newValue }),
      });

      const data = await response.json();

      if (data.success) {
        setStrictFootfallEnabled(newValue);
      } else {
        alert(data.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("An error occurred while updating settings");
    }
  };

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
      <div className="flex items-center justify-center py-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        <span className="ml-3 text-white/80">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
              Reviews Management
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Total Reviews: {reviews.length}
            </p>
          </div>
          
          {/* Strict Footfall Toggle */}
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Strict Footfall Verification</p>
              <p className="text-xs text-white/60 mt-0.5">
                {strictFootfallEnabled 
                  ? "Only approved visitors can review" 
                  : "Any logged-in user can review"}
              </p>
            </div>
            <button
              onClick={handleToggleStrictFootfall}
              disabled={loadingSettings}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                strictFootfallEnabled ? 'bg-green-500' : 'bg-gray-500'
              } ${loadingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  strictFootfallEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by project, reviewer, email, or comment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg md:rounded-xl border border-white/20 px-3 md:px-4 py-2 md:py-3 pl-10 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm md:text-base"
        />
     
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto rounded-lg md:rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5 backdrop-blur-sm">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                Project
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                Reviewer
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                Rating
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                Comment
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                Date
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 md:px-6 py-12 text-center text-white/70">
                  {searchQuery
                    ? "No reviews match your search"
                    : "No reviews yet"}
                </td>
              </tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div>
                      <p className="font-medium text-white text-sm md:text-base">
                        {review.projectName}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {review.projectSegments.map((segment) => (
                          <span
                            key={segment}
                            className="inline-block rounded-full bg-blue-500/20 border border-blue-400/50 px-2 py-0.5 text-xs text-blue-300"
                          >
                            {segment}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {review.reviewerName}
                      </p>
                      <p className="text-xs text-white/60">
                        {review.reviewerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <StarRating rating={review.rating} size="sm" />
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <p className="max-w-xs truncate text-sm text-white/80">
                      {review.comment}
                    </p>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-white/70">
                    {formatDate(review.createdAt)}
                    {review.createdAt !== review.updatedAt && (
                      <span className="block text-xs text-white/50">
                        (edited)
                      </span>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <button
                      onClick={() => handleDelete(review._id)}
                      disabled={deleting === review._id}
                      className="text-sm font-medium px-3 py-1.5 bg-red-500/20 backdrop-blur-sm text-white border border-red-400/50 rounded-lg hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105">
          <p className="text-xs md:text-sm text-white/70">Total Reviews</p>
          <p className="text-2xl md:text-3xl font-bold text-white mt-1 md:mt-2 drop-shadow-lg">{reviews.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-105">
          <p className="text-xs md:text-sm text-white/70">Average Rating</p>
          <p className="text-2xl md:text-3xl font-bold text-yellow-400 mt-1 md:mt-2 drop-shadow-lg">
            {reviews.length > 0
              ? (
                  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                ).toFixed(1)
              : "0.0"}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1">
          <p className="text-xs md:text-sm text-white/70">Unique Reviewers</p>
          <p className="text-2xl md:text-3xl font-bold text-green-400 mt-1 md:mt-2 drop-shadow-lg">
            {new Set(reviews.map((r) => r.reviewerEmail)).size}
          </p>
        </div>
      </div>
    </div>
  );
}
