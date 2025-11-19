"use client";

import { ParallaxScrollSecond } from "@/components/ui/parallax-scroll-2";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

const images = [
  "/images/G1.jpg",
  "/images/G2.jpg",
  "https://images.unsplash.com/photo-1554080353-a576cf803bda?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D&auto=format&fit=crop&w=3387&q=80",
  "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D&auto=format&fit=crop&w=3070&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D&auto=format&fit=crop&w=3540&q=80",
  "https://images.unsplash.com/photo-1682686581854-5e71f58e7e3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D&auto=format&fit=crop&w=3540&q=80",
  "https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D&auto=format&fit=crop&w=3540&q=80",
  "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D&auto=format&fit=crop&w=3540&q=80",
  "https://images.unsplash.com/photo-1439853949127-fa647821eba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D&auto=format&fit=crop&w=2640&q=80",
  "https://images.unsplash.com/photo-1554080353-a576cf803bda?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D&auto=format&fit=crop&w=3387&q=80",
  "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D&auto=format&fit=crop&w=3070&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D&auto=format&fit=crop&w=3540&q=80",
  "https://images.unsplash.com/photo-1554080353-a576cf803bda?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D&auto=format&fit=crop&w=3387&q=80",
  "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D&auto=format&fit=crop&w=3070&q=80",
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
    designation: "Developer",
    src: "/images/Liyakat.jpg",
    link: "https://www.linkedin.com/in/shaikh-liyakat/",
  },
  {
    quote:
      "Designing the look and feel of the event, ensuring every poster, stage, and screen inspires creativity.",
    name: "Meet Korpe",
    designation: "Developer",
    src: "images/Meet.jpg",
    link: "https://www.linkedin.com/in/meet-korpe/",
  },
  {
    quote:
      "Designing the look and feel of the event, ensuring every poster, stage, and screen inspires creativity.",
    name: "Vishnuraj Vishwakarma",
    designation: "Alumni Coordinator",
    src: "images/Vishnu.png",
    link: "https://www.linkedin.com/in/vishnuraj-vishwakarma/",
  },
];

export default function About() {
  // Map existing teamMembers to the format required by AnimatedTooltip
  const tooltipItems = teamMembers.map((member, index) => ({
    id: index + 1,
    name: member.name,
    designation: member.designation,
    image: member.src,
    link: member.link,
  }));

  return (
    <div className="w-full">
      
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

        <h2 className="text-3xl font-bold mt-16 mb-8">Our Gallery</h2>
      </div>

      {/* Gallery Component */}
      <ParallaxScrollSecond images={images} />
      
      {/* Team Section */}
      <div className="p-8">
         <h2 className="text-3xl font-bold mt-16 mb-12 text-center">
           Meet the Team
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