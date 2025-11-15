"use client";

import React, { useState } from "react";
import { Input, FileUpload } from "@/components/ui/form-inputs";
import {
  Label,
  LabelInputContainer,
  BottomGradient,
} from "@/components/ui/form-components";
import { cn } from "@/lib/utils"; // IMPORT ADDED HERE

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
}

export function EventRegistrationForm({ initialValues }: { initialValues?: Partial<FormData> }) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const shareOnLinkedIn = () => {
    try {
      const shareText = `I've registered for Vigyan Mela 25! Check your ticket and Visit.`;
      const pageUrl = typeof window !== "undefined" ? window.location.href : "";
      const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        pageUrl
      )}&title=${encodeURIComponent("Registered for Vigyan Mela 25")}&summary=${encodeURIComponent(shareText)}`;
      window.open(linkedInUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      // ignore
    }
  };

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
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address.";
    }

    if (!formData.contact.trim()) {
      tempErrors.contact = "Contact number is required.";
    } else if (!/^[0-9]{10}$/.test(formData.contact)) {
      tempErrors.contact = "Contact must be exactly 10 digits.";
    }

    if (!formData.age.trim()) {
      tempErrors.age = "Age is required.";
    } else {
      const ageVal = parseInt(formData.age, 10);
      if (isNaN(ageVal) || ageVal < 10 || ageVal > 120) {
        tempErrors.age = "Please enter a valid age between 10 and 120.";
      }
    }

    if (!formData.organization.trim()) {
      tempErrors.organization = "Organization / College name is required.";
    }

    if (!formData.industry.trim()) {
      tempErrors.industry = "Please select an industry.";
    }

    if (!formData.linkedin.trim()) {
      tempErrors.linkedin = "LinkedIn profile is required.";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitStatus({ type: null, message: "" });

    if (!validate()) {
      setSubmitStatus({
        type: "error",
        message: "Please fix all errors before submitting.",
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
      // submitData.append("idcard", idCardFiles[0]);

      const response = await fetch("/api/register", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      setSubmitStatus({
        type: "success",
        message: "Registration successful! Welcome to VigyanMela 2526.",
      });

      setFormData({ firstname: "", lastname: "", email: "", contact: "", age: "", organization: "", industry: "", linkedin: "" });
      // setIdCardFiles([]);
      setErrors({});

      // show success modal with share option
      setShowSuccessModal(true);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: (error as Error).message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-background p-4 md:rounded-2xl md:p-8 dark:shadow-[0px_0px_1px_1px_#262626]">
      <h2 className="text-xl font-bold text-foreground">Visitor Registration</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Register for VigyanMela 2526 by filling out the form below.
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
              placeholder="10-120"
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
              <option value="Student">Student</option>
              <option value="Visitor">Visitor</option>
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
          <Label htmlFor="linkedin">LinkedIn Profile </Label>
          <Input
            id="linkedin"
            placeholder="https://www.linkedin.com/in/username"
            type="url"
            value={formData.linkedin}
            onChange={handleChange}
            error={errors.linkedin}
            disabled={isSubmitting}
          />
        </LabelInputContainer>

        {}
        {/* <LabelInputContainer>
          <Label htmlFor="idcard">Upload ID Card</Label>
          <FileUpload
            id="idcard"
            name="idcard"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            error={errors.idcard}
            maxSize={20}
            files={idCardFiles}
          />
        </LabelInputContainer> */}

        {}
        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-zinc-900 to-zinc-900 font-medium text-zinc-200 shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] dark:shadow-[0px_1px_0px_0px_#ffffff10_inset,0px_-1px_0px_0px_#ffffff10_inset] disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Register →"}
          <BottomGradient />
        </button>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">You're registered!</h3>
            <p className="mt-2 text-sm text-muted-foreground">Check your email for your ticket.</p>
            <div className="mt-4 flex gap-3">
              <button
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                onClick={shareOnLinkedIn}
              >
                Share on LinkedIn
              </button>
              <button
                className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}