"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/form-inputs";
import { Label, LabelInputContainer, BottomGradient } from "@/components/ui/form-components";

interface Admin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
}

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetModal, setResetModal] = useState<{ show: boolean; admin: Admin | null }>({
    show: false,
    admin: null,
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/eventheads/admins");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch admins");
      }

      setAdmins(data.admins);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetModal.admin) return;

    if (!newPassword || !confirmPassword) {
      setStatusMessage({
        type: "error",
        message: "Please fill all fields",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: "error",
        message: "Passwords do not match",
      });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMessage({
        type: "error",
        message: "Password must be at least 6 characters",
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: null, message: "" });

    try {
      const response = await fetch("/api/eventheads/reset-admin-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: resetModal.admin._id,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setStatusMessage({
        type: "success",
        message: "Password reset successfully!",
      });

      setTimeout(() => {
        setResetModal({ show: false, admin: null });
        setNewPassword("");
        setConfirmPassword("");
        setStatusMessage({ type: null, message: "" });
      }, 2000);
    } catch (err) {
      setStatusMessage({
        type: "error",
        message: (err as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (admin: Admin) => {
    if (!confirm(`Remove admin role from ${admin.firstName} ${admin.lastName}?`)) {
      return;
    }

    try {
      const response = await fetch("/api/eventheads/admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: admin._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove admin");
      }

      alert("Admin role removed successfully!");
      fetchAdmins();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-muted-foreground">Loading admins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500 bg-red-500/10 p-6 text-center">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={fetchAdmins}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
          <p className="text-white/70 text-sm">Total Admins</p>
          <p className="text-4xl font-bold text-white mt-2 drop-shadow-lg">{admins.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105">
          <p className="text-white/70 text-sm">Super Admins</p>
          <p className="text-4xl font-bold text-purple-400 mt-2 drop-shadow-lg">
            {admins.filter((a) => a.isSuperAdmin).length}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
          <p className="text-white/70 text-sm">Regular Admins</p>
          <p className="text-4xl font-bold text-green-400 mt-2 drop-shadow-lg">
            {admins.filter((a) => !a.isSuperAdmin).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 backdrop-blur-sm border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-background transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {admin.firstName} {admin.lastName}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">{admin.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">{admin.contact}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {admin.isSuperAdmin ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-500">
                        👑 Super Admin
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-500">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setResetModal({ show: true, admin })}
                        className="px-3 py-1 text-xs font-medium text-blue-500 border border-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        Reset Password
                      </button>
                      {!admin.isSuperAdmin && (
                        <button
                          onClick={() => handleRemoveAdmin(admin)}
                          className="px-3 py-1 text-xs font-medium text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                        >
                          Remove Admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {resetModal.show && resetModal.admin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Reset Password
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Resetting password for: <strong>{resetModal.admin.firstName} {resetModal.admin.lastName}</strong>
            </p>

            {statusMessage.type && (
              <div
                className={`mb-4 rounded-lg border p-3 ${
                  statusMessage.type === "success"
                    ? "border-green-500 bg-green-500/10 text-green-500"
                    : "border-red-500 bg-red-500/10 text-red-500"
                }`}
              >
                <p className="text-sm">{statusMessage.message}</p>
              </div>
            )}

            <div className="space-y-4">
              <LabelInputContainer>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </LabelInputContainer>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleResetPassword}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
              <button
                onClick={() => {
                  setResetModal({ show: false, admin: null });
                  setNewPassword("");
                  setConfirmPassword("");
                  setStatusMessage({ type: null, message: "" });
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-border rounded-md hover:bg-background transition-colors"
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
