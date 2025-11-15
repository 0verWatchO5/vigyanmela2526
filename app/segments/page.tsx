"use client"

import { HoverEffect } from "@/components/ui/card-hover-effect"

const segments = [
  {
    id: 1,
    title: "Technology & Innovation",
    description: "The Technology & Innovation section features projects that use modern tools such as Artificial Intelligence, Robotics, Smart Devices, and embedded systems to create practical solutions for real-world problems. This category highlights creative thinking, innovative design, and the ability to apply technology in meaningful ways. Students are encouraged to explore how emerging technologies can improve everyday life, automate tasks, enhance efficiency, and present new possibilities for the future.",
    link: "#technology-innovation",
  },
  {
    id: 2,
    title: "Environment & Sustainability",
    description: "The Environment & Sustainability section focuses on projects that promote a cleaner, healthier, and more responsible way of living. This category highlights ideas and solutions that help conserve energy, reduce pollution, manage waste effectively, and protect natural resources. Students are encouraged to explore how technology, awareness, and innovative thinking can contribute to a sustainable future—whether through renewable energy models, eco-friendly practices, recycling methods, or nature-preserving solutions. It aims to inspire practical approaches that support long-term environmental health and create a positive impact on our planet.",
    link: "#environment-sustainability",
  },
  {
    id: 3,
    title: "Health & Education",
    description: "The Health & Education section showcases projects that use technology or creative design to support better living and learning. This category includes apps, tools, or models that improve physical and mental health, encourage fitness, enhance learning experiences, or make education more accessible. Students can present solutions like wellness trackers, medical awareness tools, learning platforms, interactive models, or systems that simplify studying and skill building. The goal is to promote ideas that strengthen personal well-being and help people learn more effectively in a digital and evolving world.",
    link: "#health-education",
  },
  {
    id: 4,
    title: "Social Good",
    description: "The Social Good section highlights projects designed to make everyday life better for individuals, families, and communities. This category includes ideas that improve communication, enhance accessibility, support safety, or simplify common daily tasks. Students can present solutions that address social challenges, promote inclusion, assist vulnerable groups, or create smoother ways for people to interact and stay connected. The focus is on practical, meaningful innovations that bring positive change and contribute to the overall well-being of society.",
    link: "#social-good",
  },
  {
    id: 5,
    title: "Creative Science",
    description: "The Creative Science section celebrates curiosity, imagination, and hands-on exploration. It features fun, innovative experiments, models, and tech-based art that blend scientific principles with creativity. Students can showcase unique concepts, interactive demonstrations, visually engaging designs, or artistic projects built using scientific ideas or simple technology. The goal is to encourage playful learning, inspire curiosity, and show how science can be both educational and enjoyable through creative expression.",
    link: "#creative-science",
  },
];


export default function SegmentsPage() {
  return (


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
        <p className="text-muted-foreground mt-20 text-center text-lg max-w-3xl mx-auto">
           Visit us and explore each segment of innovation. Don't miss the chance to be part of something extraordinary!
         </p>
      </section>
    </div>
  )
}