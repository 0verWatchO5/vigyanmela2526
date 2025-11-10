"use client";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconHome, IconInfoCircle, IconUsers, IconChartBar, IconSparkles } from "@tabler/icons-react";

const navigationItems = [
  {
    label: "Home",
    href: "/",
    icon: <IconHome className="h-4 w-4 text-muted-foreground" />,
  },
  {
    label: "About",
    href: "/about",
    icon: <IconInfoCircle className="h-4 w-4 text-muted-foreground" />,
  },
  {
    label: "Registration",
    href: "/registration",
    icon: <IconUsers className="h-4 w-4 text-muted-foreground" />,
  },
  {
    label: "Segments",
    href: "/segments",
    icon: <IconChartBar className="h-4 w-4 text-muted-foreground" />,
  },
  {
    label: "Sponsors",
    href: "/sponsors",
    icon: <IconSparkles className="h-4 w-4 text-muted-foreground" />,
  },
];

export default function About() {
  return (
    <main className="min-h-screen bg-background">
      <Sidebar>
        <SidebarBody>
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl text-primary">
              Vigyan Mela
            </h1>
            <p className="text-muted-foreground text-sm mb-4">
              Where Science Meets Innovation
            </p>
            <div className="flex flex-col gap-2">
              {navigationItems.map((item, index) => (
                <SidebarLink key={index} link={item} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
    </main>
  );
}  