"use client";

import React, { useState, useEffect } from "react";

interface Project {
  projectYear: string;
  projectName: string;
  projectDescription: string;
  projectCategory: string;
  projectPhotos: string[];
  projectDocumentation: string;
  projectLink: string;
  technologyStack: string[];
  targetAudience: string[];
}

interface CollegeStudent {
  _id: string;
  studentName: string;
  email: string;
  phoneNumber: string;
  collegeName: string;
  currentYear: string;
  academicSession?: string;
  rollNumber: string;
  projects: Project[];
  createdAt: string;
  status?: string;
}

export function CollegeStudentsManager() {
  const [students, setStudents] = useState<CollegeStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<CollegeStudent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<CollegeStudent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/college-students");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch students");
      }

      setStudents(data.students);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setStudentToDelete(studentId);

    try {
      const response = await fetch(`/api/admin/college-students/${studentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete student");
      }

      // Remove from local state
      setStudents(students.filter((s) => s._id !== studentId));
      
      // Close modal if viewing deleted student
      if (selectedStudent?._id === studentId) {
        setSelectedStudent(null);
      }

      alert("Student deleted successfully");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsDeleting(false);
      setStudentToDelete(null);
    }
  };

  const handleApprove = async (studentId: string) => {
    try {
      const response = await fetch(`/api/admin/college-students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve student");
      }

      // Update local state
      setStudents(students.map((s) => 
        s._id === studentId ? { ...s, status: "approved" } : s
      ));

      alert("Student approved successfully");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleReject = async (studentId: string) => {
    try {
      const response = await fetch(`/api/admin/college-students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject student");
      }

      // Update local state
      setStudents(students.map((s) => 
        s._id === studentId ? { ...s, status: "rejected" } : s
      ));

      alert("Student rejected successfully");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleEditStudent = (student: CollegeStudent) => {
    setEditingStudent({ ...student });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/college-students/${editingStudent._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: editingStudent.studentName,
          email: editingStudent.email,
          phoneNumber: editingStudent.phoneNumber,
          collegeName: editingStudent.collegeName,
          currentYear: editingStudent.currentYear,
          academicSession: editingStudent.academicSession,
          rollNumber: editingStudent.rollNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update student");
      }

      // Update local state
      setStudents(students.map((s) => 
        s._id === editingStudent._id ? { ...s, ...editingStudent } : s
      ));

      alert("Student updated successfully");
      setIsEditModalOpen(false);
      setEditingStudent(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.collegeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Students</p>
          <p className="text-3xl font-bold text-white mt-1">{students.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">2nd Year Students</p>
          <p className="text-3xl font-bold text-cyan-500 mt-1">
            {students.filter((s) => s.currentYear === "2nd Year").length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">3rd Year Students</p>
          <p className="text-3xl font-bold text-blue-500 mt-1">
            {students.filter((s) => s.currentYear === "3rd Year").length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <input
          type="text"
          placeholder="Search by name, email, college, or roll number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* Students Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    {searchQuery ? "No students found matching your search" : "No students registered yet"}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-zinc-800/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{student.studentName}</p>
                        <p className="text-gray-400 text-sm">{student.email}</p>
                        <p className="text-gray-500 text-xs">Roll: {student.rollNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm">{student.collegeName}</p>
                      <p className="text-gray-400 text-xs">{student.phoneNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-300">
                          {student.currentYear}
                        </span>
                        {student.status && (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              student.status === "approved"
                                ? "bg-green-500/20 text-green-300"
                                : student.status === "rejected"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-yellow-500/20 text-yellow-300"
                            }`}
                          >
                            {student.status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{student.projects.length} project(s)</p>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          disabled={isDeleting && studentToDelete === student._id}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting && studentToDelete === student._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Student Details</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleApprove(selectedStudent._id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleReject(selectedStudent._id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm"
                >
                  ✗ Reject
                </button>
                <button
                  onClick={() => handleDelete(selectedStudent._id)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm disabled:opacity-50"
                >
                  🗑 Delete
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-white text-2xl ml-2"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                <h3 className="text-lg font-semibold text-white mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Name</p>
                    <p className="text-white">{selectedStudent.studentName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p className="text-white">{selectedStudent.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">College</p>
                    <p className="text-white">{selectedStudent.collegeName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Current Year</p>
                    <p className="text-white">{selectedStudent.currentYear}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Academic Session</p>
                    <p className="text-white">{selectedStudent.academicSession || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Roll Number</p>
                    <p className="text-white">{selectedStudent.rollNumber}</p>
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Projects</h3>
                {selectedStudent.projects.map((project, index) => (
                  <div key={index} className="bg-zinc-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-cyan-400">
                        {project.projectName}
                      </h4>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">
                        {project.projectYear}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm">{project.projectDescription}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Category</p>
                        <p className="text-white">{project.projectCategory}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Target Audience</p>
                        <div className="flex flex-wrap gap-1">
                          {project.targetAudience.map((aud, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-300">
                              {aud}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {project.technologyStack.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Tech Stack</p>
                        <div className="flex flex-wrap gap-2">
                          {project.technologyStack.map((tech, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.projectPhotos.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Photos ({project.projectPhotos.length})</p>
                        <div className="grid grid-cols-4 gap-2">
                          {project.projectPhotos.map((photo, i) => (
                            <a
                              key={i}
                              href={photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="aspect-square rounded-lg overflow-hidden border border-zinc-700 hover:border-cyan-500 transition"
                            >
                              <img
                                src={photo}
                                alt={`Project ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.projectLink && (
                      <div>
                        <p className="text-gray-400 text-sm">Project Link</p>
                        <a
                          href={project.projectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm underline"
                        >
                          {project.projectLink}
                        </a>
                      </div>
                    )}

                    {project.projectDocumentation && (
                      <div>
                        <p className="text-gray-400 text-sm">Documentation</p>
                        <a
                          href={project.projectDocumentation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm underline"
                        >
                          View PDF Documentation
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Student</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={editingStudent.studentName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, studentName: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editingStudent.phoneNumber}
                  onChange={(e) => setEditingStudent({ ...editingStudent, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  College Name
                </label>
                <input
                  type="text"
                  value={editingStudent.collegeName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, collegeName: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={editingStudent.rollNumber}
                  onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Academic Session
                </label>
                <input
                  type="text"
                  value={editingStudent.academicSession || ""}
                  onChange={(e) => setEditingStudent({ ...editingStudent, academicSession: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2025-26"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Current Year
                </label>
                <select
                  value={editingStudent.currentYear}
                  onChange={(e) => setEditingStudent({ ...editingStudent, currentYear: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingStudent(null);
                }}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
