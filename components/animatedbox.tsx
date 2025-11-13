"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger); 

export default function AnimatedBox() {
 
  const rotateBoxRef = useRef<HTMLDivElement>(null);

  

    // Rotate animation
    if (rotateBoxRef.current) {
      gsap.to(rotateBoxRef.current, {
        rotation: 360,
        duration: 2,
        delay:2,
        // repeat: -1,
        borderRadius: "50%",
        ease: "power1.out",
        scrub: true,
        yoyo: true,
        scrollTrigger: {
          trigger: rotateBoxRef.current,
          // start: "bottom 50%",   
          // end: "bottom top",
          markers: true,
          pin: true,
        }   
      });
    }

  

  
  return (
    <div className=" w-full min-h-screen  ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Slide In Box */}
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-white text-xl font-semibold">Slide & Fade</h3>
          <div
            ref={rotateBoxRef}
            className="w-40 h-40 bg-linear-to-br from-cyan-400 to-blue-500 rounded-lg shadow-2xl flex items-center justify-center"
          >
            <span className="text-white font-bold text-lg">Box 1</span>
          </div>
        </div>

     
      </div>
    </div>
  );
}
