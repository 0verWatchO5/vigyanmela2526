"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";

type SmoothScrollContextType = {
  scroll: LocomotiveScroll | null;
};

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  scroll: null,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollRef = useRef<LocomotiveScroll | null>(null);
  const [scroll, setScroll] = useState<LocomotiveScroll | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamically import Locomotive Scroll to avoid SSR issues
    import("locomotive-scroll").then((LocomotiveScrollModule) => {
      const LocomotiveScrollClass = LocomotiveScrollModule.default;

      const locomotiveScroll = new LocomotiveScrollClass({
        el: containerRef.current!,
        smooth: true,
        multiplier: 1,
        class: "is-reveal",
      });

      scrollRef.current = locomotiveScroll;
      setScroll(locomotiveScroll);

      // Update on window resize
      const handleResize = () => {
        locomotiveScroll.update();
      };

      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        locomotiveScroll.destroy();
      };
    });
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ scroll }}>
      <div data-scroll-container ref={containerRef}>
        {children}
      </div>
    </SmoothScrollContext.Provider>
  );
}
