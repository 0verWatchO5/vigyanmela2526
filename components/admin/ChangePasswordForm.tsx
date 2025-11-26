"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/form-inputs";
import {
  Label,
  LabelInputContainer,
  BottomGradient,
} from "@/components/ui/form-components";

interface FormErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const validate = (): boolean => {
    let tempErrors: FormErrors = {};

    if (!formData.oldPassword.trim()) {
      tempErrors.oldPassword = "Current password is required";
    }

    if (!formData.newPassword.trim()) {
      tempErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      tempErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword.trim()) {
      tempErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
      tempErrors.newPassword = "New password must be different from current password";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setStatus({ type: null, message: "" });

    if (!validate()) {
      setStatus({
        type: "error",
        message: "Please fix all errors before submitting.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/eventheads/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to change password");
      }

      setStatus({
        type: "success",
        message: "Password changed successfully! ✅",
      });

      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: (error as Error).message || "Failed to change password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white drop-shadow-lg">
          Change Password
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Update your admin account password
        </p>

        {/* Status Message */}
        {status.type && (
          <div
            className={`mt-4 rounded-xl border p-4 backdrop-blur-sm ${
              status.type === "success"
                ? "border-green-400/50 bg-green-500/20 text-green-200"
                : "border-red-400/50 bg-red-500/20 text-red-200"
            }`}
          >
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Current Password */}
          <LabelInputContainer>
            <Label htmlFor="oldPassword">Current Password</Label>
            <Input
              id="oldPassword"
              placeholder="Enter current password"
              type="password"
              value={formData.oldPassword}
              onChange={handleChange}
              error={errors.oldPassword}
              disabled={isSubmitting}
            />
          </LabelInputContainer>

          {/* New Password */}
          <LabelInputContainer>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              placeholder="Enter new password (min 6 characters)"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              disabled={isSubmitting}
            />
          </LabelInputContainer>

          {/* Confirm Password */}
          <LabelInputContainer>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              placeholder="Re-enter new password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              disabled={isSubmitting}
            />
          </LabelInputContainer>

          {/* Submit Button */}
          <button
            className="group/btn relative mt-6 block h-10 w-full rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/50 font-medium text-white hover:bg-blue-500 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating Password..." : "Change Password"}
            <BottomGradient />
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-yellow-400/30 bg-yellow-500/10 backdrop-blur-sm p-4">
          <p className="text-xs text-yellow-200">
            <strong>Security Tip:</strong> Use a strong password with at least 8
            characters, including uppercase, lowercase, numbers, and special
            characters.
          </p>
        </div>
      </div>
    </div>
  );
}
