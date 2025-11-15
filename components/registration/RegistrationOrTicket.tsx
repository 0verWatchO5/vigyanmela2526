"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { EventRegistrationForm } from "@/components/registration/EventRegistrationForm";
import TicketCard from "@/components/ui/TicketCard";

type Visitor = {
  firstName: string;
  lastName: string;
  email: string;
  contact?: string;
};

export default function RegistrationOrTicket() {
  const { status, data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ firstName?: string; lastName?: string; email?: string; contact?: string } | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch existing visitor
        const [vRes, uRes] = await Promise.all([
          fetch("/api/visitors/me", { cache: "no-store" }),
          fetch("/api/user/me", { cache: "no-store" }).catch(() => null),
        ]);
        const vJson = await vRes.json();
        if (!vRes.ok) throw new Error(vJson?.error || "Failed to load visitor");
        if (!ignore) setVisitor(vJson.visitor);

        if (uRes) {
          const uJson = await uRes.json();
          if (uRes.ok) {
            if (!ignore) setProfile(uJson.user);
          }
        }
      } catch (e: any) {
        if (!ignore) setError(e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [status]);

  // Compute initialValues unconditionally (before any conditional returns) to keep hook order stable
  const initialValues = useMemo(() => {
    let first = profile?.firstName || "";
    let last = profile?.lastName || "";
    let email = profile?.email || "";
    let contact = profile?.contact || "";

    if ((!first || !last) && session?.user?.name) {
      const parts = session.user.name.split(" ");
      first = first || parts[0] || "";
      last = last || parts.slice(1).join(" ") || "";
    }
    if (!email && session?.user?.email) {
      email = session.user.email;
    }
    return { firstname: first, lastname: last, email, contact } as Partial<{ firstname: string; lastname: string; email: string; contact: string }>;
  }, [profile, session]);

  if (status === "loading" || loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  // If visitor exists, show ticket. Else show the registration form.
  if (visitor) {
    const fullName = `${visitor.firstName} ${visitor.lastName}`.trim();
    return (
      <div className="flex flex-col items-center w-full">
        <TicketCard
          name={fullName}
          email={visitor.email}
          phone={visitor.contact || ""}
          title="Vigyan Mela 2526"
          dateRange="Thu, 11 Dec, 2025 – Fri, 12 Dec, 2025"
          venue="Chetana College Bandra (E), Mumbai, Maharashtra, India"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <EventRegistrationForm initialValues={initialValues} />
    </div>
  );
}
