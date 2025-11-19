"use client";

import { ReactNode } from "react";

type ParallaxSectionProps = {
  children: ReactNode;
  speed?: number; // -5 to 5 (negative = slower, positive = faster)
  direction?: "vertical" | "horizontal";
  delay?: number;
  className?: string;
};

export function ParallaxSection({
  children,
  speed = 0.5,
  direction = "vertical",
  delay = 0,
  className = "",
}: ParallaxSectionProps) {
  return (
    <div
      data-scroll
      data-scroll-speed={speed}
      data-scroll-direction={direction}
      data-scroll-delay={delay}
      className={className}
    >
      {children}
    </div>
  );
}

type ParallaxTextProps = {
  children: ReactNode;
  speed?: number;
  className?: string;
};

export function ParallaxText({
  children,
  speed = 1,
  className = "",
}: ParallaxTextProps) {
  return (
    <div
      data-scroll
      data-scroll-speed={speed}
      data-scroll-delay="0.05"
      className={className}
    >
      {children}
    </div>
  );
}

type RevealSectionProps = {
  children: ReactNode;
  className?: string;
};

export function RevealSection({
  children,
  className = "",
}: RevealSectionProps) {
  return (
    <div
      data-scroll
      data-scroll-repeat
      className={`opacity-0 transition-opacity duration-1000 is-reveal ${className}`}
    >
      {children}
    </div>
  );
}
