"use client";

import { useUser } from "@clerk/nextjs";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { motion, useReducedMotion } from "motion/react";

import { OPEN_COMMAND_PALETTE_EVENT } from "@/components/command-palette";

// The user base is IST by default (see project conventions) - a time-of-day
// greeting should reflect that, not the visitor's local clock.
function currentGreeting() {
  const hourIST = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date())
  );
  if (hourIST >= 5 && hourIST < 12) return "Good morning";
  if (hourIST >= 12 && hourIST < 17) return "Good afternoon";
  if (hourIST >= 17 && hourIST < 21) return "Good evening";
  return "Working late";
}

export function DashboardHero({
  agentCount,
  categoryCount,
}: {
  agentCount: number;
  categoryCount: number;
}) {
  const { user, isLoaded } = useUser();
  const prefersReducedMotion = useReducedMotion();
  const greeting = currentGreeting();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mb-10"
    >
      <p className="mb-2 text-sm font-medium text-ink-subtle">
        {greeting}
        {isLoaded && user?.firstName ? `, ${user.firstName}` : ""}
      </p>
      <h1 className="text-[28px] font-semibold tracking-tight text-ink sm:text-[32px]">
        What do you want to forge today?
      </h1>
      <p className="mt-2 text-ink-muted">
        {agentCount} specialized agents across {categoryCount} categories,
        plus two complete enterprise workflows.
      </p>

      <button
        onClick={() =>
          window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))
        }
        className="group mt-6 flex w-full max-w-lg items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3.5 text-left transition-colors duration-150 hover:border-border-strong hover:bg-surface-raised"
      >
        <MagnifyingGlassIcon className="size-4.5 shrink-0 text-ink-subtle transition-colors group-hover:text-ink" />
        <span className="flex-1 text-[15px] text-ink-muted transition-colors group-hover:text-ink">
          Search agents, LeadForge, MediForge...
        </span>
        <kbd className="rounded-sm border border-border-strong bg-surface-raised px-1.5 py-0.5 font-mono text-[11px] text-ink-subtle">
          &#8984;K
        </kbd>
      </button>
    </motion.div>
  );
}
