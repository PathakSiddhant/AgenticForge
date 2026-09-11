"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SESSION_KEY = "af-entrance-shown";

export function AppEntrance() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  const isAppRoute = pathname !== "/" && !pathname.startsWith("/sign-");

  useEffect(() => {
    if (!isAppRoute) return;
    // sessionStorage only exists client-side; this effect is the
    // intentional sync point for that external, browser-only state.
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (prefersReducedMotion) {
      sessionStorage.setItem(SESSION_KEY, "1");
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    // sessionStorage has no SSR-safe equivalent; this is the sync point.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, [isAppRoute, prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-background"
          style={{ zIndex: "var(--z-toast, 70)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="absolute size-64 rounded-full bg-accent/25 blur-3xl"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.6, 0.3], scale: [0.6, 1.15, 1.3] }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
          <motion.div
            className="relative size-32"
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src="/logo.png"
              alt="AgenticForge"
              fill
              priority
              className="object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
