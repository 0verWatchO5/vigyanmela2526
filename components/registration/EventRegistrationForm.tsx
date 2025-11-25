"use client";

import React, { useState, useRef, useCallback } from "react";
import TicketCard from "@/components/ui/TicketCard";
import { signIn, useSession } from "next-auth/react";
import { Input } from "@/components/ui/form-inputs";
import {
  Label,
  LabelInputContainer,
  BottomGradient,
} from "@/components/ui/form-components";
import { cn } from "@/lib/utils"; // IMPORT ADDED HERE
import { TwitterShareButton } from "react-share";
interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
  age: string;
  organization: string;
  industry: string;
  linkedin: string;
}

interface FormErrors {
  firstname?: string;
  lastname?: string;
  email?: string;
  contact?: string;
  // idcard?: string;
  age?: string;
  organization?: string;
  industry?: string;
  linkedin?: string;
  policy?: string;
}

export function EventRegistrationForm({
  initialValues,
}: {
  initialValues?: Partial<FormData>;
}) {
  const [formData, setFormData] = useState<FormData>({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    age: "",
    organization: "",
    industry: "",
    linkedin: "",
  });
  React.useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, [initialValues]);
  const [errors, setErrors] = useState<FormErrors>({});
  // const [idCardFiles, setIdCardFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [shareInFlight, setShareInFlight] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const { data: session } = useSession();
  const isLinkedInAuthed = Boolean((session as any)?.accessToken);
  // Removed autoFlowRan (previous auto registration after auth)
  const postedOnceRef = useRef(false); // ensures LinkedIn post fires only once per page load/auth cycle
  const [ticketData, setTicketData] = useState<{
    ticketCode: string;
    firstName: string;
    lastName: string;
    email: string;
    contact: string;
  } | null>(null);
  const [showLinkedInPrompt, setShowLinkedInPrompt] = useState(false);
  const [initiatedLinkedInFlow, setInitiatedLinkedInFlow] = useState(false); // hides form after user chooses LinkedIn path

  const closeModalAndRefresh = () => {
    setShowSuccessModal(false);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target as HTMLInputElement;

    let sanitizedValue = value;

    if (id === "firstname" || id === "lastname") {
      sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (id === "contact") {
      sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    } else if (id === "age") {
      sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 3);
    } else if (id === "email") {
      sanitizedValue = value.trim().toLowerCase();
    } else if (id === "organization") {
      sanitizedValue = value.trimStart();
    } else if (id === "linkedin") {
      sanitizedValue = value.trim();
    }

    setFormData((prev) => ({ ...prev, [id]: sanitizedValue }));
    if (errors[id as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

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
              "Excited to share that I will be visiting and participating in Vigyan Mela 4.0 \nLooking forward to meeting innovative minds, exploring breakthrough projects, and contributing to this vibrant science and technology event. \n\nIf you’d like to join as a visitor, you can register here:\nhttps://vigyanmela.chetanacollege.in/registration \n\nStay updated by following the official Vigyan Mela LinkedIn page:\nhttps://www.linkedin.com/company/vigyanmela/\n\nSee you at the event!\n\n\n\n#VigyanMela #VigyanMela4 #ScienceAndTechnology #Innovation #STEM #TechInnovation #StudentProjects #ScienceExhibition #FutureInnovators #TechShowcase #ResearchAndInnovation #CreativeMinds #InnovationIndia #Event2025 #ScientificThinking",
            title: "Registered for Vigyan Mela 25",
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

  const handleFileChange = (files: File[]) => {
    // setIdCardFiles(files);
    if (files.length > 0) {
      setErrors((prev) => ({ ...prev, idcard: undefined }));
    }
  };

  const validate = (): boolean => {
    let tempErrors: FormErrors = {};

    if (!formData.firstname.trim()) {
      tempErrors.firstname = "First name is required.";
    } else if (formData.firstname.trim().length < 2) {
      tempErrors.firstname = "First name must be at least 2 characters.";
    }

    if (!formData.lastname.trim()) {
      tempErrors.lastname = "Last name is required.";
    } else if (formData.lastname.trim().length < 2) {
      tempErrors.lastname = "Last name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      tempErrors.email = "Please enter a valid email address.";
    }

    if (!formData.contact.trim()) {
      tempErrors.contact = "Contact number is required.";
    } else if (!/^[0-9]{10}$/.test(formData.contact.trim())) {
      tempErrors.contact = "Contact must be exactly 10 digits.";
    } else {
      const phone = formData.contact.trim();
      const allSameDigit = /(\d)\1{9}/.test(phone);
      const sequentialAsc = phone === "0123456789" || phone === "1234567890";
      const sequentialDesc = phone === "9876543210";
      const disallowedList = new Set([
        "0000000000",
        "1111111111",
        "2222222222",
        "3333333333",
        "4444444444",
        "5555555555",
        "6666666666",
        "7777777777",
        "8888888888",
        "9999999999",
        "1234567890",
        "0123456789",
        "9876543210",
      ]);
      // Disallow starting with 0 or 1 (adjust if not desired)
      const weakPrefix = /^[01]/.test(phone);
      if (
        allSameDigit ||
        sequentialAsc ||
        sequentialDesc ||
        disallowedList.has(phone) ||
        weakPrefix
      ) {
        tempErrors.contact = "Enter a valid non-repetitive phone number.";
      }
    }

    if (!formData.age.trim()) {
      tempErrors.age = "Age is required.";
    } else {
      const ageVal = parseInt(formData.age, 10);
      if (isNaN(ageVal) || ageVal < 14 || ageVal > 65) {
        tempErrors.age = "Please enter a valid age between 14 and 65.";
      }
    }
    if (!formData.organization.trim()) {
      tempErrors.organization = "Organization / College name is required.";
    } else {
      const org = formData.organization.trim();
      if (/^[0-9]+$/.test(org)) {
        tempErrors.organization = "Organization name cannot be only numbers.";
      } else if (!/^[A-Za-z]/.test(org)) {
        tempErrors.organization = "Organization name must start with a letter.";
      }
    }

    if (!formData.industry.trim()) {
      tempErrors.industry = "Please select an industry.";
    }

    if (!acceptedPolicy) {
      tempErrors.policy = "Please accept the privacy policy to continue.";
    }

    if (formData.linkedin.trim()) {
      try {
        const url = new URL(formData.linkedin);
        if (!/^https?:/.test(url.protocol)) {
          tempErrors.linkedin = "Please enter a valid LinkedIn URL (https).";
        }
      } catch (e) {
        tempErrors.linkedin = "Please enter a valid LinkedIn URL.";
      }
    }

    // if (idCardFiles.length === 0) {
    //   tempErrors.idcard = "ID card upload is required.";
    // }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Fallback: if user returned authed with ticket but flag missing (e.g., storage cleared), attempt share once.
  React.useEffect(() => {
    if (!isLinkedInAuthed) return;
    if (!ticketData) return;
    if (postedOnceRef.current) return;
    // Only auto-fire if flow was initiated via LinkedIn path to avoid unexpected shares.
    if (!initiatedLinkedInFlow) return;
    const shareFlag =
      typeof window !== "undefined"
        ? sessionStorage.getItem("vm_shareAfterLinkedIn")
        : null;
    if (shareFlag) return; // original effect will handle
    // If user has ticket, authed, no share yet -> share
    shareOnLinkedIn({ suppressSignIn: true });
  }, [isLinkedInAuthed, ticketData, initiatedLinkedInFlow, shareOnLinkedIn]);

  // After success modal appears (ticket created), perform LinkedIn share once if authed
  React.useEffect(() => {
    if (!showSuccessModal) return;
    if (!isLinkedInAuthed) return;
    if (postedOnceRef.current) return;
    shareOnLinkedIn({ suppressSignIn: true });
  }, [showSuccessModal, isLinkedInAuthed, shareOnLinkedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ type: null, message: "" });
    const isValid = validate();
    if (!isValid) {
      setSubmitStatus({
        type: "error",
        message: "Please fill in the required details before submitting.",
      });
      return;
    }
    // Show modal if user not authed; actual registration deferred.
    if (!isLinkedInAuthed) {
      setShowLinkedInPrompt(true);
      return;
    }
    await performRegistration();
  };

  const performRegistration = async (opts?: { skipModal?: boolean }) => {
    if (!validate()) {
      setSubmitStatus({
        type: "error",
        message: "Please Fill all the details before submitting",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("firstname", formData.firstname);
      submitData.append("lastname", formData.lastname);
      submitData.append("email", formData.email);
      submitData.append("contact", formData.contact);
      submitData.append("age", formData.age);
      submitData.append("organization", formData.organization);
      submitData.append("industry", formData.industry);
      submitData.append("linkedin", formData.linkedin);
      const response = await fetch("/api/register", {
        method: "POST",
        body: submitData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Registration failed");
      setSubmitStatus({
        type: "success",
        message: "Registration successful! Welcome to Vigyan Mela 25.",
      });
      if (result?.data?.ticketCode) {
        const t = {
          ticketCode: result.data.ticketCode,
          firstName: result.data.firstName || formData.firstname,
          lastName: result.data.lastName || formData.lastname,
          email: result.data.email || formData.email,
          contact: result.data.contact || formData.contact,
        };
        setTicketData(t);
        try {
          sessionStorage.setItem("vm_ticketData", JSON.stringify(t));
        } catch {}
      }
      setErrors({});
      if (!opts?.skipModal) {
        setShowSuccessModal(true);
      } else {
        setShowSuccessModal(false);
      }
      setShareFeedback(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          (error as Error).message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-background p-4 md:rounded-2xl md:p-8 dark:shadow-[0px_0px_1px_1px_#262626]">
      <h2 className="text-xl font-bold text-foreground">
        Visitor Registration
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Register for Vigyan Mela 25 by filling out the form below.
      </p>

      {}
      {submitStatus.type && (
        <div
          className={`mt-4 rounded-lg p-4 ${
            submitStatus.type === "success"
              ? "bg-green-500/10 border border-green-500 text-green-500"
              : "bg-red-500/10 border border-red-500 text-red-500"
          }`}
        >
          <p className="text-sm font-medium">{submitStatus.message}</p>
        </div>
      )}

      {!ticketData && !initiatedLinkedInFlow && (
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {}
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <LabelInputContainer>
              <Label htmlFor="firstname">First name</Label>
              <Input
                id="firstname"
                placeholder="Name"
                type="text"
                value={formData.firstname}
                onChange={handleChange}
                error={errors.firstname}
                disabled={isSubmitting}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastname">Last name</Label>
              <Input
                id="lastname"
                placeholder="Surname"
                type="text"
                value={formData.lastname}
                onChange={handleChange}
                error={errors.lastname}
                disabled={isSubmitting}
              />
            </LabelInputContainer>
          </div>

          {}
          <LabelInputContainer>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="example@gmail.com"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isSubmitting}
            />
          </LabelInputContainer>

          {}
          <LabelInputContainer>
            <Label htmlFor="contact">Contact Number</Label>
            <Input
              id="contact"
              placeholder="......"
              type="tel"
              value={formData.contact}
              onChange={handleChange}
              error={errors.contact}
              disabled={isSubmitting}
            />
          </LabelInputContainer>

          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <LabelInputContainer>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                placeholder="14-65"
                type="tel"
                value={formData.age}
                onChange={handleChange}
                error={errors.age}
                disabled={isSubmitting}
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="industry">Role</Label>
              <select
                id="industry"
                value={formData.industry}
                onChange={handleChange}
                className={cn(
                  "h-10 w-full rounded-md border px-3 focus:outline-none focus:ring-2",
                  // FIXED: Adaptive colors
                  "bg-zinc-100 text-zinc-900 border-transparent focus:ring-indigo-500",
                  "dark:bg-zinc-800 dark:text-white dark:border-gray-600 dark:focus:ring-white"
                )}
                disabled={isSubmitting}
              >
                <option value="">Select Role</option>
                {/* <option value="Student">Student</option> */}
                <option value="Visitor">Company Representative</option>
                <option value="Media">Media</option>
                <option value="Guest">Guest</option>
                <option value="Other">Other</option>
              </select>

              {errors.industry && (
                <p className="text-sm text-red-500">{errors.industry}</p>
              )}
            </LabelInputContainer>
          </div>

          <LabelInputContainer>
            <Label htmlFor="organization">Organization / College</Label>
            <Input
              id="organization"
              placeholder="Your organization or college"
              type="text"
              value={formData.organization}
              onChange={handleChange}
              error={errors.organization}
              disabled={isSubmitting}
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="linkedin">LinkedIn Profile (optional) </Label>
            <Input
              id="linkedin"
              placeholder="https://www.linkedin.com/in/username"
              type="url"
              required={false}
              value={formData.linkedin}
              onChange={handleChange}
              error={errors.linkedin}
              disabled={isSubmitting}
            />
          </LabelInputContainer>

          {}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <input
                id="accept-policy"
                type="checkbox"
                checked={acceptedPolicy}
                onChange={(e) => {
                  setAcceptedPolicy(e.target.checked);
                  if (errors.policy)
                    setErrors((prev) => ({ ...prev, policy: undefined }));
                }}
                className="mt-1 h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
              />
              <label
                htmlFor="accept-policy"
                className="text-sm text-neutral-300"
              >
                I agree to the{" "}
                <a
                  href="/privacy"
                  className="text-cyan-400 underline hover:opacity-90"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>
            {errors.policy && (
              <p className="text-xs text-red-500">{errors.policy}</p>
            )}

            <button
              className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-zinc-900 to-zinc-900 font-medium text-zinc-200 shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] dark:shadow-[0px_1px_0px_0px_#ffffff10_inset,0px_-1px_0px_0px_#ffffff10_inset] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting || !acceptedPolicy}
            >
              {isSubmitting ? " " : "Confirm your free pass through LinkedIn →"}
              <BottomGradient />
            </button>
          </div>
        </form>
      )}

      {ticketData && !showSuccessModal && (
        <div className="mt-8 flex justify-center">
          <TicketCard
            logoSrc="/images/VN.png"
            attendingText="Visitor ID"
            title="Vigyan Mela 25"
            venue="706, 7th-floor, Chetana College Bandra (E), Mumbai, Maharashtra, India"
            name={`${ticketData.firstName} ${ticketData.lastName}`}
            email={ticketData.email}
            phone={ticketData.contact}
            ticketId={ticketData.ticketCode}
          />
        </div>
      )}
      {ticketData && !showSuccessModal && (
        <div className="mt-4 space-y-2">
          {shareInFlight && (
            <div className="rounded-md border border-blue-500 bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
              Posting your participation to LinkedIn...
            </div>
          )}
          {shareFeedback &&
            (shareFeedback.toLowerCase().includes("success") ? (
              <div className="rounded-md border border-green-500 bg-green-500/10 px-3 py-2 text-xs text-green-400">
                {shareFeedback}
              </div>
            ) : (
              <div className="rounded-md border border-yellow-500 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400">
                {shareFeedback}{" "}
                <button
                  onClick={() =>
                    !shareInFlight && shareOnLinkedIn({ suppressSignIn: true })
                  }
                  disabled={shareInFlight}
                  className="ml-2 underline disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            ))}
        </div>
      )}
      {showLinkedInPrompt && !ticketData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900 border border-neutral-700">
            <h3 className="text-lg font-semibold mb-2">
              Share Your Participation?
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
              Sign in with LinkedIn to automatically share that you&apos;re
              attending Vigyan Mela 25. You can also continue without sharing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={async () => {
                  // Validate and register BEFORE LinkedIn auth so user never refills.
                  if (!validate()) return;
                  setShowLinkedInPrompt(false);
                  setInitiatedLinkedInFlow(true);
                  await performRegistration({ skipModal: true });
                  try {
                    sessionStorage.setItem("vm_shareAfterLinkedIn", "1");
                  } catch {}
                  try {
                    if (typeof window !== "undefined") {
                      await signIn("linkedin", {
                        callbackUrl: window.location.href,
                        redirect: false,
                      });
                    } else {
                      await signIn("linkedin");
                    }
                  } catch (err) {
                    console.error("LinkedIn sign-in error", err);
                  }
                }}
                className="flex-1 bg-[#0a66c2] text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                disabled={isSubmitting}
              >
                Sign in & Auto Share
              </button>
              <button
                onClick={async () => {
                  setShowLinkedInPrompt(false);
                  await performRegistration();
                }}
                className="flex-1 border border-neutral-300 dark:border-neutral-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                disabled={isSubmitting}
              >
                Continue Without Sharing
              </button>
            </div>
            <button
              onClick={() => setShowLinkedInPrompt(false)}
              className="mt-4 w-full text-center text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">You're registered!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Check your email for your ticket.
            </p>
            <div className="mt-4 flex gap-3">
              {!isLinkedInAuthed &&
                !(
                  shareFeedback &&
                  shareFeedback.toLowerCase().includes("success")
                ) && (
                  <button
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => shareOnLinkedIn()}
                    disabled={shareInFlight}
                  >
                    {shareInFlight ? "Sharing..." : "Share on LinkedIn"}
                  </button>
                )}
              <TwitterShareButton
                children={"Share on Twitter"}
                url="https://vigyanmela.chetanacollege.in"
                title="I've registered for Vigyan Mela 25! Check your ticket and join."
              />
              <button
                className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium"
                onClick={closeModalAndRefresh}
              >
                Close
              </button>
            </div>
            {shareFeedback &&
              (shareFeedback.toLowerCase().includes("success") ? (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-green-500 bg-green-500/10 p-2 text-xs text-green-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-2.59a.75.75 0 10-1.22-.92l-3.66 4.86-1.83-1.83a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.14-.09l4.19-5.58z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{shareFeedback}</span>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  {shareFeedback}
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
