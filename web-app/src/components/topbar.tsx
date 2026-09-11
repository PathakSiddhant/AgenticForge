"use client";

import { usePathname } from "next/navigation";

import { CommandPalette } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";

export function Topbar() {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/sign-")) return null;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border px-6">
      <div className="max-w-md flex-1">
        <CommandPalette />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
