"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import SplineHero from "@/components/SplineHero";

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
          className={`pointer-events-none absolute z-20 transition-all duration-700 ease-in-out ${
            minimizeOverlay 
              ? "bottom-2 right-[0.22px] md:left-1/2 md:-translate-x-1/2 md:right-auto md:bottom-4 top-auto" 
              : "inset-0 flex items-center justify-center"
          }`}
        >
          <div 
            className={`pointer-events-auto transform transition-all duration-700 ease-in-out ${
              !minimizeOverlay && "animate-in fade-in-0 zoom-in-95"
            } ${
              minimizeOverlay && "scale-[0.85]"
            }`}
          >
            {/* Glassmorphism Card */}
            <div className={`relative rounded-3xl bg-black/90 shadow-2xl backdrop-blur-xl backdrop-saturate-150 border border-white/10 ${
              minimizeOverlay ? "p-3" : "p-8 md:p-12 lg:p-16"
            }`}>
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/10 via-white/5 to-transparent"></div>
              
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
                        className="h-auto w-full max-w-md drop-shadow-2xl md:max-w-lg lg:max-w-2xl rounded-2xl"
                      />
                    </div>
                    <p className="mb-8 text-xl text-white/90 drop-shadow-lg md:text-2xl lg:text-3xl">
                      Where Science Meets Innovation
                    </p>
                  </>
                )}
                
                {/* Action Buttons */}
                <div className={`flex ${minimizeOverlay ? "flex-row gap-2" : "flex-col md:flex-row md:justify-center gap-4"}`}>
                  <button
                    onClick={() => handleNavigation("/registration")}
                    className={`group relative overflow-hidden rounded-full bg-blue-400  shadow-lg transition-all hover:scale-105 hover:shadow-2xl ${
                      minimizeOverlay ? "px-4 py-2.5 text-sm" : "px-8 py-4"
                    }`}
                  >
                    <span className="relative z-10">{minimizeOverlay ? "Register as a Visitor" : "Register Now"}</span>
                    <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  </button>
                  
                  <button
                    onClick={() => handleNavigation("/college-registration")}
                    className={`group relative overflow-hidden rounded-full  bg-red-400 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-2xl ${
                      minimizeOverlay ? "px-4 py-2.5 text-sm" : "px-8 py-4"
                    }`}
                  >
                    <span className="relative z-10">{minimizeOverlay ? "Register as a College Student" : "College Registration"}</span>
                    <div className="absolute inset-0 bg-linear-to-r from-teal-600 to-green-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  </button>
                  
                  <button
                    onClick={() => handleNavigation("/segments")}
                    className={`group relative overflow-hidden rounded-full border-2 border-white/30 bg-white/10 font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:border-white/50 hover:bg-white/20 ${
                      minimizeOverlay ? "px-4 py-2.5 text-sm" : "px-8 py-4"
                    }`}
                  >
                    <span className="relative z-10">{minimizeOverlay ? "Explore Events" : "Explore Events"}</span>
                  </button>
                </div>
              </div>

              {!minimizeOverlay && (
                <>
                  {/* Decorative elements */}
                  <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-linear-to-br from-blue-400/30 to-transparent blur-2xl"></div>
                  <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-linear-to-tl from-purple-400/30 to-transparent blur-2xl"></div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
