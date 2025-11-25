"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UsersTable } from "./UsersTable";
import { UsersGrid } from "./UsersGrid";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { AdminManagement } from "./AdminManagement";
import { CollegeStudentsManager } from "./CollegeStudentsManager";
import ReviewsManager from "./ReviewsManager";
import { VisitorsManager } from "./VisitorsManager";

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

type TabType = "users" | "college-students" | "reviews" | "admins" | "settings" | "visitors";

export function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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

  useEffect(() => {
    fetchUsers();
    checkSuperAdmin();
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
      <div className="flex items-center justify-center min-h-screen relative">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
        <div className="text-center space-y-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-white/80">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 relative">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
        <div className="text-center space-y-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <p className="text-red-400">Error: {error}</p>
          <button
            onClick={fetchUsers}
            className="px-6 py-2.5 bg-blue-500/20 backdrop-blur-sm text-white border border-blue-400/50 rounded-xl hover:bg-blue-500 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-purple-950 dark:via-blue-950 dark:to-indigo-950"></div>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent dark:from-cyan-600/10"></div>
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              Admin Dashboard
            </h1>
            <p className="text-white/80 mt-1">
              Manage registered users for Vigyan Mela 25
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-red-500/20 backdrop-blur-sm text-white border border-red-400/50 rounded-xl hover:bg-red-500 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-2 shadow-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-medium transition-all duration-300 rounded-xl whitespace-nowrap ${
              activeTab === "users"
                ? "bg-white/20 backdrop-blur-sm text-white shadow-lg shadow-blue-500/50 border border-white/30"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            👥 Users Management
          </button>
          <button
            onClick={() => setActiveTab("college-students")}
            className={`px-6 py-3 font-medium transition-all duration-300 rounded-xl whitespace-nowrap ${
              activeTab === "college-students"
                ? "bg-white/20 backdrop-blur-sm text-white shadow-lg shadow-blue-500/50 border border-white/30"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            🎓 College Students
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-3 font-medium transition-all duration-300 rounded-xl whitespace-nowrap ${
              activeTab === "reviews"
                ? "bg-white/20 backdrop-blur-sm text-white shadow-lg shadow-blue-500/50 border border-white/30"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            ⭐ Reviews
          </button>
          <button
            onClick={() => setActiveTab("visitors")}
            className={`px-6 py-3 font-medium transition-all duration-300 rounded-xl whitespace-nowrap ${
              activeTab === "visitors"
                ? "bg-white/20 backdrop-blur-sm text-white shadow-lg shadow-blue-500/50 border border-white/30"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            🧾 Visitors
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab("admins")}
              className={`px-6 py-3 font-medium transition-all duration-300 rounded-xl whitespace-nowrap ${
                activeTab === "admins"
                  ? "bg-white/20 backdrop-blur-sm text-white shadow-lg shadow-blue-500/50 border border-white/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              👑 Admin Management
            </button>
          )}
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 font-medium transition-all duration-300 rounded-xl whitespace-nowrap ${
              activeTab === "settings"
                ? "bg-white/20 backdrop-blur-sm text-white shadow-lg shadow-blue-500/50 border border-white/30"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {}
      {activeTab === "users" ? (
        <>
          {/* Stats Cards */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                <p className="text-white/70 text-sm">Total Users</p>
                <p className="text-4xl font-bold text-white mt-2 drop-shadow-lg">
                  {users.length}
                </p>
              </div>
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
                <p className="text-white/70 text-sm">Admin Users</p>
                <p className="text-4xl font-bold text-green-400 mt-2 drop-shadow-lg">
                  {users.filter((u) => u.isAdmin).length}
                </p>
              </div>
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105">
                <p className="text-white/70 text-sm">Regular Users</p>
                <p className="text-4xl font-bold text-cyan-400 mt-2 drop-shadow-lg">
                  {users.filter((u) => !u.isAdmin).length}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl">
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search by name, email, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
              />

              {/* View Controls */}
              <div className="flex gap-2">
                <div className="flex gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      viewMode === "table"
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    📋 Table
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    📱 Cards
                  </button>
                </div>

                {/* Export Button */}
                <button
                  onClick={handleExportToExcel}
                  className="px-4 py-2 bg-green-500/20 backdrop-blur-sm text-white border border-green-400/50 rounded-xl hover:bg-green-500 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                >
                  📊 Export to Excel
                </button>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="max-w-7xl mx-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center p-12 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl shadow-xl">
                <p className="text-white/70">
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
          <div className="mb-6 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white drop-shadow-lg mb-2">
              College Students Registration
            </h2>
            <p className="text-sm text-white/70">
              View and manage college student project registrations
            </p>
          </div>
          <CollegeStudentsManager />
        </div>
      ) : activeTab === "reviews" ? (
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white drop-shadow-lg mb-2">
              Reviews Management
            </h2>
            <p className="text-sm text-white/70">
              View and manage all project reviews
            </p>
          </div>
          <ReviewsManager />
        </div>
      ) : activeTab === "admins" ? (

        <div className="max-w-7xl mx-auto">
          <div className="mb-6 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white drop-shadow-lg mb-2">
              Admin Management
            </h2>
            <p className="text-sm text-white/70">
              Manage admin accounts, reset passwords, and assign admin roles
            </p>
          </div>
          <AdminManagement />
        </div>
      ) : (
        activeTab === "settings" ? (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white drop-shadow-lg mb-2">
                Account Settings
              </h2>
              <p className="text-sm text-white/70">
                Manage your admin account security and preferences
              </p>
            </div>
            <ChangePasswordForm />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white drop-shadow-lg mb-2">Visitors Management</h2>
              <p className="text-sm text-white/70">Manage visitor registrations and tickets</p>
            </div>
            <VisitorsManager />
          </div>
        )
      )}
    </div>
  );
}
