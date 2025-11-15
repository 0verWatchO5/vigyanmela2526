import RegistrationAuth from "@/components/auth/RegistrationAuth";
import RegistrationOrTicket from "@/components/registration/RegistrationOrTicket";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Registration - Vigyan Mela 25",
  description:
    "Complete your registration for Vigyan Mela 25 and get your ticket.",
  openGraph: {
    title: "Event Registration - Vigyan Mela 25",
    description:
      "Complete your registration for Vigyan Mela 25 and get your ticket.",
    url: "https://vigyanmela.chetanacollege.in/registration",
    siteName: "Vigyan Mela 25",
    type: "article",
    images: [
      {
        url: "/images/VN.png",
        width: 1200,
        height: 630,
        alt: "Vigyan Mela 25 Registration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Registration - Vigyan Mela 25",
    description: "Complete your registration for Vigyan Mela 25 and get your ticket.",
    images: [
      {
        url: "/images/VN.png",
        width: 1200,
        height: 630,
        alt: "Vigyan Mela 25 Registration",
      },
    ],
  }
};

export default function RegistrationPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 pt-16 lg:pt-4 w-full">
      <RegistrationAuth className="max-w-xl w-full">
        <RegistrationOrTicket />
      </RegistrationAuth>
    </div>
  );
}
