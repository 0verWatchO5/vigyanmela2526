"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UsersTable } from "./UsersTable";
import { UsersGrid } from "./UsersGrid";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { AdminManagement } from "./AdminManagement";
import { CollegeStudentsManager } from "./CollegeStudentsManager";
import TicketCard from "@/components/ui/TicketCard";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  idCardUrl: string;
  idCardPublicId: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
}

type TabType = "users" | "college-students" | "admins" | "settings" | "visitors";

export function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [visitors, setVisitors] = useState<Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    contact?: string;
    industry?: string;
    organization?: string;
    createdAt?: string;
  }>>([]);

  const checkSuperAdmin = async () => {
    try {
      const response = await fetch("/api/eventheads/check-auth");
      const data = await response.json();
      setIsSuperAdmin(data.adminData?.isSuperAdmin || false);
    } catch (error) {
      // ignore
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/eventheads/users");

      if (response.status === 401) {
        router.push("/eventheads/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVisitors = async () => {
    try {
      const res = await fetch("/api/visitors");
      if (!res.ok) {
        throw new Error("Failed to fetch visitors");
      }
      const data = await res.json();
      setVisitors(data.visitors || []);
    } catch (err) {
      console.error("Failed to load visitors", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    checkSuperAdmin();
    fetchVisitors();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/eventheads/logout", { method: "POST" });
      router.push("/eventheads/login");
    } catch (error) {
      
    }
  };

  const handleExportToExcel = async () => {
    try {
      const response = await fetch("/api/eventheads/users/export");
      
      if (!response.ok) {
        throw new Error("Failed to export users");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      
      alert("Failed to export users. Please try again.");
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.contact.includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <p className="text-red-500">Error: {error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage registered users for Vigyan Mela 25
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "users"
                ? "text-blue-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            👥 Users Management
            {activeTab === "users" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("college-students")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "college-students"
                ? "text-blue-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🎓 College Students
            {activeTab === "college-students" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("visitors")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "visitors"
                ? "text-blue-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🧾 Visitors
            {activeTab === "visitors" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab("admins")}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === "admins"
                  ? "text-blue-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              👑 Admin Management
              {activeTab === "admins" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "settings"
                ? "text-blue-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ⚙️ Settings
            {activeTab === "settings" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
        </div>
      </div>

      {}
      {activeTab === "users" ? (
        <>
          {}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-border rounded-lg p-4">
                <p className="text-muted-foreground text-sm">Total Users</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {users.length}
                </p>
              </div>
              <div className="bg-zinc-900 border border-border rounded-lg p-4">
                <p className="text-muted-foreground text-sm">Admin Users</p>
                <p className="text-3xl font-bold text-green-500 mt-1">
                  {users.filter((u) => u.isAdmin).length}
                </p>
              </div>
              <div className="bg-zinc-900 border border-border rounded-lg p-4">
                <p className="text-muted-foreground text-sm">Regular Users</p>
                <p className="text-3xl font-bold text-blue-500 mt-1">
                  {users.filter((u) => !u.isAdmin).length}
                </p>
              </div>
            </div>
          </div>

          {}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-zinc-900 border border-border rounded-lg p-4">
              {}
              <input
                type="text"
                placeholder="Search by name, email, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {}
              <div className="flex gap-2">
                <div className="flex gap-2 bg-background border border-border rounded-md p-1">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "table"
                        ? "bg-blue-500 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    📋 Table
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-blue-500 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    📱 Cards
                  </button>
                </div>

                {}
                <button
                  onClick={handleExportToExcel}
                  className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500 rounded-md hover:bg-green-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  📊 Export to Excel
                </button>
              </div>
            </div>
          </div>

          {}
          <div className="max-w-7xl mx-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center p-12 border border-border rounded-lg">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No users found matching your search."
                    : "No users registered yet."}
                </p>
              </div>
            ) : (
              <>
                {viewMode === "table" ? (
                  <UsersTable users={filteredUsers} isSuperAdmin={isSuperAdmin} onRefresh={fetchUsers} />
                ) : (
                  <UsersGrid users={filteredUsers} isSuperAdmin={isSuperAdmin} onRefresh={fetchUsers} />
                )}
              </>
            )}
          </div>
        </>
      ) : activeTab === "college-students" ? (
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              College Students Registration
            </h2>
            <p className="text-sm text-muted-foreground">
              View and manage college student project registrations
            </p>
          </div>
          <CollegeStudentsManager />
        </div>
      ) : activeTab === "admins" ? (

        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Admin Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage admin accounts, reset passwords, and assign admin roles
            </p>
          </div>
          <AdminManagement />
        </div>
      ) : (
        activeTab === "settings" ? (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Account Settings
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your admin account security and preferences
              </p>
            </div>
            <ChangePasswordForm />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Visitors</h2>
              <p className="text-sm text-muted-foreground">Recent visitors who registered for the event</p>
            </div>

            {/* Visitors search */}
            <div className="max-w-7xl mx-auto mb-6">
              <div className="flex items-stretch gap-4 bg-zinc-900 border border-border rounded-lg p-4">
                <input
                  type="text"
                  placeholder="Search visitors by name, contact, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-zinc-800 text-sm text-foreground border border-border rounded-md hover:bg-zinc-700"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visitors.length === 0 ? (
                <div className="p-6 border border-border rounded-lg text-muted-foreground">No visitors yet.</div>
              ) : (
                visitors
                  .filter((v) => {
                    const q = searchQuery.toLowerCase();
                    if (!q) return true;
                    return (
                      `${v.firstName} ${v.lastName}`.toLowerCase().includes(q) ||
                      (v.contact || "").includes(q) ||
                      (v.industry || "").toLowerCase().includes(q)
                    );
                  })
                  .map((v) => (
                    <div key={v._id} className="flex justify-center">
                      <TicketCard
                        logoSrc="/images/VN.png"
                        attendingText="Visitor ID"
                        title={v.industry || "Visitor"}
                        venue="706, 7th-floor, Chetana College Bandra (E), Mumbai, Maharashtra, India"
                        name={`${v.firstName} ${v.lastName}`}
                        email={v.email || "-"}
                        phone={v.contact || "-"}
                      />
                    </div>
                  ))
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
