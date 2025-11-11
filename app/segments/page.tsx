"use client"

// Sidebar components removed
import { HoverEffect } from "@/components/ui/card-hover-effect"

const segments = [
  {
    id: 1,
    title: "Technology & Innovation",
    description: "Projects using new technology such as Artificial Intelligence, Robots, or Smart Devices.",
    link: "#technology-innovation",
  },
  {
    id: 2,
    title: "Environment & Sustainability",
    description: "Ideas that help save energy, reduce pollution, or protect nature.",
    link: "#environment-sustainability",
  },
  {
    id: 3,
    title: "Health & Education",
    description: "Apps, tools, or models that support health, fitness, or learning.",
    link: "#health-education",
  },
  {
    id: 4,
    title: "Social Good",
    description: "Projects that make daily life easier, improve communication, or help the community.",
    link: "#social-good",
  },
  {
    id: 5,
    title: "Creative Science",
    description: "Fun and innovative experiments, models, or tech-based art.",
    link: "#creative-science",
  },
];

// navigationItems removed

export default function SegmentsPage() {
  return (
    // <main> tag and <Sidebar> removed
    // The old md:ml-64 is no longer needed
    <div className="w-full">
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
  )
}