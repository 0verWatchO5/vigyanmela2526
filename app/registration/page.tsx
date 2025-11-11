"use client";
import React, { useState, useRef } from "react";

// A simple 'cn' utility to merge class names
function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

// --- Icon Components (Re-created as SVGs) ---
// Using text-muted-foreground as per the theme

const IconHome = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-muted-foreground"
    {...props}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconInfoCircle = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-muted-foreground"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const IconUsers = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-muted-foreground"
    {...props}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconChartBar = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-muted-foreground"
    {...props}
  >
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const IconSparkles = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-muted-foreground"
    {...props}
  >
    <path d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9Z" />
    <path d="M18 13l-2.9-5.8" />
    <path d="M6 13l2.9-5.8" />
    <path d="M12 21V11.5" />
  </svg>
);

const IconUpload = (props) => (
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

const IconFile = (props) => (
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

const IconX = (props) => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// --- Re-created UI Components (Form) ---

const Label = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium text-primary", // Use theme color
        className
      )}
    >
      {children}
    </label>
  );
};

const Input = ({ id, placeholder, type, className, ...props }) => {
  return (
    <div className="group relative w-full">
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border-none bg-zinc-800 px-3 py-2 text-sm text-primary", // Dark bg, theme text
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
const FileUpload = ({ id, name, accept, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      onChange([file]); // Pass as array to parent
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (fileInputRef.current) {
      fileInputRef.current.files = files; // Sync with the input
    }
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
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
          "border-neutral-800 bg-background", // Use theme colors
          isDragging
            ? "border-blue-500 bg-zinc-800"
            : "hover:border-neutral-500",
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
          <div className="flex items-center justify-between text-primary">
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
              className="ml-2 flex-shrink-0 p-1 rounded-full text-muted-foreground hover:bg-zinc-700 hover:text-primary"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <IconUpload className="h-8 w-8" />
            <span className="font-medium text-primary">
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


// --- Re-created UI Components (Sidebar) ---

const Sidebar = ({ children, isCollapsed, onMouseEnter, onMouseLeave }) => {
  return (
    <aside
      className={cn(
        "sticky top-0 z-50 flex h-screen flex-col overflow-y-auto border-r border-neutral-800 bg-background p-4 transition-all duration-300 ease-in-out", // Use theme bg
        isCollapsed ? "w-20" : "w-64"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </aside>
  );
};

const SidebarBody = ({ children, isCollapsed }) => {
  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden">
      <div
        className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <h1
          className={cn(
            "whitespace-nowrap font-bold text-2xl text-primary", // Use theme color
            isCollapsed && "hidden"
          )}
        >
          Vigyan Mela
        </h1>
      </div>
      <p
        className={cn(
          "whitespace-nowrap text-muted-foreground text-sm mb-4", // Use theme color
          isCollapsed && "hidden"
        )}
      >
        Where Science Meets Innovation
      </p>
      {children}
    </div>
  );
};

const SidebarLink = ({
  link,
  isCollapsed,
  isActive,
}) => {
  return (
    // Use a standard <a> tag for real navigation
    <a
      href={link.href}
      className={cn(
        "relative group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors duration-200", // Use theme text
        isActive ? "bg-zinc-800" : "hover:bg-zinc-800",
        isCollapsed && "justify-center"
      )}
    >
      {/* Active/Hover pill effect */}
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1 rounded-r-full bg-blue-500 transition-all duration-300 ease-in-out",
          // Show if active, or on hover
          isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-100"
        )}
      ></span>

      {/* Use the icon from the link object */}
      {React.cloneElement(link.icon, { className: "h-4 w-4 text-muted-foreground" })}
      <span className={cn("transition-opacity whitespace-nowrap", isCollapsed && "hidden")}>
        {link.label}
      </span>
    </a>
  );
};

// --- Components from the User's Example ---

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const InputHoverGradient = () => {
  return (
    <>
      {/* Top */}
      <span className="absolute inset-x-0 -top-px block h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      {/* Bottom */}
      <span className="absolute inset-x-0 -bottom-px block h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      {/* Left */}
      <span className="absolute inset-y-0 -left-px block h-full w-[2px] bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-110" />
      {/* Right */}
      <span className="absolute inset-y-0 -right-px block h-full w-[2px] bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

// --- Event Registration Form ---

export function EventRegistrationForm() {
  const [idCardFiles, setIdCardFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log("Form submitted");
    console.log("First Name:", formData.get("firstname"));
    console.log("Email:", formData.get("email"));
    console.log("ID Card File:", idCardFiles[0]);
  };

  return (
    // Use theme colors for the form card
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-background p-4 md:rounded-2xl md:p-8 dark:shadow-[0px_0px_1px_1px_#262626]">
      <h2 className="text-xl font-bold text-primary">
        Event Registration
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Register for our upcoming event. We're excited to see you there!
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="firstname">First name</Label>
            <Input id="firstname" name="firstname" placeholder="Tyler" type="text" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last name</Label>
            <Input id="lastname" name="lastname" placeholder="Durden" type="text" />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            placeholder="projectmayhem@fc.com"
            type="email"
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="contact">Contact Number</Label>
          <Input
            id="contact"
            name="contact"
            placeholder="(123) 456-7890"
            type="tel"
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <Label htmlFor="idcard">ID Card (Image or PDF)</Label>
          <FileUpload
            id="idcard"
            name="idcard"
            accept="image/*,application/pdf"
            onChange={setIdCardFiles}
          />
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

// --- Sidebar Component (with state) ---

// Re-create icons for the navigationItems array
const navigationItems = [
  {
    label: "Home",
    href: "/",
    icon: <IconHome />,
  },
  {
    label: "About",
    href: "/about",
    icon: <IconInfoCircle />,
  },
  {
    label: "Registration",
    href: "/registration",
    icon: <IconUsers />,
  },
  {
    label: "Segments",
    href: "/segments",
    icon: <IconChartBar />,
  },
  {
    label: "Sponsors",
    href: "/sponsors",
    icon: <IconSparkles />,
  },
];

export function SidebarComponent() {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed

  // This is a simple way to guess the active page.
  // In a real app, this would come from a router.
  const currentPath = "/registration"; // Hardcoded for this page

  return (
    <Sidebar
      isCollapsed={isCollapsed}
      onMouseEnter={() => setIsCollapsed(false)} // Expand on hover
      onMouseLeave={() => setIsCollapsed(true)} // Collapse on leave
    >
      <SidebarBody isCollapsed={isCollapsed}>
        <div className="flex flex-col gap-2">
          {navigationItems.map((item, index) => (
            <SidebarLink
              key={index}
              link={item}
              isCollapsed={isCollapsed}
              // Set active if the link's href matches our hardcoded path
              isActive={currentPath === item.href}
            />
          ))}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

// --- Main App Component (FIXED for Next.js) ---

export default function App() {
  return (
    <html lang="en">
      <head>
        <title>Vigyan Mela - Registration</title>
        {/*
          This style block defines the theme colors from your example.
          This is a stand-in for a real Tailwind theme configuration.
        */}
        <style>{`
          :root {
            /* Define the colors based on a dark theme example */
            --background: hsl(0 0% 0%); /* Black */
            --primary: hsl(0 0% 98%); /* Almost white */
            --muted-foreground: hsl(0 0% 63.9%); /* Gray */
            --border: hsl(0 0% 14.9%);
          }
          
          /* Apply them to Tailwind classes */
          .bg-background { background-color: var(--background); }
          .text-primary { color: var(--primary); }
          .text-muted-foreground { color: var(--muted-foreground); }
          .border-neutral-800 { border-color: var(--border); }
        `}</style>
      </head>
      <body className="bg-background">
        <div className="flex min-h-screen w-full text-primary">
          <SidebarComponent />
          <main className="flex flex-1 items-center justify-center p-4">
            {/* This main area now only shows the registration form */}
            <EventRegistrationForm />
          </main>
        </div>
      </body>
    </html>
  );
}