"use client";

import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ALL_AGENTS } from "@/lib/agents";
import { getRecentAgentSlugs } from "@/lib/recent-agents";

export function RecentlyUsed() {
  const [slugs, setSlugs] = useState<string[] | null>(null);

  useEffect(() => {
    // localStorage doesn't exist on the server; this is the sync point for
    // that client-only state. Runs once on mount, not tied to navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlugs(getRecentAgentSlugs());
  }, []);

  if (!slugs || slugs.length === 0) return null;

  const agents = slugs
    .map((slug) => ALL_AGENTS.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  if (agents.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
        <ClockCounterClockwiseIcon className="size-3.5" /> Recently used
      </h2>
      <div className="flex flex-wrap gap-2">
        {agents.map((agent) => {
          const AgentIcon = agent.icon;
          return (
            <Link
              key={agent.slug}
              href={agent.href}
              className="group flex items-center gap-2 rounded-full border border-border bg-background py-1.5 pl-1.5 pr-4 text-sm transition-colors hover:border-border-strong hover:bg-surface"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-surface text-ink-muted transition-colors group-hover:bg-accent-tint group-hover:text-accent-ink">
                <AgentIcon className="size-3.5" />
              </span>
              <span className="font-medium text-ink">{agent.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
