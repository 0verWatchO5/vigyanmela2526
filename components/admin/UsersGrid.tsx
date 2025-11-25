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
        <div className="flex items-center justify-center p-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
          <p className="text-white/70">No users registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <div
              key={user._id}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300"
            >
              {/* User Card Content */}
              <div className="p-4 space-y-2">
                {/* Title - Removed logo to save space */}
                <div className="text-center pb-2 border-b border-white/20">
                  <h3 className="text-lg font-semibold text-white drop-shadow-lg">
                    {user.isAdmin ? "Admin" : "Event Organizer"}
                  </h3>
                  <p className="text-xs text-white/60">User #{index + 1}</p>
                </div>

                {/* Date and Venue - Compact */}
                <div className="space-y-2 py-2 border-b border-white/20">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 text-sm">📅</span>
                    <p className="text-xs text-white/70">
                      11-12 Dec, 2025
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 text-sm">📍</span>
                    <p className="text-xs text-white/70">
                      Chetana College, Mumbai
                    </p>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-1.5">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-2.5 space-y-1 text-xs">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-white/60">Name</span>
                      <span className="font-medium text-white">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-white/10">
                      <span className="text-white/60">Phone</span>
                      <span className="font-medium text-white">
                        {user.contact}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-white/10">
                      <span className="text-white/60">Email</span>
                      <span className="font-medium text-white text-xs break-all text-right max-w-[180px]">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-lg p-2 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Role:</span>
                      <span className="font-medium text-white">
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Joined:</span>
                      <span className="font-medium text-white">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 pb-3 space-y-1.5">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleViewDocument(user)}
                    className="flex-1 px-2 py-1.5 bg-cyan-500/20 backdrop-blur-sm text-white border border-cyan-400/50 rounded-lg hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 text-xs font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditUser(user)}
                    className="flex-1 px-2 py-1.5 bg-yellow-500/20 backdrop-blur-sm text-white border border-yellow-400/50 rounded-lg hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                    disabled={isDeleting && userToDelete === user._id}
                    className="flex-1 px-2 py-1.5 bg-red-500/20 backdrop-blur-sm text-white border border-red-400/50 rounded-lg hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50 text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
                {isSuperAdmin && !user.isAdmin && (
                  <button
                    onClick={() => handleMakeAdmin(user)}
                    disabled={makingAdmin === user._id}
                    className="w-full px-2 py-1.5 bg-purple-500/20 backdrop-blur-sm text-white border border-purple-400/50 rounded-lg hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 text-xs font-medium"
                  >
                    {makingAdmin === user._id ? "Processing..." : "👑 Make Admin"}
                  </button>
                )}
              </div>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4 text-white drop-shadow-lg">Edit User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={editingUser.firstName}
                  onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editingUser.lastName}
                  onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  value={editingUser.contact}
                  onChange={(e) => setEditingUser({ ...editingUser, contact: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400/50"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-cyan-500/20 backdrop-blur-sm text-white border border-cyan-400/50 rounded-xl hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
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
