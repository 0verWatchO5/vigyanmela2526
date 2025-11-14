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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-zinc-900 text-zinc-400 border-b border-border">
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
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  No users registered yet.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user._id}
                  className="bg-background border-b border-border hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {user.contact}
                  </td>
                  <td className="px-6 py-4">
                    {user.isAdmin ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-500 border border-green-500">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleViewDocument(user)}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-500/10 text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      View
                    </button>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 text-center">
                      {!user.isAdmin ? (
                        <button
                          onClick={() => handleMakeAdmin(user)}
                          disabled={makingAdmin === user._id}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-purple-500/10 text-purple-500 border border-purple-500 hover:bg-purple-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {makingAdmin === user._id ? "Processing..." : "Make Admin"}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Already Admin</span>
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
    </>
  );
}
