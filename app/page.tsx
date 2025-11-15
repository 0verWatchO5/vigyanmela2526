import { Metadata } from "next";
import { HoverBorderGradientDemo } from "@/components/button";
import { HeroParallax } from "@/components/ui/hero-parallax";
import AnimatedBox from "@/components/animatedbox";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://vigyanmela.chetanacollege.in";

export const metadata: Metadata = {
  title: "Vigyan Mela 25 — Where Science Meets Innovation",
  description: "Join Vigyan Mela 25 to explore cutting-edge science projects, workshops, and networking opportunities.",
  openGraph: {
    title: "Vigyan Mela 25 — Where Science Meets Innovation",
    description: "Join Vigyan Mela 25 to explore cutting-edge science projects, workshops, and networking opportunities.",
    url: siteUrl,
    siteName: "Vigyan Mela 25",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${siteUrl}/images/VN.png`,
        width: 1200,
        height: 630,
        alt: "Vigyan Mela 25 Hero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vigyan Mela 25 — Where Science Meets Innovation",
    description: "Join Vigyan Mela 25 to explore cutting-edge science projects, workshops, and networking opportunities.",
    images: [`${siteUrl}/images/VN.png`],
  },
};

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


    <div className="w-full overflow-x-hidden">
      <section className="w-full overflow-x-hidden">
        <HeroParallax products={products} />
        <AnimatedBox  />
      </section>
    </div>
  );
}
