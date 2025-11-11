"use client";
import React, { useState, useRef } from "react";

// A simple 'cn' utility to merge class names
function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

// --- Icon Components (Re-created as SVGs) ---

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
    className="h-6 w-6 text-muted-foreground" // Made slightly larger
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconMenu = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-muted-foreground" // Made slightly larger
    {...props}
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
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


// --- Navigation Links Data ---
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
const currentPath = "/registration"; // Hardcoded for this page


// --- MODIFIED Mobile Header Component ---
const Header = ({ onMenuClick, isOpen }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-background px-4 lg:hidden">
      <h1 className="whitespace-nowrap font-bold text-xl text-primary">
        Vigyan Mela
      </h1>
      <button
        type="button"
        onClick={onMenuClick}
        className="p-2 rounded-md text-muted-foreground hover:bg-zinc-800"
      >
        {isOpen ? <IconX /> : <IconMenu />}
      </button>
    </header>
  );
};

// --- NEW Mobile Navigation Menu ---
const MobileNavMenu = ({ isOpen, onClose }) => {
  return (
    <div
      className={cn(
        "fixed top-16 left-0 z-20 w-full border-b border-neutral-800 bg-background p-4",
        "lg:hidden", // Hide on desktop
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-y-0" : "-translate-y-[200%]" // Slide from top
      )}
    >
      <div className="flex flex-col gap-2">
        {navigationItems.map((item, index) => (
          <SidebarLink
            key={index}
            link={item}
            isCollapsed={false} // Always show text
            isActive={currentPath === item.href}
            onClick={onClose} // Close menu on link click
          />
        ))}
      </div>
    </div>
  );
};

// --- MODIFIED Re-created UI Components (Sidebar) ---

const Sidebar = ({ children, isCollapsed, onMouseEnter, onMouseLeave }) => {
  return (
    <aside
      className={cn(
        "sticky top-0 z-50 flex h-screen flex-col overflow-y-auto border-r border-neutral-800 bg-background p-4",
        "transition-all duration-300 ease-in-out", // Use 'all' for width
        isCollapsed ? "w-20" : "w-64",
        "hidden lg:flex" // HIDE ON MOBILE, show on desktop
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
            "whitespace-nowrap font-bold text-2xl text-primary",
            isCollapsed && "hidden"
          )}
        >
          Vigyan Mela
        </h1>
        {/* Removed mobile close button */}
      </div>
      <p
        className={cn(
          "whitespace-nowrap text-muted-foreground text-sm mb-4",
          isCollapsed && "hidden"
        )}
      >
        Where Science Meets Innovation
      </p>
      
      {/* Links (main content) */}
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
};

const SidebarLink = ({
  link,
  isCollapsed,
  isActive,
  ...props // Pass rest of props (like onClick) to the <a> tag
}) => {
  return (
    <a
      href={link.href}
      className={cn(
        "relative group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors duration-200", // Use theme text
        isActive ? "bg-zinc-800" : "hover:bg-zinc-800",
        isCollapsed && "justify-center"
      )}
      {...props} // Apply props
    >
      {/* Active/Hover pill effect */}
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1 rounded-r-full bg-blue-500 transition-all duration-300 ease-in-out",
          isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-100"
        )}
      ></span>

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
}) => {
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
  const [errors, setErrors] = useState({});
  const [idCardFiles, setIdCardFiles] = useState([]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };
  
  const handleFileChange = (files) => {
    setIdCardFiles(files);
    if (files.length > 0) {
      setErrors((prev) => ({ ...prev, idcard: null }));
    }
  };

  const validate = () => {
    let tempErrors = {};
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

  const handleSubmit = (e) => {
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
      // In a real app, FileUpload would need a 'value' prop or a 'reset' ref
      window.location.reload(); 
    } else {
      console.log("Validation failed");
    }
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-background p-4 md:rounded-2xl md:p-8 dark:shadow-[0px_0px_1px_1px_#262626]">
      <h2 className="text-xl font-bold text-primary">
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

// --- MODIFIED Sidebar Component (Desktop Only) ---

export function SidebarComponent() { 
  // State is now internal to the component
  const [isCollapsed, setIsCollapsed] = useState(true); 

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
              isActive={currentPath === item.href}
            />
          ))}
        </div>
      </SidebarBody>
      {/* Removed the desktop toggle button */}
    </Sidebar>
  );
}

// --- MODIFIED Main App Component ---

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Removed isCollapsed state

  return (
    <html lang="en">
      <head>
        <title>Vigyan Mela - Registration</title>
        {/* ... (style block is unchanged) ... */}
        <style>{`
          :root {
            --background: hsl(0 0% 0%);
            --primary: hsl(0 0% 98%);
            --muted-foreground: hsl(0 0% 63.9%);
            --border: hsl(0 0% 14.9%);
          }
          .bg-background { background-color: var(--background); }
          .text-primary { color: var(--primary); }
          .text-muted-foreground { color: var(--muted-foreground); }
          .border-neutral-800 { border-color: var(--border); }
        `}</style>
      </head>
      <body className="bg-background">
        
        {/* 1. Mobile-only Header */}
        <Header 
          isOpen={isMobileMenuOpen}
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />
        {/* 2. Mobile-only Nav Menu */}
        <MobileNavMenu 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <div className="flex min-h-screen w-full text-primary">
          
          {/* 3. Desktop-only Sidebar */}
          <SidebarComponent />

          {/* 4. Main content area */}
          <main className="flex flex-1 items-center justify-center p-4 pt-16 lg:pt-4">
            <EventRegistrationForm />
          </main>
        </div>
      </body>
    </html>
  );
}