"use client";
import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";

type LinkedInGateProps = {
  children: React.ReactNode;
  className?: string;
};

export default function LinkedInGate({ children, className }: LinkedInGateProps) {
  const { status, data } = useSession();

  if (status === "loading") {
    return <div className={className}>Loading authentication...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className={className + " flex flex-col items-center gap-4"}>
        <p className="text-sm text-muted-foreground">Sign in to continue registration.</p>
        <div className="flex gap-3">
          <button
            onClick={() => signIn("linkedin")}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Sign in with LinkedIn
          </button>
          <a
            href="/registration"
            className="px-4 py-2 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 transition-colors"
          >
            Login
          </a>
          <a
            href="/auth/signup"
            className="px-4 py-2 rounded-md border border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Sign up
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={className + " w-full"}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">Signed in as {data?.user?.name || data?.user?.email}</span>
        <button
          onClick={() => signOut()}
          className="text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
        >
          Sign out
        </button>
      </div>
      {children}
    </div>
  );
}
