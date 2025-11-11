"use client";

// The sidebar components are no longer needed here
// import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
// import { IconHome, IconInfoCircle, IconUsers, IconChartBar, IconSparkles } from "@tabler/icons-react";

// The navigationItems are also in the layout
// const navigationItems = [ ... ];

export default function About() {
  return (
    // The <main> tag and <Sidebar> are in the layout
    <div className="w-full p-8 pt-24 lg:pt-8">
      <h1 className="text-4xl font-bold">About Vigyan Mela</h1>
      <p className="text-muted-foreground mt-4">
        Welcome to the about page. Add your content here.
      </p>
    </div>
  );
}