"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const MIN_PASSWORD_LENGTH = 8;

type StatusState = { type: "success" | "error" | null; message: string };

function RequestResetForm({ onSend }: { onSend: (email: string) => Promise<StatusState> }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<StatusState>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setStatus({ type: "error", message: "Please enter your email address." });
      return;
    }
    setLoading(true);
    const result = await onSend(email.trim().toLowerCase());
    setStatus(result);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Sending link..." : "Send reset link"}
      </button>
      {status.type && (
        <p className={`text-sm ${status.type === "success" ? "text-green-500" : "text-red-500"}`}>
          {status.message}
        </p>
      )}
      <p className="text-sm text-muted-foreground text-center">
        Remembered it? <Link href="/auth/login" className="text-blue-600">Back to sign in</Link>
      </p>
    </form>
  );
}

function ResetPasswordForm({ email, onReset }: { email: string; onReset: (password: string) => Promise<StatusState> }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<StatusState>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: null, message: "" });
    if (password.length < MIN_PASSWORD_LENGTH) {
      setStatus({ type: "error", message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    setLoading(true);
    const result = await onReset(password);
    setStatus(result);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label>Email</Label>
        <Input value={email} disabled type="email" />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a new password"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter the new password"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Updating..." : "Reset password"}
      </button>
      {status.type && (
        <p className={`text-sm ${status.type === "success" ? "text-green-500" : "text-red-500"}`}>
          {status.message}
        </p>
      )}
      {status.type === "success" && (
        <p className="text-sm text-muted-foreground text-center">
          You can now <Link href="/auth/login" className="text-blue-600">sign in</Link> with your new password.
        </p>
      )}
    </form>
  );
}

function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";
  const showResetForm = Boolean(token && emailParam);

  async function sendResetLink(email: string): Promise<StatusState> {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { type: "error", message: json.error || "Failed to send reset link." };
      }
      return { type: "success", message: json.message || "If an account exists, a reset link has been sent." };
    } catch {
      return { type: "error", message: "We couldn't send the reset link. Try again later." };
    }
  }

  async function resetPassword(password: string): Promise<StatusState> {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam, token, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { type: "error", message: json.error || "Failed to reset password." };
      }
      return { type: "success", message: json.message || "Password updated successfully." };
    } catch {
      return { type: "error", message: "We couldn't update the password. Try again later." };
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background/50 backdrop-blur p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Reset your password</h1>
          <p className="text-sm text-muted-foreground">
            {showResetForm ? "Choose a new password to secure your account." : "Enter your email and we will send you a reset link."}
          </p>
        </div>
        {showResetForm ? (
          <ResetPasswordForm email={emailParam} onReset={resetPassword} />
        ) : (
          <RequestResetForm onSend={sendResetLink} />
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background/50 backdrop-blur p-6 shadow-sm">
            <p className="text-center text-muted-foreground">Loading reset form...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordPageContent />
    </Suspense>
  );
}
