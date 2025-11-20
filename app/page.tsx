"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import SplineHero from "@/components/SplineHero";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const [showOverlay, setShowOverlay] = useState(true);
  const [minimizeOverlay, setMinimizeOverlay] = useState(false);

  useEffect(() => {
    // Only lock scroll on homepage, not on registration/login pages
    if (pathname === "/") {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    
    // Listen for any keyboard press, click, or touch
    const handleInteraction = (e: Event) => {
      if (showOverlay && !minimizeOverlay) {
        // Only minimize if user didn't click on a button
        const target = e.target as HTMLElement;
        if (!target.closest('button')) {
          setMinimizeOverlay(true);
        }
      }
    };

    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    
    return () => {
      // Restore scroll when leaving
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [showOverlay, minimizeOverlay]);

  const handleNavigation = (path: string) => {
    setShowOverlay(false);
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden" data-scroll-section>
      {/* Hero with Spline - Full interactive game (No Scroll) */}
      <SplineHero
        scene="https://prod.spline.design/EJ6hrQ53d-VbhRZU/scene.splinecode"
        posterUrl="/images/VN.png"
        fullScreen
        disableZoom
      />

      {/* Glassmorphism Overlay with Text */}
      {showOverlay && (
        <div 
          className={`pointer-events-none absolute z-20 ${
            minimizeOverlay 
              ? "bottom-2 right-[0.22px] md:left-1/2 md:-translate-x-1/2 md:right-auto md:bottom-4 top-auto" 
              : "inset-0 flex items-center justify-center"
          }`}
        >
          <div 
            className={`pointer-events-auto ${
              minimizeOverlay && "scale-[0.85]"
            }`}
          >
            {/* Glassmorphism Card */}
            <div className={`relative rounded-3xl bg-black/90 border border-white/20 ${
              minimizeOverlay ? "p-3" : "p-8 md:p-12 lg:p-16"
            }`}>
              {/* Gradient border effect - removed during video playback */}
              
              {/* Content */}
              <div className="relative z-10 text-center">
                {!minimizeOverlay && (
                  <>
                    <div className="mb-6 flex items-center justify-center">
                      <video 
                        src="/vigyanmelavideo.mp4" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        preload="metadata"
                        disablePictureInPicture
                        disableRemotePlayback
                        className="h-auto w-full max-w-md md:max-w-lg lg:max-w-2xl rounded-2xl"
                        style={{ display: 'block', isolation: 'isolate' }}
                      />
                    </div>
                    <p className="mb-8 text-xl text-white/90 drop-shadow-lg md:text-2xl lg:text-3xl">
                      Where Science Meets Innovation
                    </p>
                  </>
                )}
                
                {/* Action Buttons */}
                <div className={`flex ${minimizeOverlay ? "flex-row gap-3" : "flex-col md:flex-row md:justify-center gap-6"}`}>
                  <HoverBorderGradient
                    onClick={() => handleNavigation("/registration")}
                    containerClassName="rounded-full"
                    className={`bg-black text-white font-semibold ${
                      minimizeOverlay ? "px-6 py-2 text-sm" : "px-10 py-3"
                    }`}
                    duration={1}
                  >
                    {minimizeOverlay ? "Register as a Visitor" : "Register Now"}
                  </HoverBorderGradient>
                  
                  <HoverBorderGradient
                    onClick={() => handleNavigation("/college-registration")}
                    containerClassName="rounded-full"
                    className={`bg-black text-white font-semibold ${
                      minimizeOverlay ? "px-6 py-2 text-sm" : "px-10 py-3"
                    }`}
                    duration={1}
                  >
                    {minimizeOverlay ? "Register as a College Student" : "College Registration"}
                  </HoverBorderGradient>
                  
                  <HoverBorderGradient
                    onClick={() => handleNavigation("/segments")}
                    containerClassName="rounded-full"
                    className={`bg-black text-white font-semibold ${
                      minimizeOverlay ? "px-6 py-2 text-sm" : "px-10 py-3"
                    }`}
                    duration={1}
                  >
                    {minimizeOverlay ? "Explore Events" : "Explore Events"}
                  </HoverBorderGradient>
                </div>
              </div>

              {/* Decorative elements removed for performance */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
