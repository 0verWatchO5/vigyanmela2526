"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type ScrollVideoProps = {
  frameCount?: number;
  frameFolder?: string;
  className?: string;
};

export default function ScrollVideo({
  frameCount = 80,
  frameFolder = "/vigyanmela_intro",
  className = "",
}: ScrollVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Register GSAP ScrollTrigger on client side only
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Preload all frames
    const frameImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, "0");
      img.src = `${frameFolder}/ezgif-frame-${frameNum}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setIsReady(true);
        }
      };
      frameImages.push(img);
    }

    // Object to track current frame
    const frameIndex = { frame: 0 };

    // Render function
    const render = () => {
      const currentFrame = Math.min(
        Math.floor(frameIndex.frame),
        frameCount - 1
      );
      const img = frameImages[currentFrame];
      
      if (img && img.complete) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate aspect ratio fit (cover mode)
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;
        
        context.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShift_x,
          centerShift_y,
          img.width * ratio,
          img.height * ratio
        );
      }
    };

    // Wait for at least first frame before setting up ScrollTrigger
    const checkFirstFrame = setInterval(() => {
      if (frameImages[0]?.complete) {
        clearInterval(checkFirstFrame);
        render();

        // Create ScrollTrigger animation
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "+=300%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              frameIndex.frame = self.progress * (frameCount - 1);
              render();
            },
          },
        });
      }
    }, 100);

    // Handle window resize
    const handleResize = () => {
      setCanvasSize();
      render();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(checkFirstFrame);
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [frameCount, frameFolder]);

  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`}
      style={{ height: "100vh" }}
      data-scroll-section={false}
    >
      <canvas
        ref={canvasRef}
        className="sticky left-0 top-0 h-screen w-screen bg-black"
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            <p>Loading Animation...</p>
          </div>
        </div>
      )}
    </div>
  );
}
