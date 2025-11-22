"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/registration";
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", contact: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateContact(contact: string): string | null {
    const raw = contact.trim();
    if (!raw) return "Contact number is required.";
    if (!/^[0-9]{10}$/.test(raw)) return "Contact must be exactly 10 digits.";
    const allSameDigit = /(\d)\1{9}/.test(raw);
    const sequentialAsc = raw === "0123456789" || raw === "1234567890";
    const sequentialDesc = raw === "9876543210";
    const disallowed = new Set([
      "0000000000","1111111111","2222222222","3333333333","4444444444","5555555555","6666666666","7777777777","8888888888","9999999999","0123456789","1234567890","9876543210"
    ]);
    const weakPrefix = /^[01]/.test(raw);
    if (allSameDigit || sequentialAsc || sequentialDesc || disallowed.has(raw) || weakPrefix) {
      return "Enter a valid non-repetitive phone number.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // sanitize contact input
      const sanitizedContact = form.contact.replace(/[^0-9]/g, '').slice(0,10);
      const contactError = validateContact(sanitizedContact);
      if (contactError) {
        throw new Error(contactError);
      }
      const payload = { ...form, contact: sanitizedContact };
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Signup failed");
      router.push(returnUrl);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background/50 backdrop-blur p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start registration with a new account or LinkedIn</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="contact">Contact (10 digits)</Label>
              <Input id="contact" required value={form.contact} onChange={(e) => {
                const digits = e.target.value.replace(/[^0-9]/g,'').slice(0,10);
                setForm({ ...form, contact: digits });
              }} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button
              type="button"
              onClick={() => signIn("linkedin", { callbackUrl: returnUrl })}
              className="w-full rounded-md bg-[#0a66c2] text-white py-2.5 text-sm font-medium hover:brightness-110 transition mb-2"
            >
              Continue with LinkedIn
            </button>

            <button disabled={loading} className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-medium disabled:opacity-50">
              {loading ? "Creating..." : "Create account"}
            </button>
            {error && <div className="text-sm text-red-500">{error}</div>}
          </form>

          <div className="text-sm text-muted-foreground mt-2 text-center">
            Already have an account? <Link href={`/auth/login${returnUrl !== "/registration" ? `?returnUrl=${returnUrl}` : ""}`} className="text-blue-600">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-background/50 backdrop-blur p-6 shadow-sm">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
