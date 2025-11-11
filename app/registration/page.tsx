"use client";
import React, { useState, useRef } from "react";

// A simple 'cn' utility to merge class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

// --- Icon Components (Form Specific) ---

const IconUpload = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground"
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconFile = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground"
    {...props}
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const IconX = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-muted-foreground"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);


// --- Re-created UI Components (Form) ---

const Label = ({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium text-foreground", // MODIFIED: text-primary to text-foreground
        className
      )}
    >
      {children}
    </label>
  );
};

const Input = ({ id, placeholder, type, className, ...props }: { id: string; placeholder: string; type: string; className?: string; [key: string]: any }) => {
  return (
    <div className="group relative w-full">
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border-none bg-zinc-800 px-3 py-2 text-sm text-foreground", // MODIFIED: text-primary to text-foreground
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900",
          "placeholder:text-muted-foreground",
          "shadow-input dark:shadow-[0px_0px_1px_1px_#262626]",
          className
        )}
        {...props}
      />
      <InputHoverGradient />
    </div>
  );
};

// --- File Upload Component ---
const FileUpload = ({ id, name, accept, onChange }: { id: string; name: string; accept: string; onChange: (files: File[]) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      onChange([file]); // Pass as array to parent
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (fileInputRef.current) {
      fileInputRef.current.files = files; // Sync with the input
    }
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    handleFiles(files);
  };

  const handleClick = () => {
  if (fileInputRef.current) {
    fileInputRef.current.click();
  }
};

  const handleRemoveFile = () => {
    setUploadedFile(null);
    onChange([]); // Pass empty array to parent
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the input
    }
  };

  return (
    <div className="group relative w-full">
      <div
        className={cn(
          "w-full p-6 border border-dashed rounded-lg cursor-pointer text-center",
          "border-border bg-background", // MODIFIED: border-neutral-800 to border-border
          isDragging
            ? "border-blue-500 bg-zinc-800"
            : "hover:border-neutral-500", // This hover is fine
          "transition-colors duration-200"
        )}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={id}
          name={name}
          accept={accept}
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploadedFile ? (
          <div className="flex items-center justify-between text-foreground"> {/* MODIFIED: text-primary to text-foreground */}
            <div className="flex items-center gap-2 overflow-hidden">
              <IconFile className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-sm">{uploadedFile.name}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="ml-2 flex-shrink-0 p-1 rounded-full text-muted-foreground hover:bg-zinc-700 hover:text-foreground" // MODIFIED: hover:text-primary to hover:text-foreground
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <IconUpload className="h-8 w-8" />
            <span className="font-medium text-foreground"> {/* MODIFIED: text-primary to text-foreground */}
              Drag & drop file or{" "}
              <span className="text-blue-500">click to upload</span>
            </span>
            <span className="text-xs">Accepts: {accept}</span>
          </div>
        )}
      </div>
      <InputHoverGradient />
    </div>
  );
};


// --- Components from the User's Example ---

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1G/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const InputHoverGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -top-px block h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <span className="absolute inset-x-0 -bottom-px block h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <span className="absolute inset-y-0 -left-px block h-full w-[2px] bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-110" />
      <span className="absolute inset-y-0 -right-px block h-full w-[2px] bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

// --- Event Registration Form (With Validation) ---

export function EventRegistrationForm() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [idCardFiles, setIdCardFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev: any) => ({ ...prev, [id]: null }));
    }
  };
  
  const handleFileChange = (files: File[]) => {
    setIdCardFiles(files);
    if (files.length > 0) {
      setErrors((prev: any) => ({ ...prev, idcard: null }));
    }
  };

  const validate = () => {
    let tempErrors: any = {};
    if (!formData.firstname) tempErrors.firstname = "First name is required.";
    if (!formData.lastname) tempErrors.lastname = "Last name is required.";
    if (!formData.email) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email address is invalid.";
    }
    if (!formData.contact) tempErrors.contact = "Contact number is required.";
    if (idCardFiles.length === 0) tempErrors.idcard = "ID card upload is required.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form submitted");
      console.log("Data:", formData);
      console.log("ID Card File:", idCardFiles[0]);
      alert("Registration Successful!");
      setFormData({ firstname: "", lastname: "", email: "", contact: "" });
      setIdCardFiles([]);
      setErrors({});
      // This is a bit of a hack to reset the FileUpload component
      window.location.reload(); 
    } else {
      console.log("Validation failed");
    }
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-background p-4 md:rounded-2xl md:p-8 dark:shadow-[0px_0px_1px_1px_#262626]">
      <h2 className="text-xl font-bold text-foreground"> {/* MODIFIED: text-primary to text-foreground */}
        Event Registration
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Register for our upcoming event. We're excited to see you there!
      </p>

      <form className="my-8" onSubmit={handleSubmit} noValidate>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="firstname">First name</Label>
            <Input 
              id="firstname" 
              name="firstname" 
              placeholder="" 
              type="text"
              value={formData.firstname}
              onChange={handleChange} 
            />
            {errors.firstname && <span className="text-xs text-red-500">{errors.firstname}</span>}
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last name</Label>
            <Input 
              id="lastname" 
              name="lastname" 
              placeholder="" 
              type="text"
              value={formData.lastname}
              onChange={handleChange} 
            />
            {errors.lastname && <span className="text-xs text-red-500">{errors.lastname}</span>}
          </LabelInputContainer>
        </div>
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            placeholder=""
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
        </LabelInputContainer>
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="contact">Contact Number</Label>
          <Input
            id="contact"
            name="contact"
            placeholder=""
            type="tel"
            value={formData.contact}
            onChange={handleChange}
          />
          {errors.contact && <span className="text-xs text-red-500">{errors.contact}</span>}
        </LabelInputContainer>
        
        <LabelInputContainer className="mb-8">
          <Label htmlFor="idcard">ID Card (Image or PDF)</Label>
          <FileUpload
            key={idCardFiles.length} // Force re-render on reset
            id="idcard"
            name="idcard"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />
          {errors.idcard && <span className="text-xs text-red-500">{errors.idcard}</span>}
        </LabelInputContainer>

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#2727a_inset,0px_-1px_0px_0px_#2727a_inset]"
          type="submit"
        >
          Register &rarr;
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}

// --- MODIFIED Main App Component ---

export default function RegistrationPage() {
  // REMOVED all layout components, sidebar components, and style tags
  return (
    // The main layout is now handled by app/layout.tsx
    // We just need to render the content for this page
    <div className="flex flex-1 items-center justify-center p-4 pt-16 lg:pt-4">
      <EventRegistrationForm />
    </div>
  );
}