"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// SSR-safe: the /next export already disables SSR, dynamic is extra safety
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-linear-to-br from-slate-800/60 to-slate-900/60" />
  ),
});

type Props = {
  scene: string;
  className?: string;
  posterUrl?: string; // optional static fallback for reduced motion
  intersectionMargin?: string; // e.g., "0px 0px -20% 0px" to earlier-load
  fullScreen?: boolean; // if true, fill the viewport height
  disableInteractions?: boolean; // if true, block pointer interactions
  disableZoom?: boolean; // if true, prevent wheel/pinch zoom
  onReady?: (app: any) => void; // expose Spline App on load for advanced tweaks
};

export default function SplineHero({
  scene,
  className,
  posterUrl,
  intersectionMargin = "0px 0px -10% 0px",
  fullScreen = true,
  disableInteractions = false,
  disableZoom = false,
  onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const appRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!containerRef.current || reducedMotion) return;
    let cancelled = false;

    // Lazy mount when visible
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !cancelled) {
          // Defer to idle to not block initial paint
          if ("requestIdleCallback" in window) {
            // @ts-ignore
            (window as any).requestIdleCallback(() => setInView(true), { timeout: 1500 });
          } else {
            setTimeout(() => setInView(true), 0);
          }
          io.disconnect();
        }
      },
      { rootMargin: intersectionMargin, threshold: 0.1 }
    );
    io.observe(containerRef.current);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [intersectionMargin, reducedMotion]);

  const showSpline = mounted && !reducedMotion && inView;

  return (
    <div
      ref={containerRef}
      className={
        "relative w-full overflow-hidden rounded-none z-0 " +
        (fullScreen ? "h-svh" : "h-[60vh] md:h-[80vh]") +
        " " +
        (className ?? "")
      }
      aria-label="Interactive 3D hero"
    >
      {showSpline ? (
        <div className="absolute inset-0 h-full w-full">
          <Spline
            scene={scene}
            className={
              "absolute inset-0 h-full w-full touch-none " +
              (disableInteractions ? "pointer-events-none" : "")
            }
            onLoad={(app: any) => {
              appRef.current = app;
              if (typeof onReady === "function") onReady(app);
            }}
          />
          {/* Push game controls away from navbar */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-20 bg-linear-to-b from-black/40 to-transparent lg:h-24" />
          {/* Hide Spline UI controls */}
          <style jsx global>{`
            canvas + div[style*="position: fixed"],
            canvas + div[style*="position: absolute"] {
              opacity: 0 !important;
              pointer-events: none !important;
            }
          `}</style>
        </div>
      ) : posterUrl ? (
        <img
          src={posterUrl}
          alt="Hero preview"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
      )}

      {/* Subtle overlay for contrast */}
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
    </div>
  );
}
