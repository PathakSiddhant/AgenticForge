"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // next-themes resolves the theme synchronously on the client (no
    // system-preference lookup needed with enableSystem={false}), so
    // checking !resolvedTheme alone still mismatches server vs. client on
    // first paint. The mounted flag guarantees the placeholder renders
    // identically on both passes; only after hydration completes does this
    // swap to the real button.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || !resolvedTheme) {
    return <div className="size-9" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <SunIcon weight="regular" /> : <MoonIcon weight="regular" />}
    </Button>
  );
}
