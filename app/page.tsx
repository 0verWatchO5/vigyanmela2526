"use client";

import { useEffect } from "react";
import SplineHero from "@/components/SplineHero";

export default function Home() {
  useEffect(() => {
    // Lock body scroll when on homepage
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    
    return () => {
      // Restore scroll when leaving
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden" data-scroll-section>
      {/* Hero with Spline - Full interactive game (No Scroll) */}
      <SplineHero
        scene="https://prod.spline.design/EJ6hrQ53d-VbhRZU/scene.splinecode"
        posterUrl="/images/VN.png"
        fullScreen
        disableZoom
      />
    </div>
  );
}
