"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

// --- ICONS ---

const IconSun = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const IconMoon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

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

// --- NAVIGATION ITEMS ---

export const navigationItems = [
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

// --- COMPONENTS ---

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center justify-center p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground transition-colors"
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <IconSun className="h-5 w-5" />
      ) : (
        <IconMoon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

const Header = ({ onMenuClick, isOpen }: { onMenuClick: () => void; isOpen: boolean }) => {
  return (
    <header className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 lg:hidden",
        "border-border" 
      )}>
      <h1 className="whitespace-nowrap font-bold text-xl text-foreground">
        Vigyan Mela
      </h1>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-md text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {isOpen ? <IconX /> : <IconMenu />}
        </button>
      </div>
    </header>
  );
};

const MobileNavMenu = ({ isOpen, onClose, currentPath }: { isOpen: boolean; onClose: () => void; currentPath: string }) => {
  return (
    <div
      className={cn(
        "fixed top-16 left-0 z-20 w-full border-b bg-background p-4",
        "border-border", 
        "lg:hidden", 
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-y-0" : "-translate-y-[200%]" 
      )}
    >
      <div className="flex flex-col gap-2">
        {navigationItems.map((item, index) => (
          <SidebarLink
            key={index}
            link={item}
            isCollapsed={false} 
            isActive={currentPath === item.href}
            onClick={onClose} 
          />
        ))}
      </div>
    </div>
  );
};

const Sidebar = ({ children, isCollapsed, onMouseEnter, onMouseLeave }: { children: React.ReactNode; isCollapsed: boolean; onMouseEnter: () => void; onMouseLeave: () => void; }) => {
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-50 flex h-screen flex-col overflow-y-auto border-r bg-background p-4",
        "border-border", 
        "transition-all duration-300 ease-in-out", 
        isCollapsed ? "w-20" : "w-64",
        "hidden lg:flex" 
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
            "whitespace-nowrap font-bold text-2xl text-foreground", 
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
      
      <div className="flex-grow flex flex-col">
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
  link: { href: string; icon: React.ReactElement<{ className?: string }>; label: string };
  isCollapsed: boolean;
  isActive: boolean;
  [key: string]: any; 
}) => {
  return (
    <a
      href={link.href}
      className={cn(
        "relative group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200", 
        // FIXED: Adaptive background colors (light gray in light mode, dark gray in dark mode)
        isActive ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-100 dark:hover:bg-zinc-800", 
        isCollapsed && "justify-center"
      )}
      {...props} 
    >
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

// Updated SidebarComponent to accept state props from RootLayout
export function SidebarComponent({ 
  currentPath, 
  isCollapsed, 
  setIsCollapsed 
}: { 
  currentPath: string;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}) { 

  return (
    <Sidebar
      isCollapsed={isCollapsed}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <SidebarBody isCollapsed={isCollapsed}>
        <div className="flex flex-col gap-2 flex-1">
          {navigationItems.map((item, index) => (
            <SidebarLink
              key={index}
              link={item}
              isCollapsed={isCollapsed}
              isActive={currentPath === item.href}
            />
          ))}
        </div>
        <div className="mt-auto border-t border-border pt-4 flex items-center justify-center">
           <ThemeToggle />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // LIFTED STATE: Sidebar state is now managed here
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const pathname = usePathname(); 

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
          
          <Header 
            isOpen={isMobileMenuOpen}
            onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          />
          
          <MobileNavMenu 
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            currentPath={pathname}
          />

        <div className="flex min-h-screen w-full">
          
          {}
          <SidebarComponent currentPath={pathname} />

          {/* 4. Main content area - add left margin to account for fixed sidebar */}
          <main className="flex flex-1 flex-col items-stretch lg:ml-20 w-100">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}