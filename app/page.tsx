"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import SplineHero from "@/components/SplineHero";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const [showOverlay, setShowOverlay] = useState(true);
  const [minimizeOverlay, setMinimizeOverlay] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [gifLoaded, setGifLoaded] = useState(false);

  // Lazy load GIF after page is interactive (requestIdleCallback)
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      // @ts-ignore
      (window as any).requestIdleCallback(() => {
        const img = new Image();
        img.src = "/vigmela_video_gif.gif";
        img.onload = () => setGifLoaded(true);
      });
    } else {
      setTimeout(() => {
        const img = new Image();
        img.src = "/vigmela_video_gif.gif";
        img.onload = () => setGifLoaded(true);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    // Only lock scroll on homepage, not on registration/login pages
    if (pathname === "/") {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    
    // Listen for user interaction to load game (smart rendering)
    const handleInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Only load game if user didn't click on a button
      if (!target.closest('button') && !gameLoaded && !isLoadingGame) {
        setIsLoadingGame(true);
        setGameLoaded(true);
        setMinimizeOverlay(true); // Minimize overlay when loading starts
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
  }, [showOverlay, minimizeOverlay, gameLoaded, isLoadingGame, pathname]);

  const handleNavigation = (path: string) => {
    setShowOverlay(false);
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden" data-scroll-section>
      {/* Hero Background - Static image as fallback */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/game_screen.png)',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}
      >
        {/* Subtle overlay for contrast */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Spline Game - Lazy loaded on first interaction */}
      {gameLoaded && (
        <div className="absolute inset-0 z-10">
          <SplineHero
            scene="https://prod.spline.design/EJ6hrQ53d-VbhRZU/scene.splinecode"
            posterUrl="/images/VN.png"
            fullScreen
            disableZoom
            onReady={() => setIsLoadingGame(false)}
          />
        </div>
      )}

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
              minimizeOverlay ? "p-2 sm:p-3" : "p-4 sm:p-6 md:p-12 lg:p-16"
            }`}>
              {/* Gradient border effect - removed during video playback */}
              
              {/* Content */}
              <div className="relative z-10 text-center">
                {isLoadingGame ? (
                  // Loading Screen - Only spinner, no GIF
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <div className="animate-spin">
                      <svg className="w-12 h-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <p className="text-lg text-white/90">Loading Game...</p>
                  </div>
                ) : !minimizeOverlay ? (
                  // Initial GIF State - Show GIF and text
                  <>
                    <div className="mb-3 sm:mb-6 flex items-center justify-center">
                      {gifLoaded ? (
                        <img 
                          src="/vigmela_video_gif.gif" 
                          alt="Vigyan Mela Animation"
                          className="h-auto w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl rounded-2xl cursor-pointer will-change-auto"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="h-auto w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl rounded-2xl bg-gray-700/50 animate-pulse aspect-video" />
                      )}
                    </div>
                    <p className="mb-4 sm:mb-8 text-base sm:text-xl md:text-2xl lg:text-3xl text-white/90 drop-shadow-lg">
                      Where Science Meets Innovation
                    </p>
                  </>
                ) : null}
                
                {/* Action Buttons - Always visible */}
                <div className={`flex flex-wrap justify-center gap-2 sm:gap-3 ${minimizeOverlay ? "flex-row" : "flex-col sm:flex-row md:justify-center gap-2 sm:gap-6 mb-[5%]"}`}>
                  <HoverBorderGradient
                    onClick={() => handleNavigation("/registration")}
                    containerClassName="rounded-full"
                    className={`bg-black text-white font-semibold whitespace-nowrap ${
                      minimizeOverlay ? "px-2 sm:px-3 py-1.5 text-xs sm:text-sm" : "px-6 sm:px-10 py-2 sm:py-3 text-sm sm:text-base"
                    }`}
                    duration={1}
                  >
                    {minimizeOverlay ? "Visitor" : "Free Pass for Visitors"}
                  </HoverBorderGradient>
                  
                  <HoverBorderGradient
                    onClick={() => handleNavigation("/college-registration")}
                    containerClassName="rounded-full"
                    className={`bg-black text-white font-semibold whitespace-nowrap ${
                      minimizeOverlay ? "px-2 sm:px-3 py-1.5 text-xs sm:text-sm" : "px-6 sm:px-10 py-2 sm:py-3 text-sm sm:text-base"
                    }`}
                    duration={1}
                  >
                    {minimizeOverlay ? "College" : "Project Registration"}
                  </HoverBorderGradient>
                  
                  <HoverBorderGradient
                    onClick={() => handleNavigation("/segments")}
                    containerClassName="rounded-full"
                    className={`bg-black text-white font-semibold whitespace-nowrap ${
                      minimizeOverlay ? "px-2 sm:px-3 py-1.5 text-xs sm:text-sm" : "px-6 sm:px-10 py-2 sm:py-3 text-sm sm:text-base"
                    }`}
                    duration={1}
                  >
                    {minimizeOverlay ? "About" : "About US"}
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
