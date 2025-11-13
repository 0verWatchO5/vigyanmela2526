"use client";

import { HoverBorderGradientDemo } from "@/components/button";
import { HeroParallax } from "@/components/ui/hero-parallax";
//import { navigationItems } from "./layout";
// Sidebar components are provided by the root layout; no need to duplicate here.

const products = [
  {
    title: "Web Development",
    link: "/segments#web-development",
    thumbnail: "/images/austrange.ico",
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
    // Sidebar and header are rendered by the root layout (layout.tsx)
    // Just render the page content directly
    <div className="w-full overflow-x-hidden">
      <section className="w-full overflow-x-hidden">
        <HeroParallax products={products} />
      </section>
    </div>
  );
}
