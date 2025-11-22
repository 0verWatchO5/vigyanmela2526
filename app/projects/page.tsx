"use client";

import { useEffect, useState } from "react";
import { SEGMENT_OPTIONS } from "@/models/collegeStudent";
import StarRating from "@/components/reviews/StarRating";
import ReviewPanel from "@/components/reviews/ReviewPanel";
import { SessionProvider } from "next-auth/react";

interface TeamMember {
  fullName: string;
  department: string;
  email: string;
  contactNumber: string;
  rollNumber: string;
  yearOfStudy: string;
}

interface Project {
  _id: string;
  teamName: string;
  projectSummary: string;
  projectImage?: string;
  segments: string[];
  slotId?: string;
  roomNo?: string;
  teamMembers: TeamMember[];
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviewStats, setReviewStats] = useState<Record<string, ReviewStats>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [reviewPanelOpen, setReviewPanelOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [selectedSegment]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const url = selectedSegment === "all" 
        ? "/api/projects" 
        : `/api/projects?segment=${encodeURIComponent(selectedSegment)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        console.log('Projects data:', data.projects);
        console.log('First project slotId/roomNo:', data.projects[0]?.slotId, data.projects[0]?.roomNo);
        setProjects(data.projects);
        
        // Fetch review stats for all projects
        fetchAllReviewStats(data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReviewStats = async (projectsList: Project[]) => {
    const stats: Record<string, ReviewStats> = {};
    
    await Promise.all(
      projectsList.map(async (project) => {
        try {
          const response = await fetch(`/api/reviews/stats?projectId=${project._id}`);
          const data = await response.json();
          stats[project._id] = data;
        } catch (error) {
          console.error(`Error fetching stats for project ${project._id}:`, error);
          stats[project._id] = { averageRating: 0, totalReviews: 0 };
        }
      })
    );
    
    setReviewStats(stats);
  };

  const handleOpenReviews = (project: Project) => {
    setSelectedProject(project);
    setReviewPanelOpen(true);
  };

  const handleCloseReviews = () => {
    setReviewPanelOpen(false);
    // Refresh stats when panel closes (in case reviews were added/edited)
    if (selectedProject) {
      fetchAllReviewStats(projects);
    }
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.teamName.toLowerCase().includes(query) ||
      project.projectSummary.toLowerCase().includes(query) ||
      project.segments.some((seg) => seg.toLowerCase().includes(query)) ||
      project.teamMembers.some((member) => member.fullName.toLowerCase().includes(query))
    );
  });

  return (
    <SessionProvider>
      <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Project Showcase
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore innovative projects from talented teams participating in Vigyan Mela 2526
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setSelectedSegment("all")}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            selectedSegment === "all"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          All Projects
        </button>
        {SEGMENT_OPTIONS.map((segment) => (
          <button
            key={segment}
            onClick={() => setSelectedSegment(segment)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              selectedSegment === segment
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {segment}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex justify-center">
        <div className="w-full max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${selectedSegment === "all" ? "all" : selectedSegment} projects by name, team, or description...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
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
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && filteredProjects.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg shadow-blue-200 dark:shadow-none dark:shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-1"
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative">
                {/* Project Image */}
                {project.projectImage && (
                  <div className="mb-4 relative h-48 w-full overflow-hidden rounded-xl">
                    <img
                      src={project.projectImage}
                      alt={project.teamName}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Team Name */}
                <h3 className="text-2xl font-bold mb-3 line-clamp-2">
                  {project.teamName}
                </h3>

                {/* Segments */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.segments.map((segment) => (
                    <span
                      key={segment}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {segment}
                    </span>
                  ))}
                </div>

                {/* Project Summary */}
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {project.projectSummary}
                </p>

                {/* Slot & Room Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                  {project.slotId && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Slot: {project.slotId}</span>
                    </div>
                  )}
                  {project.roomNo && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Room: {project.roomNo}</span>
                    </div>
                  )}
                  {!project.slotId && !project.roomNo && (
                    <span className="text-xs italic">Slot & Room not assigned yet</span>
                  )}
                </div>

                {/* Review Stats with Blend Effect */}
                {reviewStats[project._id] && reviewStats[project._id].totalReviews > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-r from-yellow-400 to-orange-400 blur-md opacity-50"></div>
                        <div className="relative flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg px-3 py-1">
                          <StarRating
                            rating={reviewStats[project._id].averageRating}
                            size="sm"
                            showNumber
                          />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({reviewStats[project._id].totalReviews} {reviewStats[project._id].totalReviews === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  </div>
                )}

                {/* Team Members Preview */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">TEAM MEMBERS</p>
                  <div className="space-y-1">
                    {project.teamMembers.slice(0, 2).map((member, idx) => (
                      <p key={idx} className="text-sm truncate">
                        {member.fullName} <span className="text-muted-foreground">({member.department})</span>
                      </p>
                    ))}
                    {project.teamMembers.length > 2 && (
                      <p className="text-sm text-muted-foreground">
                        +{project.teamMembers.length - 2} more
                      </p>
                    )}
                  </div>
                </div>

                {/* Reviews Button */}
                <button
                  onClick={() => handleOpenReviews(project)}
                  className="mt-4 w-full rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  View Reviews
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-24 w-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-xl font-semibold">No projects found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchQuery 
              ? `No projects match "${searchQuery}" in "${selectedSegment === "all" ? "all segments" : selectedSegment}".`
              : `${selectedSegment === "all" 
                ? "No approved projects yet. Check back soon!"
                : `No projects in "${selectedSegment}" segment yet.`}`}
          </p>
        </div>
      )}

      {/* Review Panel */}
      {selectedProject && (
        <ReviewPanel
          projectId={selectedProject._id}
          projectName={selectedProject.teamName}
          isOpen={reviewPanelOpen}
          onClose={handleCloseReviews}
        />
      )}
    </div>
    </SessionProvider>
  );
}
