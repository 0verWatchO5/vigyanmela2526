"use client";

import { HeroParallax } from "@/components/ui/hero-parallax";
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

const products = [
  {
    title: "Web Development",
    link: "/segments#web-development",
    thumbnail: "/images/web-dev.jpg",
  },
  {
    title: "AI & Machine Learning",
    link: "/segments#ai-ml",
    thumbnail: "/images/ai-ml.jpg",
  },
  {
    title: "Mobile Development",
    link: "/segments#mobile",
    thumbnail: "/images/mobile-dev.jpg",
  },
  {
    title: "Cloud & DevOps",
    link: "/segments#cloud-devops",
    thumbnail: "/images/cloud.jpg",
  },
  {
    title: "Cybersecurity",
    link: "/segments#security",
    thumbnail: "/images/security.jpg",
  },
  {
    title: "Data Science",
    link: "/segments#data-science",
    thumbnail: "/images/data-science.jpg",
  },
  {
    title: "Interactive Workshops",
    link: "/registration",
    thumbnail: "/images/workshops.jpg",
  },
  {
    title: "Expert Talks",
    link: "/registration",
    thumbnail: "/images/talks.jpg",
  },
  {
    title: "Networking Events",
    link: "/registration",
    thumbnail: "/images/networking.jpg",
  },
  {
    title: "Hackathons",
    link: "/registration",
    thumbnail: "/images/hackathon.jpg",
  },
  {
    title: "Innovation Showcase",
    link: "/registration",
    thumbnail: "/images/innovation.jpg",
  },
  {
    title: "Career Fair",
    link: "/registration",
    thumbnail: "/images/career.jpg",
  },
];

export default function Home() {
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
      <div className="md:pl-[60px] lg:pl-[60px] transition-all duration-300">
        <section className="relative">
          <div className="min-h-screen">
            <HeroParallax products={products} />
          </div>
        </section>
      </div>
    </main>
  );
}
