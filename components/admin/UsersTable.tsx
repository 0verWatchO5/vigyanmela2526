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

interface UsersTableProps {
  users: User[];
  isSuperAdmin?: boolean;
  onRefresh?: () => void;
}

export function UsersTable({ users, isSuperAdmin, onRefresh }: UsersTableProps) {
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
    
    if (password === null) return; // Cancelled
    
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
      <div className="overflow-x-auto rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white/5 backdrop-blur-sm text-white/80 border-b border-white/20">
            <tr>
              <th scope="col" className="px-6 py-3">
                #
              </th>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Contact
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Registered
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                ID Card
              </th>
              {isSuperAdmin && (
                <th scope="col" className="px-6 py-3 text-center">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={isSuperAdmin ? 8 : 7}
                  className="px-6 py-8 text-center text-white/70"
                >
                  No users registered yet.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user._id}
                  className="border-b border-white/10 hover:bg-white/5 transition-all duration-300"
                >
                  <td className="px-6 py-4 font-medium text-white">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-white">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    {user.contact}
                  </td>
                  <td className="px-6 py-4">
                    {user.isAdmin ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-400/50">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/50">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white/70 text-xs">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleViewDocument(user)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/20 backdrop-blur-sm text-white border border-cyan-400/50 hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-yellow-500/20 backdrop-blur-sm text-white border border-yellow-400/50 hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                        disabled={isDeleting && userToDelete === user._id}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 backdrop-blur-sm text-white border border-red-400/50 hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting && userToDelete === user._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 text-center">
                      {!user.isAdmin ? (
                        <button
                          onClick={() => handleMakeAdmin(user)}
                          disabled={makingAdmin === user._id}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/20 backdrop-blur-sm text-white border border-purple-400/50 hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {makingAdmin === user._id ? "Processing..." : "Make Admin"}
                        </button>
                      ) : (
                        <span className="text-xs text-white/50">Already Admin</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
