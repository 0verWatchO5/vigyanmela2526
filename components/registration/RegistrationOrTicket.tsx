"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { signIn, useSession } from "next-auth/react";
import { EventRegistrationForm } from "@/components/registration/EventRegistrationForm";
import TicketCard from "@/components/ui/TicketCard";
import { TwitterShareButton } from "react-share";

type Visitor = {
  firstName: string;
  lastName: string;
  email: string;
  contact?: string;
  ticketCode?: string;
};

export default function RegistrationOrTicket() {
  const { status, data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    contact?: string;
  } | null>(null);
  const [shareInFlight, setShareInFlight] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const isLinkedInAuthed = Boolean((session as any)?.accessToken);
  const [ticketData, setTicketData] = useState<Visitor | null>(
    sessionStorage.getItem("vm_ticketData")
      ? JSON.parse(sessionStorage.getItem("vm_ticketData")!)
      : null
  );
  const postedOnceRef = useRef(false);

  const shareOnLinkedIn = useCallback(
    async (opts?: { suppressSignIn?: boolean }) => {
      // Guard: do not post more than once automatically
      if (postedOnceRef.current) {
        return;
      }
      setShareFeedback(null);
      setShareInFlight(true);
      try {
        const response = await fetch("/api/linkedin/post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment:
              "Excited to share that I will be visiting and participating in Vigyan Mela 4.0 \nLooking forward to meeting innovative minds, exploring breakthrough projects, and contributing to this vibrant science and technology event. \n\nIf you’d like to join as a visitor, you can register here:\nhttps://vigyanmela.chetanacollege.in/registration \n\nStay updated by following the official Vigyan Mela LinkedIn page:\nhttps://www.linkedin.com/company/vigyanmela/\n\nSee you at the event!",
            description:
              "Join Vigyan Mela 25 to explore innovation, workshops, and networking.",
            template: "registration-ticket",
            shareUrl: "https://vigyanmela.chetanacollege.in/registration",
          }),
        });

        const json = await response.json();
        console.log("LinkedIn share response:", json);
        if (!response.ok) {
          if (response.status === 401) {
            if (!opts?.suppressSignIn) {
              if (typeof window !== "undefined") {
                await signIn("linkedin", { callbackUrl: window.location.href });
              } else {
                await signIn("linkedin");
              }
            }
            return;
          }
          setShareFeedback(json.error || "LinkedIn post failed. Please retry.");
          return;
        }
        postedOnceRef.current = true; // mark posted
        sessionStorage.removeItem("vm_shareAfterLinkedIn");
        setShareFeedback("Shared to LinkedIn successfully!");
      } catch (error) {
        setShareFeedback(
          "LinkedIn post failed. Check your connection and try again."
        );
      } finally {
        setShareInFlight(false);
      }
    },
    [signIn]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLinkedInAuthed) return;
    // Restore ticket from session storage if exists
    if (!ticketData) {
      const storedTicket = sessionStorage.getItem("vm_ticketData");
      if (storedTicket) {
        try {
          const parsed = JSON.parse(storedTicket);
          if (parsed && parsed.ticketCode) {
            setTicketData(parsed);
          }
        } catch {}
      }
    }
    const shareFlag = sessionStorage.getItem("vm_shareAfterLinkedIn");
    if (!shareFlag) return;
    const doShare = async () => {
      if (!postedOnceRef.current) {
        await shareOnLinkedIn({ suppressSignIn: true });
      }
    };
    doShare();
  }, [isLinkedInAuthed, ticketData, shareOnLinkedIn]);

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
    return { firstname: first, lastname: last, email, contact } as Partial<{
      firstname: string;
      lastname: string;
      email: string;
      contact: string;
    }>;
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
          ticketId={visitor.ticketCode || "AAA000"}
          name={fullName}
          email={visitor.email}
          phone={visitor.contact || ""}
          title="Vigyan Mela 25 Ticket"
          dateRange="Thu, 11 Dec, 2025 – Fri, 12 Dec, 2025"
          venue="706, 7th floor, Chetana College Bandra (E), Mumbai, Maharashtra, India"
        />
        <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground text-center">
            Share with friends
          </p>
          <div className="flex gap-3">
            {!isLinkedInAuthed && (
              <button
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => shareOnLinkedIn({ suppressSignIn: false })}
                disabled={shareInFlight}
              >
                {shareInFlight ? "Sharing..." : "Share on LinkedIn"}
              </button>
            )}
            <TwitterShareButton
              url="https://vigyanmela.chetanacollege.in"
              title="Excited to share that I’m participating in Vigyan Mela 2025! 🎉
Check your ticket and join the celebration of innovation."
            >
              <span className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium">
                Share on Twitter
              </span>
            </TwitterShareButton>
          </div>
          {shareFeedback && (
            <p className="text-xs text-muted-foreground text-center">
              {shareFeedback}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <EventRegistrationForm initialValues={initialValues} />
    </div>
  );
}
