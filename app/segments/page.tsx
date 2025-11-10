"use client"

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconHome, IconInfoCircle, IconUsers, IconChartBar, IconSparkles } from "@tabler/icons-react";
import { HoverEffect } from "@/components/ui/card-hover-effect"

const segments = [
  {
    id: 1,
    title: "Web Development 🌐",
    description: "Explore modern web technologies and frameworks including React, Next.js, TypeScript, and Tailwind CSS.",
    link: "#web-development",
  },
  {
    id: 2,
    title: "AI & Machine Learning 🤖",
    description: "Discover the future of artificial intelligence with Deep Learning, NLP, Computer Vision, and LLMs.",
    link: "#ai-ml",
  },
  {
    id: 3,
    title: "Mobile Development 📱",
    description: "Build apps for iOS and Android using React Native, Flutter, Swift, and Kotlin.",
    link: "#mobile",
  },
  {
    id: 4,
    title: "Cloud & DevOps ☁️",
    description: "Master cloud infrastructure and deployment with AWS, Docker, Kubernetes, and CI/CD.",
    link: "#cloud-devops",
  },
  {
    id: 5,
    title: "Cybersecurity 🔒",
    description: "Learn to protect digital assets through Ethical Hacking, Cryptography, Network Security, and Penetration Testing.",
    link: "#security",
  },
  {
    id: 6,
    title: "Data Science 📊",
    description: "Unlock insights from data using Python, Pandas, Visualization, and Statistics.",
    link: "#data-science",
  },
];

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

export default function SegmentsPage() {
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

    <div className="md:ml-64 lg:mr-20">
      <section className="min-h-screen py-20 px-4 md:px-8 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Event Segments
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore diverse technology tracks and choose your areas of interest
            </p>
          </div>

          <HoverEffect items={segments} className="gap-4" />
        </div>
      </section>
    </div>
    </main>
  )
}
