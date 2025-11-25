"use client";

import { useEffect, useState } from "react";
import TicketCard from "@/components/ui/TicketCard";

interface Visitor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact?: string;
  ticketCode?: string;
  age?: number;
  organization?: string;
  industry?: string;
  linkedin?: string;
  footfallApproved?: boolean;
  footfallCount?: number;
  createdAt?: string;
}

export function VisitorsManager() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Visitor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const fetchVisitors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/visitors");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch visitors");
      }

      setVisitors(data.visitors ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleEdit = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setEditForm({ ...visitor });
    setIsEditing(true);
  };

  const handleApproveFootfall = async (visitorId: string, approve: boolean) => {
    try {
      const response = await fetch("/api/visitors/approve-footfall", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, approve }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update footfall approval");
      }

      setVisitors((prev) =>
        prev.map((v) =>
          v._id === visitorId ? { ...v, footfallApproved: approve } : v
        )
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleIncrementFootfall = async (visitorId: string) => {
    try {
      const response = await fetch("/api/visitors/increment-footfall", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to increment footfall");
      }

      setVisitors((prev) =>
        prev.map((v) =>
          v._id === visitorId
            ? { ...v, footfallCount: data.visitor.footfallCount }
            : v
        )
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleSave = async () => {
    if (!editForm || !selectedVisitor) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/visitors/${selectedVisitor._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update visitor");
      }

      setVisitors((prev) =>
        prev.map((v) => (v._id === selectedVisitor._id ? data.visitor : v))
      );
      setIsEditing(false);
      setSelectedVisitor(null);
      setEditForm(null);
      alert("Visitor updated successfully!");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (visitorId: string) => {
    if (!confirm("Are you sure you want to delete this visitor ticket?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/visitors/${visitorId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete visitor");
      }

      setVisitors((prev) => prev.filter((v) => v._id !== visitorId));
      if (selectedVisitor?._id === visitorId) {
        setSelectedVisitor(null);
        setIsEditing(false);
      }
      alert("Visitor deleted successfully");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/admin/visitors/export");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to export Excel file");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `visitors_export_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      `${v.firstName} ${v.lastName}`.toLowerCase().includes(q) ||
      (v.email || "").toLowerCase().includes(q) ||
      (v.contact || "").includes(q) ||
      (v.industry || "").toLowerCase().includes(q) ||
      (v.organization || "").toLowerCase().includes(q) ||
      (v.ticketCode || "").toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto" />
          <p className="text-white/70 mt-4 text-sm">Loading visitors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-red-200 px-4 py-3 rounded-xl">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
          <p className="text-xs md:text-sm text-white/70">Total Visitors</p>
          <p className="text-2xl md:text-4xl font-bold text-white mt-1 md:mt-2 drop-shadow-lg">{visitors.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105">
          <p className="text-xs md:text-sm text-white/70">Company Representatives</p>
          <p className="text-2xl md:text-4xl font-bold text-cyan-400 mt-1 md:mt-2 drop-shadow-lg">
            {visitors.filter((v) => v.industry === "Visitor").length}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1">
          <p className="text-xs md:text-sm text-white/70">Media & Guests</p>
          <p className="text-2xl md:text-4xl font-bold text-green-400 mt-1 md:mt-2 drop-shadow-lg">
            {visitors.filter((v) => ["Media", "Guest", "Other"].includes(v.industry || "")).length}
          </p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-xl">
        <div className="flex flex-col gap-3 md:gap-4">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, contact, rol..."
            className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base bg-white/10 backdrop-blur-sm text-white rounded-lg md:rounded-xl border border-white/20 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 placeholder:text-white/50 transition-all"
          />
          <div className="flex flex-wrap gap-2">
            {/* View Mode Toggle */}
            <div className="flex gap-1 md:gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-xl p-0.5 md:p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                  viewMode === "table"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                📋 <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                  viewMode === "cards"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                🎫 <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
            <button
              onClick={fetchVisitors}
              className="px-3 md:px-4 py-1.5 md:py-2.5 rounded-lg md:rounded-xl bg-cyan-500/20 backdrop-blur-sm text-white border border-cyan-400/50 text-xs md:text-sm hover:bg-cyan-500 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 whitespace-nowrap"
              disabled={isLoading}
            >
              🔄 <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-3 md:px-4 py-1.5 md:py-2.5 rounded-lg md:rounded-xl bg-green-500/20 backdrop-blur-sm text-white border border-green-400/50 text-xs md:text-sm hover:bg-green-500 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
            >
              {isExporting ? "⏳" : "📥"} <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export Excel"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-left">
              <thead className="bg-white/5 backdrop-blur-sm uppercase text-xs text-white/70 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3">Ticket Code</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Footfall</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Registered</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-white/70">
                      {searchQuery ? "No visitors match your search." : "No visitors yet."}
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor._id} className="hover:bg-white/5 transition-all">
                      <td className="px-6 py-4">
                        <span className="font-mono text-cyan-400">{visitor.ticketCode || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">
                          {visitor.firstName} {visitor.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80">{visitor.email}</td>
                      <td className="px-6 py-4 text-white/80">{visitor.contact || "N/A"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{visitor.footfallCount || 0}</span>
                          <button
                            onClick={() => handleIncrementFootfall(visitor._id)}
                            className="px-2 py-1 bg-purple-500/20 backdrop-blur-sm text-white border border-purple-400/50 rounded hover:bg-purple-500 transition-all text-xs"
                            title="Increment footfall"
                          >
                            +1
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleApproveFootfall(visitor._id, !visitor.footfallApproved)}
                          className={`px-2 py-1 text-xs rounded-full transition-all ${
                            visitor.footfallApproved
                              ? 'bg-green-500/20 text-green-400 border border-green-400/50 hover:bg-green-500 hover:text-white'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-400/50 hover:bg-gray-500 hover:text-white'
                          }`}
                        >
                          {visitor.footfallApproved ? '✓ Approved' : '⊗ Approve'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-xs">
                        {visitor.createdAt
                          ? new Date(visitor.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedVisitor(visitor)}
                            className="px-3 py-1 bg-blue-500/20 backdrop-blur-sm text-white border border-blue-400/50 rounded-lg hover:bg-blue-500 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(visitor)}
                            className="px-3 py-1 bg-yellow-500/20 backdrop-blur-sm text-white border border-yellow-400/50 rounded-lg hover:bg-yellow-500 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(visitor._id)}
                            disabled={isDeleting}
                            className="px-3 py-1 bg-red-500/20 backdrop-blur-sm text-white border border-red-400/50 rounded-lg hover:bg-red-500 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50 text-xs"
                          >
                            Delete
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
      )}

      {/* Cards View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisitors.length === 0 ? (
            <div className="col-span-full text-center p-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
              <p className="text-white/70">
                {searchQuery ? "No visitors match your search." : "No visitors yet."}
              </p>
            </div>
          ) : (
            filteredVisitors.map((visitor) => (
              <div
                key={visitor._id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105"
              >
                {/* Ticket Card Content */}
                <div className="p-6 space-y-4">
                  {/* Logo */}
                  <div className="flex justify-center">
                    <div className="w-24 h-24 flex items-center justify-center">
                      <img 
                        src="/images/VN.png" 
                        alt="Vigyan Mela Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center space-y-1">
                    <p className="text-sm text-white/70">Visitor ID</p>
                    <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                      {visitor.industry || "Visitor"}
                    </h3>
                  </div>

                  {/* Date and Venue */}
                  <div className="space-y-3 py-3 border-y border-white/20">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 text-lg">📅</span>
                      <p className="text-sm text-white/80">
                        Thu, 11 Dec, 2025 – Fri, 12 Dec, 2025
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-red-400 text-lg">📍</span>
                      <p className="text-sm text-white/80">
                        706, 7th-floor, Chetana College Bandra (E), Mumbai, Maharashtra, India
                      </p>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-white">
                      Your Booking Details
                    </p>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 space-y-2 text-sm border border-white/10">
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/60">Ticket ID</span>
                        <span className="font-mono font-semibold text-white tracking-wider">
                          {visitor.ticketCode || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/60">Name</span>
                        <span className="font-medium text-white">
                          {visitor.firstName} {visitor.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/60">Phone</span>
                        <span className="font-medium text-white">
                          {visitor.contact || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-white/60">Email</span>
                        <span className="font-medium text-white text-xs break-all text-right">
                          {visitor.email}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {(visitor.organization || visitor.age) && (
                      <div className="bg-blue-500/10 backdrop-blur-sm rounded-lg p-3 space-y-1 text-sm border border-blue-400/30">
                        {visitor.organization && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Organization:</span>
                            <span className="font-medium text-white">
                              {visitor.organization}
                            </span>
                          </div>
                        )}
                        {visitor.age && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Age:</span>
                            <span className="font-medium text-white">
                              {visitor.age}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-center text-xs text-white/50 pt-2">
                      Present this ticket at entry. Valid ID may be required.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4 space-y-2">
                  {/* Main Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedVisitor(visitor)}
                      className="flex-1 px-3 py-2 bg-blue-500/20 backdrop-blur-sm text-white border border-blue-400/50 rounded-xl hover:bg-blue-500 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(visitor)}
                      className="flex-1 px-3 py-2 bg-yellow-500/20 backdrop-blur-sm text-white border border-yellow-400/50 rounded-xl hover:bg-yellow-500 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(visitor._id)}
                      disabled={isDeleting}
                      className="flex-1 px-3 py-2 bg-red-500/20 backdrop-blur-sm text-white border border-red-400/50 rounded-xl hover:bg-red-500 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  
                  {/* Footfall Status */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                    <span className="text-xs text-white/60">Footfall:</span>
                    <span className="text-sm font-semibold text-white">{visitor.footfallCount || 0}</span>
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${visitor.footfallApproved ? 'bg-green-500/20 text-green-400 border border-green-400/50' : 'bg-gray-500/20 text-gray-400 border border-gray-400/50'}`}>
                      {visitor.footfallApproved ? '✓ Approved' : '⊗ Not Approved'}
                    </span>
                  </div>
                  
                  {/* Footfall Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleIncrementFootfall(visitor._id)}
                      className="flex-1 px-3 py-2 bg-purple-500/20 backdrop-blur-sm text-white border border-purple-400/50 rounded-xl hover:bg-purple-500 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-xs font-medium"
                    >
                      +1 Footfall
                    </button>
                    <button
                      onClick={() => handleApproveFootfall(visitor._id, !visitor.footfallApproved)}
                      className={`flex-1 px-3 py-2 backdrop-blur-sm text-white border rounded-xl transition-all duration-300 text-xs font-medium ${
                        visitor.footfallApproved
                          ? 'bg-gray-500/20 border-gray-400/50 hover:bg-gray-500 hover:border-gray-500 hover:shadow-lg hover:shadow-gray-500/50'
                          : 'bg-green-500/20 border-green-400/50 hover:bg-green-500 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/50'
                      }`}
                    >
                      {visitor.footfallApproved ? 'Revoke Approval' : 'Approve Footfall'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View Modal */}
      {selectedVisitor && !isEditing && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setSelectedVisitor(null)}
        >
          <div 
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-2xl w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 py-4 border-b border-white/20">
              <div>
                <h2 className="text-2xl font-semibold text-white drop-shadow-lg">Visitor Ticket</h2>
                <p className="text-sm text-white/70 mt-1">
                  Registered on{" "}
                  {selectedVisitor.createdAt
                    ? new Date(selectedVisitor.createdAt).toLocaleString()
                    : "Unknown"}
                </p>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-3xl transition-all"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Ticket Card */}
              <div className="flex justify-center">
                <TicketCard
                  logoSrc="/images/VN.png"
                  attendingText="Visitor ID"
                  title={selectedVisitor.industry || "Visitor"}
                  venue="706, 7th-floor, Chetana College Bandra (E), Mumbai, Maharashtra, India"
                  dateRange="Thu, 11 Dec, 2025 – Fri, 12 Dec, 2025"
                  name={`${selectedVisitor.firstName} ${selectedVisitor.lastName}`}
                  email={selectedVisitor.email}
                  phone={selectedVisitor.contact || "N/A"}
                  ticketId={selectedVisitor.ticketCode || "AAA000"}
                />
              </div>

              {/* Additional Details */}
              <div className="grid md:grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Age</p>
                  <p className="text-white">{selectedVisitor.age || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Organization</p>
                  <p className="text-white">{selectedVisitor.organization || "N/A"}</p>
                </div>
                {selectedVisitor.linkedin && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 mb-1">LinkedIn Profile</p>
                    <a
                      href={selectedVisitor.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 underline break-all"
                    >
                      {selectedVisitor.linkedin}
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => handleEdit(selectedVisitor)}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  Edit Visitor
                </button>
                <button
                  onClick={() => handleDelete(selectedVisitor._id)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                >
                  Delete Visitor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && editForm && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => {
            setIsEditing(false);
            setEditForm(null);
            setSelectedVisitor(null);
          }}
        >
          <div
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-2xl w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 py-4 border-b border-white/20">
              <h2 className="text-2xl font-semibold text-white drop-shadow-lg">Edit Visitor</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(null);
                  setSelectedVisitor(null);
                }}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-3xl transition-all"
              >
                ×
              </button>
            </div>            <div className="px-6 py-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Contact</label>
                <input
                  type="tel"
                  value={editForm.contact || ""}
                  onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  maxLength={10}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={editForm.age || ""}
                    onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    min={10}
                    max={120}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                  <select
                    value={editForm.industry || ""}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Select Role</option>
                    <option value="Visitor">Company Representative</option>
                    <option value="Media">Media</option>
                    <option value="Guest">Guest</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={editForm.organization || ""}
                  onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={editForm.linkedin || ""}
                  onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm(null);
                    setSelectedVisitor(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
