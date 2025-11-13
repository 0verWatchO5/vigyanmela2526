"use client";

import React, { useState } from "react";
import { Input, FileUpload } from "@/components/ui/form-inputs";
import {
  Label,
  LabelInputContainer,
  BottomGradient,
} from "@/components/ui/form-components";

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
}

interface FormErrors {
  firstname?: string;
  lastname?: string;
  email?: string;
  contact?: string;
  idcard?: string;
}

export function EventRegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [idCardFiles, setIdCardFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    let sanitizedValue = value;
    
    if (id === "firstname" || id === "lastname") {

      sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (id === "contact") {

      sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    } else if (id === "email") {

      sanitizedValue = value.trim().toLowerCase();
    }
    
    setFormData((prev) => ({ ...prev, [id]: sanitizedValue }));
    if (errors[id as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleFileChange = (files: File[]) => {
    setIdCardFiles(files);
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

    if (idCardFiles.length === 0) {
      tempErrors.idcard = "ID card upload is required.";
    }
    
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
      submitData.append("idcard", idCardFiles[0]);

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

      setFormData({ firstname: "", lastname: "", email: "", contact: "" });
      setIdCardFiles([]);
      setErrors({});

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
      <h2 className="text-xl font-bold text-foreground">Event Registration</h2>
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
              placeholder="Tyler"
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
              placeholder="Durden"
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
            placeholder="projectmayhem@fc.com"
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
            placeholder="1234567890"
            type="tel"
            value={formData.contact}
            onChange={handleChange}
            error={errors.contact}
            disabled={isSubmitting}
          />
        </LabelInputContainer>

        {}
        <LabelInputContainer>
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
        </LabelInputContainer>

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
    </div>
  );
}
