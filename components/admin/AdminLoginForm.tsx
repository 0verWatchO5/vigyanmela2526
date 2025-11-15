"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/form-inputs";
import {
  Label,
  LabelInputContainer,
  BottomGradient,
} from "@/components/ui/form-components";

interface FormErrors {
  email?: string;
  password?: string;
}

export function AdminLoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [loginStatus, setLoginStatus] = useState<{
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

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password.trim()) {
      tempErrors.password = "Password is required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isRedirecting) {
      return;
    }

    setLoginStatus({ type: null, message: "" });

    if (!validate()) {
      setLoginStatus({
        type: "error",
        message: "Please fix all errors before submitting.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/eventheads/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      setLoginStatus({
        type: "success",
        message: "Login successful! Redirecting...",
      });
      setIsRedirecting(true);

      setTimeout(() => {

        window.location.href = "/eventheads";
      }, 1000);
    } catch (error) {
      setLoginStatus({
        type: "error",
        message: (error as Error).message || "Login failed. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-background p-4 md:rounded-2xl md:p-8 dark:shadow-[0px_0px_1px_1px_#262626]">
      <h2 className="text-2xl font-bold text-foreground text-center">
        Admin Login
      </h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Event Heads - Vigyan Mela 25
      </p>

      {}
      {loginStatus.type && (
        <div
          className={`mt-4 rounded-lg p-4 ${
            loginStatus.type === "success"
              ? "bg-green-500/10 border border-green-500 text-green-500"
              : "bg-red-500/10 border border-red-500 text-red-500"
          }`}
        >
          <p className="text-sm font-medium">{loginStatus.message}</p>
        </div>
      )}

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {}
        <LabelInputContainer>
          <Label htmlFor="email">Admin Email</Label>
          <Input
            id="email"
            placeholder="admin@vigyanmela.com"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isSubmitting || isRedirecting}
          />
        </LabelInputContainer>

        {}
        <LabelInputContainer>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isSubmitting || isRedirecting}
          />
        </LabelInputContainer>

        {}
        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-zinc-900 to-zinc-900 font-medium text-zinc-200 shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] dark:shadow-[0px_1px_0px_0px_#ffffff10_inset,0px_-1px_0px_0px_#ffffff10_inset] disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting || isRedirecting}
        >
          {isRedirecting ? "Redirecting..." : isSubmitting ? "Logging in..." : "Login as Admin →"}
          <BottomGradient />
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Admin access only. Unauthorized access is prohibited.
      </p>
    </div>
  );
}
