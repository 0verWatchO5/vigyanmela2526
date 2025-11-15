"use client";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

export const ParallaxScrollSecond = ({
  images,
  className,
}: {
  images: string[];
  className?: string;
}) => {
  const gridRef = useRef<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({
    container: gridRef, // This tells useScroll to track the div with gridRef
    offset: ["start start", "end start"],
  });

  const translateYFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateXFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const rotateXFirst = useTransform(scrollYProgress, [0, 1], [0, -20]);

  const translateYThird = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateXThird = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const rotateXThird = useTransform(scrollYProgress, [0, 1], [0, 20]);

  const third = Math.ceil(images.length / 3);

  const firstPart = images.slice(0, third);
  const secondPart = images.slice(third, 2 * third);
  const thirdPart = images.slice(2 * third);

  return (
    <div
  className={cn(
    "h-[40rem] items-start overflow-y-auto overflow-x-hidden w-full scrollbar-width-none [&::-webkit-scrollbar]:hidden",
    className
  )}
  ref={gridRef}
>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start max-w-5xl mx-auto gap-10 py-40 px-10"

      >
        <div className="grid gap-10">
          {firstPart.map((el, idx) => (
            <motion.div
              style={{
                y: translateYFirst,
                x: translateXFirst,
                rotateZ: rotateXFirst,
              }}
              key={"grid-1" + idx}
            >
              <img
                src={el}
                className="h-80 w-full object-cover object-left-top rounded-lg gap-10 m-0 p-0 cursor-pointer hover:opacity-90 transition"
                height="400"
                width="400"
                alt="thumbnail"
                onClick={() => setSelectedImage(el)}
              />
            </motion.div>
          ))}
        </div>
        <div className="grid gap-10">
          {secondPart.map((el, idx) => (
            <motion.div key={"grid-2" + idx}>
              <img
                src={el}
                className="h-80 w-full object-cover object-left-top rounded-lg gap-10 m-0 p-0 cursor-pointer hover:opacity-90 transition"
                height="400"
                width="400"
                alt="thumbnail"
                onClick={() => setSelectedImage(el)}
              />
            </motion.div>
          ))}
        </div>
        <div className="grid gap-10">
          {thirdPart.map((el, idx) => (
            <motion.div
              style={{
                y: translateYThird,
                x: translateXThird,
                rotateZ: rotateXThird,
              }}
              key={"grid-3" + idx}
            >
              <img
                src={el}
                className="h-80 w-full object-cover object-left-top rounded-lg gap-10 m-0 p-0 cursor-pointer hover:opacity-90 transition"
                height="400"
                width="400"
                alt="thumbnail"
                onClick={() => setSelectedImage(el)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={selectedImage}
                alt="Full view"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="absolute top-6 right-6 text-white text-4xl font-bold hover:text-gray-300 transition"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};