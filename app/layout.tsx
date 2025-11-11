"use client";

// We can remove Metadata import, as it's not used in this client component
// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// A simple 'cn' utility to merge class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

// --- Icon Components (Copied from registration page) ---

const IconHome = (props: any) => (
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

const IconInfoCircle = (props: any) => (
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

const IconUsers = (props: any) => (
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

const IconChartBar = (props: any) => (
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

const IconSparkles = (props: any) => (
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

const IconMenu = (props: any) => (
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
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

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

// --- MODIFIED Mobile Header Component ---
const Header = ({ onMenuClick, isOpen }: { onMenuClick: () => void; isOpen: boolean }) => {
  return (
    <header className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 lg:hidden",
        "border-border" // Use global theme variable
      )}>
      <h1 className="whitespace-nowrap font-bold text-xl text-foreground"> {/* MODIFIED: text-primary to text-foreground */}
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
const MobileNavMenu = ({ isOpen, onClose, currentPath }: { isOpen: boolean; onClose: () => void; currentPath: string }) => {
  return (
    <div
      className={cn(
        "fixed top-16 left-0 z-20 w-full border-b bg-background p-4",
        "border-border", // Use global theme variable
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

const Sidebar = ({ children, isCollapsed, onMouseEnter, onMouseLeave }: { children: React.ReactNode; isCollapsed: boolean; onMouseEnter: () => void; onMouseLeave: () => void; }) => {
  return (
    <aside
      className={cn(
        "sticky top-0 z-50 flex h-screen flex-col overflow-y-auto border-r bg-background p-4",
        "border-border", // Use global theme variable
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

const SidebarBody = ({ children, isCollapsed }: { children: React.ReactNode; isCollapsed: boolean; }) => {
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
            "whitespace-nowrap font-bold text-2xl text-foreground", // MODIFIED: text-primary to text-foreground
            isCollapsed && "hidden"
          )}
        >
          Vigyan Mela
        </h1>
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
  ...props
}: {
  link: { href: string; icon: React.ReactElement; label: string };
  isCollapsed: boolean;
  isActive: boolean;
  [key: string]: any; // For onClick, etc.
}) => {
  return (
    <a
      href={link.href}
      className={cn(
        "relative group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200", // MODIFIED: text-primary to text-foreground
        isActive ? "bg-zinc-800" : "hover:bg-zinc-800", // This style is fine
        isCollapsed && "justify-center"
      )}
      {...props} // Apply props
    >
      {/* Active/Hover pill effect - This is the hover effect you wanted */}
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


// --- MODIFIED Sidebar Component (Desktop Only) ---
export function SidebarComponent({ currentPath }: { currentPath: string }) { 
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
    </Sidebar>
  );
}

// --- Main Root Layout ---

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname(); // Get current path

  // REMOVED the inlineStyles hack

  return (
    // ADDED className="dark" to activate the global dark theme
    <html lang="en" className="dark">
      <head>
        {/* REMOVED the <style> block */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`} // MODIFIED: text-primary to text-foreground
      >
        
        {/* 1. Mobile-only Header */}
        <Header 
          isOpen={isMobileMenuOpen}
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />
        {/* 2. Mobile-only Nav Menu */}
        <MobileNavMenu 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          currentPath={pathname}
        />

        <div className="flex min-h-screen w-full">
          
          {/* 3. Desktop-only Sidebar (with hover effects) */}
          <SidebarComponent currentPath={pathname} />

          {/* 4. Main content area */}
          <main className="flex flex-1 flex-col items-stretch">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}