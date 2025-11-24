import React from "react";
import Dbconns from "@/dbconfig/dbconn";
import CollegeStudent from "@/models/collegeStudent";
import Review from "@/models/review";
import { notFound } from "next/navigation";
import ReviewForm from "@/components/reviews/ReviewForm";
import StarRating from "@/components/reviews/StarRating";

type Props = {
  params: {
    id: string;
  };
};

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = params;

  await Dbconns();

  // Try find by uuid first, then fallback to ObjectId
  let project = await CollegeStudent.findOne({ uuid: id }).lean();

  if (!project) {
    const mongoose = await import("mongoose");
    if (mongoose.isValidObjectId(id)) {
      project = await CollegeStudent.findById(id).lean();
    }
  }

  if (!project) {
    notFound();
  }

  // Fetch reviews for this project (only visible ones)
  const reviews = await Review.find({ projectId: project._id, hidden: false })
    .sort({ createdAt: -1 })
    .lean();

  // Cast to `any` for safe runtime mutation and convert any non-primitive
  // values (ObjectId, Date) to strings so they can be rendered or passed
  // to client components without Next serialization errors.
  const projectAny: any = project as any;
  projectAny._id = projectAny._id?.toString?.() ?? projectAny._id;
  if (projectAny.uuid && typeof projectAny.uuid !== "string") {
    projectAny.uuid = String(projectAny.uuid);
  }

  const reviewsSafe = (reviews || []).map((r: any) => ({
    ...r,
    _id: r._id?.toString?.() ?? r._id,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : r.createdAt,
    updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : r.updatedAt,
  }));

  const totalReviews = reviewsSafe.length;
  const averageRating = totalReviews > 0
    ? Math.round((reviewsSafe.reduce((s: number, r: any) => s + (r.rating || 0), 0) / totalReviews) * 10) / 10
    : 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{projectAny.teamName}</h1>
              <div className="flex items-center gap-3">
                <StarRating rating={averageRating} size="md" showNumber />
                <div className="text-sm text-gray-700 dark:text-gray-300">{averageRating} • {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 text-right">Project ID: <span className="font-mono text-gray-800 dark:text-gray-200">{projectAny.uuid ?? projectAny._id}</span></div>
          </div>

          {projectAny.projectImage && (
            <div className="mb-6 overflow-hidden rounded-lg shadow">
              <img src={projectAny.projectImage} alt={projectAny.teamName} className="w-full object-cover" style={{height: 420}} />
            </div>
          )}

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Project Summary</h2>
            <p className="leading-relaxed text-gray-800 dark:text-gray-200">{projectAny.projectSummary}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Reviews</h2>

            <div className="space-y-4">
              {reviewsSafe.length === 0 && (
                <div className="text-gray-700 dark:text-gray-300">No reviews yet. Be the first to review this project!</div>
              )}

              {reviewsSafe.map((r: any) => (
                <div key={r._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{r.reviewerName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(r.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-yellow-500 font-semibold">{r.rating} / 5</div>
                  </div>
                  <p className="mt-2 text-gray-700 dark:text-gray-200">{r.comment}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>
            <ReviewForm projectId={projectAny._id.toString()} projectName={projectAny.teamName} loginReturnUrl={`/projects/${projectAny.uuid ?? projectAny._id}`} />
          </section>
        </div>

        <aside className="md:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Details</h3>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                {projectAny.slotId && <div>Slot: <span className="font-medium text-gray-900 dark:text-gray-100">{projectAny.slotId}</span></div>}
                {projectAny.roomNo && <div>Room: <span className="font-medium text-gray-900 dark:text-gray-100">{projectAny.roomNo}</span></div>}
                <div>Team Size: <span className="font-medium text-gray-900 dark:text-gray-100">{projectAny.teamSize}</span></div>
                <div>Status: <span className="font-medium text-gray-900 dark:text-gray-100">{projectAny.registrationStatus ?? 'pending'}</span></div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Segments</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(projectAny.segments || []).map((seg: string) => (
                  <span key={seg} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm dark:bg-blue-900 dark:text-blue-200">{seg}</span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Team Members</h3>
              <div className="mt-3 space-y-2">
                {projectAny.teamMembers.map((m: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{m.fullName}</div>
                    <div className="text-gray-600 dark:text-gray-300">{m.department} — {m.yearOfStudy}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
