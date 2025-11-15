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
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setUserToDelete(userId);

    try {
      const response = await fetch(`/api/eventheads/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      alert(`✅ ${data.message}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`❌ Error: ${(err as Error).message}`);
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/eventheads/users/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email,
          contact: editingUser.contact,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      alert(`✅ ${data.message}`);
      setIsEditModalOpen(false);
      setEditingUser(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`❌ Error: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
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
                <div className="space-y-2">
                  <button
                    onClick={() => handleViewDocument(user)}
                    className="w-full px-4 py-2 text-sm font-medium rounded-md bg-blue-500/10 text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    View ID Card
                  </button>

                  <button
                    onClick={() => handleEditUser(user)}
                    className="w-full px-4 py-2 text-sm font-medium rounded-md bg-green-500/10 text-green-500 border border-green-500 hover:bg-green-500 hover:text-white transition-colors"
                  >
                    ✏️ Edit User
                  </button>

                  <button
                    onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                    disabled={isDeleting && userToDelete === user._id}
                    className="w-full px-4 py-2 text-sm font-medium rounded-md bg-red-500/10 text-red-500 border border-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting && userToDelete === user._id ? "Deleting..." : "🗑 Delete User"}
                  </button>
                </div>

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

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg shadow-xl max-w-md w-full p-6 border border-neutral-800">
            <h3 className="text-xl font-semibold mb-4 text-white">Edit User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={editingUser.firstName}
                  onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editingUser.lastName}
                  onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  value={editingUser.contact}
                  onChange={(e) => setEditingUser({ ...editingUser, contact: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
