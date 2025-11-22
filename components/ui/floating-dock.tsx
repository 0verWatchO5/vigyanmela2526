import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  hideOnHomeMobile,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
  hideOnHomeMobile?: boolean;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      {!hideOnHomeMobile && <FloatingDockMobile items={items} className={mobileClassName} />}
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  return (
    <div className={cn("fixed bottom-4 left-0 right-0 flex justify-center md:hidden z-40", className)}>
      <motion.div
        className="flex h-16 items-center gap-2 rounded-2xl bg-gray-50 px-4 py-2 dark:bg-neutral-900 shadow-lg shadow-blue-400 dark:shadow-blue-600"
      >
        {items.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors"
            title={item.title}
          >
            <div className="h-5 w-5">{item.icon}</div>
          </a>
        ))}
      </motion.div>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const mouseY = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseY.set(e.pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn(
        "fixed right-4 top-1/2 -translate-y-1/2 hidden w-16 flex-col items-center gap-4 rounded-2xl bg-gray-50 px-3 py-4 md:flex dark:bg-neutral-900 z-40 shadow-lg shadow-blue-400 dark:shadow-blue-600",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainerVertical mouseY={mouseY} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainerVertical({
  mouseY,
  title,
  icon,
  href,
}: {
  mouseY: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseY, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  );

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 10, y: "-50%" }}
              animate={{ opacity: 1, x: 0, y: "-50%" }}
              exit={{ opacity: 0, x: 2, y: "-50%" }}
              className="absolute -left-8 top-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}
