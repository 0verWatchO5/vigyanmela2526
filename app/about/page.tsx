"use client";

import { useState, useCallback, useEffect } from "react";
import { ParallaxScrollSecond } from "@/components/ui/parallax-scroll-2";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Timeline } from "@/components/ui/timeline";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "/images/G1.jpg",
  "/images/G3.JPG",
  "/images/G4.JPG",
  "/images/G5.JPG",
  "/images/G6.JPG",
  "/images/G7.jpg",
  "/images/G8.jpg",
  "/images/G9.jpg",
  "/images/G10.png",
  "/images/G11.png",
  "/images/G12.png",
  "/images/G13.png",
  "/images/G14.png",
  "/images/G15.png", 
  "/images/G18.png",
  "/images/G19.png",
  "/images/G20.png",
  "/images/G21.png",
  "/images/G22.png",
  "/images/G23.png",
  "/images/G24.png",
  "/images/G25.png",
  "/images/G26.png",
  "/images/G27.png",
  "/images/G28.png",
  "/images/G29.png",
  "/images/G30.png",
  "/images/G31.png",
  "/images/G32.png",
  "/images/G33.png",
  "/images/G34.png",
  "/images/G35.jpg",
  "/images/G36.jpg",
  "/images/G37.jpg",
  "/images/G38.jpg",
  "/images/G39.jpg",
  "/images/G40.jpg",
  "/images/G41.jpg",
  "/images/G42.jpg",
  "/images/G43.jpg",
  "/images/G44.jpg",
  "/images/G45.png",
];

const teamMembers = [
  {
    quote:
      "Leading the charge to make Vigyan Mela an unforgettable celebration of science and innovation for everyone.",
    name: "Mayuresh Chaubal",
    designation: "Vigyan Mela Head",
    src: "/images/Mayuresh.jpg",
    link: "https://www.linkedin.com/in/mayuresh-chaubal/",
  },
  {
    quote:
      "Crafting the digital experience and ensuring all our tech runs smoothly, from registration to live demos.",
    name: "Noorjahan Charania",
    designation: "Vigyan Mela Head",
    src: "/images/noor.jpg",
    link: "https://www.linkedin.com/in/noorjahan-charania-95bb8631a",
  },
  {
    quote:
      "Connecting with schools, partners, and the media to spread the word and bring our community together.",
    name: "Liyakat Shaikh",
    designation: "Core Contributors",
    src: "/images/Liyakat.jpg",
    link: "https://www.linkedin.com/in/shaikh-liyakat/",
  },
  {
    quote:
      "Designing the look and feel of the event, ensuring every poster, stage, and screen inspires creativity.",
    name: "Meet Korpe",
    designation: "Core Contributors",
    src: "images/Meet.jpg",
    link: "https://www.linkedin.com/in/meet-korpe/",
  },
  {
    quote:
      "Designing the look and feel of the event, ensuring every poster, stage, and screen inspires creativity.",
    name: "Vishnuraj Vishwakarma",
    designation: "Austrange Solution - Alumni Coordinator",
    src: "images/Vishnu.png",
    link: "https://www.linkedin.com/in/vishnuraj-vishwakarma/",
  },
];

const timelineData = [
  {
    year: "2022",
    title: "2022 -Foundation",
    content:
      "Vigyan Mela began as a vision to showcase student innovation and technical excellence.",
  },
  {
    year: "2023",
    title: "Growth & Recognition",
    content:
      "The event expanded significantly, attracting projects from multiple departments and earning inter-college recognition.",
  },
  {
    year: "2024",
    title: "Innovation Hub",
    content:
      "Vigyan Mela became a launchpad for startups, with several projects receiving support from the college&apos;s CIEL initiative.",
  },
  {
    year: "2025",
    title: "Vigyan Mela 4.0",
    content:
      "A premier tech festival celebrating cutting-edge innovations, fostering collaboration, and empowering the next generation of tech leaders.",
  },
];

export default function About() {
  // --- LIGHTBOX STATE & LOGIC ---
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

  // This finds the index of the clicked image URL so we know where to start navigating
  const openLightbox = (url: string) => {
    const index = images.indexOf(url);
    if (index !== -1) {
      setCurrentImageIndex(index);
    }
  };

  const closeLightbox = () => {
    setCurrentImageIndex(null);
  };

  // Navigate to next image (loops back to start)
  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentImageIndex !== null) {
      setCurrentImageIndex((prev) => 
        prev === null ? null : (prev + 1) % images.length
      );
    }
  }, [currentImageIndex]);

  // Navigate to previous image (loops to end)
  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentImageIndex !== null) {
      setCurrentImageIndex((prev) => 
        prev === null ? null : (prev - 1 + images.length) % images.length
      );
    }
  }, [currentImageIndex]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentImageIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentImageIndex, handleNext, handlePrev]);

  const tooltipItems = teamMembers.map((member, index) => ({
    id: index + 1,
    name: member.name,
    designation: member.designation,
    image: member.src,
    link: member.link,
  }));

  return (
    <div className="w-full relative">
      
      {/* About Section */}
      <div className="p-8 pt-24 lg:pt-8">
        <h1 className="text-4xl font-bold">About Vigyan Mela</h1>
        <p className="text-muted-foreground mt-4 text-lg max-w-3xl">
          Vigyaan Mela is not just a technical exhibition; 
          it's the flagship annual showcase of the BSc IT Department, 
          a platform where innovation, collaboration, and practical learning converge. 
          Our mission is to empower students to move beyond theory, 
          providing a stage to showcase their most ambitious technology-driven projects.
        </p>
        <p className="text-muted-foreground mt-4 max-w-3xl">
          From sophisticated IoT-based solutions to cutting-edge software innovations, 
          Vigyaan Mela is where excellence is recognized and futures are launched. 
          We celebrate a legacy of inter-college awards and are proud to be the launching pad for
          projects that have become official startups, now further supported by our college's CIEL initiative.
        </p>
      </div>

      {/* Timeline Component */}
      <Timeline data={timelineData} />

      {/* Gallery Component - Passes the click handler */}
      <div className="p-8">
        <h2 className="text-3xl font-bold mt-16 mb-8">Our Gallery</h2>
      </div>
      <ParallaxScrollSecond images={images} onImageClick={openLightbox} />
      
      {/* --- LIGHTBOX OVERLAY --- */}
      {currentImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition z-50"
          >
            <X size={32} />
          </button>

          {/* Main Image Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking the image area
          >
            <img 
              src={images[currentImageIndex]} 
              alt="Gallery preview" 
              className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl rounded-md select-none"
            />
          </div>

          {/* Previous Button */}
          <button 
            onClick={handlePrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/40 hover:bg-white/10 rounded-full transition z-50 backdrop-blur-sm"
            aria-label="Previous image"
          >
            <ChevronLeft size={40} />
          </button>

          {/* Next Button */}
          <button 
            onClick={handleNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/40 hover:bg-white/10 rounded-full transition z-50 backdrop-blur-sm"
            aria-label="Next image"
          >
            <ChevronRight size={40} />
          </button>
        </div>
      )}

      {/* Team Section */}
      <div className="p-8">
         <h2 className="text-3xl font-bold mt-16 mb-12 text-center">
           Meet the Developers
         </h2>
         
         <div className="flex flex-row items-center justify-center mb-10 w-full">
            <AnimatedTooltip items={tooltipItems} />
         </div>

         <p className="text-muted-foreground mt-24 text-center text-lg max-w-3xl mx-auto">
           Visit us for the next event and be part of the innovation.
         </p>
      </div>

    </div>
  );
}