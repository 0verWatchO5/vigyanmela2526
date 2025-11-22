"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      redirect: true,
      callbackUrl: "/registration",
      email,
      password,
    });
    if (res?.error) setError(res.error);
    setLoading(false);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background/50 backdrop-blur p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue your registration</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => signIn("linkedin", { callbackUrl: "/registration" })}
            className="w-full rounded-md bg-[#0a66c2] text-white py-2.5 text-sm font-medium hover:brightness-110 transition"
          >
            Continue with LinkedIn
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button disabled={loading} className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-medium disabled:opacity-50">
              {loading ? "Signing in..." : "Sign in"}
            </button>
            {error && <div className="text-sm text-red-500">Wrong email or password</div>}
          </form>

          <div className="text-sm text-muted-foreground mt-2 text-center">
            No account? <Link href="/auth/signup" className="text-blue-600">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
