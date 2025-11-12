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
      <div className="shadow-input rounded-lg bg-background p-6 md:p-8 dark:shadow-[0px_0px_1px_1px_#262626]">
        <h2 className="text-2xl font-bold text-foreground">
          Change Password
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Update your admin account password
        </p>

        {}
        {status.type && (
          <div
            className={`mt-4 rounded-lg border p-4 ${
              status.type === "success"
                ? "border-green-500 bg-green-500/10 text-green-500"
                : "border-red-500 bg-red-500/10 text-red-500"
            }`}
          >
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {}
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

          {}
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

          {}
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

          {}
          <button
            className="group/btn relative mt-6 block h-10 w-full rounded-md bg-gradient-to-br from-zinc-900 to-zinc-900 font-medium text-zinc-200 shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-[0px_1px_0px_0px_#ffffff10_inset,0px_-1px_0px_0px_#ffffff10_inset]"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating Password..." : "Change Password"}
            <BottomGradient />
          </button>
        </form>

        <div className="mt-6 rounded-md border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            <strong>Security Tip:</strong> Use a strong password with at least 8
            characters, including uppercase, lowercase, numbers, and special
            characters.
          </p>
        </div>
      </div>
    </div>
  );
}
