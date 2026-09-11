"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { ALL_AGENTS } from "@/lib/agents";
import { recordAgentVisit } from "@/lib/recent-agents";

// Invisible, app-wide. Mounted once in the root layout instead of adding a
// tracking call to all 27+ individual agent pages.
export function AgentVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const agent = ALL_AGENTS.find((a) => a.href === pathname);
    if (agent) recordAgentVisit(agent.slug);
  }, [pathname]);

  return null;
}
