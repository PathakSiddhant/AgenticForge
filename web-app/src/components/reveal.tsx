"use client";

import { motion, useReducedMotion } from "motion/react";

// Reusable entrance primitive - "new content arrived, reveal it elegantly"
// rather than content just snapping into place. Used for staggered grids
// (agent cards) and single-block reveals (result panels) alike.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
