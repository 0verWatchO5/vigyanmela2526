"use client";


import Image from "next/image";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

const SponsorHoverGradient = ({ color }: { color: string }) => {
  return (
    <>
      <span
        className="absolute inset-x-0 -top-px block h-[2px] w-full bg-gradient-to-r from-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${color}, transparent)`,
        }}
      />
      <span
        className="absolute inset-x-0 -bottom-px block h-[2px] w-full bg-gradient-to-r from-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${color}, transparent)`,
        }}
      />
      <span
        className="absolute inset-y-0 -left-px block h-full w-[2px] bg-gradient-to-b from-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
        }}
      />
      <span
        className="absolute inset-y-0 -right-px block h-full w-[2px] bg-gradient-to-b from-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
        }}
      />
    </>
  );
}; 

const sponsors = [
  {
    id: 1,
    name: "Austrange Solutions",
    href: "https://www.austrangesolutions.com/",
    logo: "/images/austrange.ico",

    color: "#0e3cac", 
    description: "Empowering Lives Through Intelligent Solutions",
  },
  {
    id: 2,
    name: "HiTech Technology",
    href: "https://hitechnology.co.in/",
    logo: "/images/hitech.png",
    color: "#ec3136", 
    description:
      "Your Go-To Hub for Electronic Parts: Everything you need in one place",
  },
];

export default function Sponsors() {
  return (
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
            className="block" // The link wraps the whole card
          >
            <CardContainer className="inter-var w-full h-full">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-6 border flex flex-col justify-start">
                {/* Sponsor Logo Section */}
                <CardItem
                  translateZ="50"
                  className="w-full aspect-square rounded-lg overflow-hidden"
                >
                  <div className="group relative h-full w-full flex items-center justify-center bg-card group-hover/card:shadow-xl rounded-lg">
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
                        <span className="text-xl font-semibold text-primary">
                          {s.name}
                        </span>
                      </div>
                    )}
                    <SponsorHoverGradient color={s.color} />
                  </div>
                </CardItem>

                {/* Sponsor Name & Description Section */}
                <div className="mt-4 text-center">
                  <CardItem
                    translateZ="60"
                    className="text-lg font-semibold text-primary"
                  >
                    <h3>{s.name}</h3>
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="40"
                    className="mt-1 text-sm text-muted-foreground"
                  >
                    {s.description}
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          </a>
        ))}
      </div>
    </div>
  );
}