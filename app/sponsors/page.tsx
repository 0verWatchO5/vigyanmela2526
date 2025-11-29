"use client";


import Image from "next/image";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

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
    href: "https://maceazy.com/",
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
    <div className="w-full px-8 pb-40 lg:pt-8">
      {/* CTA Card for Interested Sponsors */}
      <div className="mb-16">
        <div className="relative overflow-hidden rounded-2xl p-1 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 shadow-[0_0_30px_rgba(59,130,246,0.5),0_0_60px_rgba(147,51,234,0.3)]">
          {/* Animated glow effect */}
          <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 opacity-50 blur-xl animate-pulse"></div>
          
          <div className="relative bg-background rounded-xl p-8 md:p-12 lg:p-16">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Text Section */}
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Interested in Sponsoring Vigyan Mela?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join us in supporting innovation and creativity. Partner with Vigyan Mela to showcase your brand and connect with brilliant minds.
                </p>
              </div>

              {/* Button Section */}
              <div className="flex flex-col gap-4 md:justify-end">
                <a href="tel:+917021524797" className="w-full">
                  <HoverBorderGradient
                    containerClassName="rounded-lg w-full"
                    as="button"
                    className="dark:bg-black bg-white text-black dark:text-white flex items-center justify-center gap-2 hover:cursor-pointer px-6 py-3 text-base font-semibold w-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Contact Us</span>
                  </HoverBorderGradient>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              <CardBody className="bg-gray-50 shadow-md shadow-blue-200 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] dark:shadow-none dark:shadow-emerald-500/20 border-black/[0.1] w-full h-full rounded-xl p-6 border flex flex-col justify-start">
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