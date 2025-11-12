"use client";

import React, { useState } from "react";
import { DocumentViewer } from "./DocumentViewer";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  idCardUrl: string;
  idCardPublicId: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersGridProps {
  users: User[];
  isSuperAdmin?: boolean;
  onRefresh?: () => void;
}

export function UsersGrid({ users, isSuperAdmin, onRefresh }: UsersGridProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [makingAdmin, setMakingAdmin] = useState<string | null>(null);

  const handleViewDocument = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleMakeAdmin = async (user: User) => {
    const password = prompt(`Set password for ${user.firstName} ${user.lastName} (default: admin123):`);
    
    if (password === null) return;
    
    const finalPassword = password.trim() || "admin123";
    
    if (!confirm(`Make ${user.firstName} ${user.lastName} an admin with password: ${finalPassword}?`)) {
      return;
    }

    setMakingAdmin(user._id);

    try {
      const response = await fetch("/api/eventheads/make-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          password: finalPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to make user admin");
      }

      alert(`✅ ${data.message}\nDefault Password: ${data.admin.defaultPassword}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`❌ Error: ${(err as Error).message}`);
    } finally {
      setMakingAdmin(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      {users.length === 0 ? (
        <div className="flex items-center justify-center p-12 border border-border rounded-lg">
          <p className="text-muted-foreground">No users registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <div
              key={user._id}
              className="relative group bg-background border border-border rounded-lg p-6 hover:border-zinc-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
            >
              {}
              <div className="absolute top-4 right-4 px-2 py-1 bg-zinc-800 rounded-md text-xs font-mono text-zinc-400">
                #{index + 1}
              </div>

              {}
              <div className="mb-4">
                {user.isAdmin ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-500 border border-green-500">
                    Admin
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500">
                    User
                  </span>
                )}
              </div>

              {}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registered on{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground">📧</span>
                    <span className="text-foreground break-all">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">📱</span>
                    <span className="text-foreground">{user.contact}</span>
                  </div>
                </div>

                {}
                <button
                  onClick={() => handleViewDocument(user)}
                  className="w-full mt-4 px-4 py-2 text-sm font-medium rounded-md bg-blue-500/10 text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                >
                  View ID Card
                </button>

                {}
                {isSuperAdmin && !user.isAdmin && (
                  <button
                    onClick={() => handleMakeAdmin(user)}
                    disabled={makingAdmin === user._id}
                    className="w-full mt-2 px-4 py-2 text-sm font-medium rounded-md bg-purple-500/10 text-purple-500 border border-purple-500 hover:bg-purple-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {makingAdmin === user._id ? "Processing..." : "👑 Make Admin"}
                  </button>
                )}
              </div>

              {}
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-blue-500/20 pointer-events-none transition-colors" />
            </div>
          ))}
        </div>
      )}

      {}
      {selectedUser && (
        <DocumentViewer
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          imageUrl={selectedUser.idCardUrl}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
        />
      )}
    </>
  );
}
