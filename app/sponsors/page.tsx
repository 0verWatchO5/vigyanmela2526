"use client";

import { CardSpotlight } from "@/components/ui/card-spotlight";
import Image from "next/image";

const sponsors = [
  {
    id: 1,
    name: "Austrange Solutions",
    href: "https://www.austrangesolutions.com/",
    logo: "/images/austrange.ico",
    // company brand color used for the spotlight on hover (not linked to global CSS)
    color: "#0e3cac",
    description: "Empowering Lives Through Intelligent Solutions",
  },
  {
    id: 2,
    name: "HiTech Technology",
    href: "https://hitechnology.co.in/",
    logo: "/images/hitech.png",
    color: "#ec3136",
    description: "Your Go-To Hub for Electronic Parts: Everything you need in one place",
  },
  // Adding extra cards just in case
  //
  //{
  //   id: 3,
  //   name: "Orbit Innovations",
  //   href: "https://example.com",
  //   logo: "/images/sponsors/orbit.png",
  //   color: "#F97316",
  // },
  // {
  //   id: 4,
  //   name: "Pioneer Tech",
  //   href: "https://example.com",
  //   logo: "/images/sponsors/pioneer.png",
  //   color: "#EF4444",
  // },
];

export default function Sponsors() {
  return (
  // The <main> tag and <Sidebar> are in the layout
  // Add extra right padding for page content
  <div className="w-full px-8 pl-20 pb-40 lg:pt-8">
      <h1 className="text-4xl font-bold">Our Sponsors</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl">
        We are grateful to our sponsors for supporting Vigyan Mela.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sponsors.map((s) => (
          <a
            key={s.id}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
              <CardSpotlight
                color={s.color}
                radius={220}
                className="aspect-square w-full rounded-lg overflow-hidden"
                style={{ padding: 0 }}
              >
                <div className="relative h-full w-full flex items-center justify-center bg-card">
                  {s.logo ? (
                      <Image
                        src={s.logo}
                        alt={s.name}
                        width={400}
                        height={400}
                        className={
                          s.name === "HiTech Technology"
                            ? "object-contain h-1/2 w-1/2"
                            : "object-contain h-full w-full"
                        }
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full p-6">
                        <span className="text-xl font-semibold text-primary">{s.name}</span>
                      </div>
                    )}
                </div>
              </CardSpotlight>
              <h3 className="mt-3 text-center text-lg font-semibold text-primary">
                {s.name}
              </h3>
              <div className="mt-1 text-center text-sm text-muted-foreground">
                {s.description}
              </div>
          </a>
        ))}
      </div>
    </div>
  );
}