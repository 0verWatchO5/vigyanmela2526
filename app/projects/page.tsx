"use client";

import { useEffect, useState } from "react";
import { SEGMENT_OPTIONS } from "@/models/collegeStudent";

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string>("all");

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
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && projects.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-24 w-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-xl font-semibold">No projects found</h3>
          <p className="mt-2 text-muted-foreground">
            {selectedSegment === "all" 
              ? "No approved projects yet. Check back soon!"
              : `No projects in "${selectedSegment}" segment yet.`}
          </p>
        </div>
      )}
    </div>
  );
}
