import { ArrowUpRightIcon, FirstAidKitIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { AgentCard } from "@/components/agent-card";
import { DashboardHero } from "@/components/dashboard-hero";
import { RecentlyUsed } from "@/components/recently-used";
import { Reveal } from "@/components/reveal";
import {
  AGENT_CATEGORIES,
  ALL_AGENTS,
  CATEGORY_HREF,
  CATEGORY_HUE,
  CATEGORY_ICONS,
  getAgentsByCategory,
} from "@/lib/agents";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      <DashboardHero
        agentCount={ALL_AGENTS.length}
        categoryCount={AGENT_CATEGORIES.length}
      />

      <RecentlyUsed />

      {/* Flagship workflows - distinct, larger treatment */}
      <Reveal className="mb-14">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-[15px] font-semibold text-ink">
            Complete workflows
          </h2>
          <span className="text-xs font-medium text-ink-subtle">
            Multi-agent, end to end
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href="/workflows/leadforge"
            className="group flex flex-col rounded-lg border border-border bg-surface p-6 transition-[border-color,background-color] duration-200 hover:border-accent-tint-border hover:bg-background"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-md bg-accent-tint text-accent-ink transition-transform duration-200 group-hover:scale-105">
                <UsersThreeIcon className="size-5" weight="fill" />
              </div>
              <ArrowUpRightIcon className="size-4 text-ink-subtle transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
            </div>
            <h3 className="mt-4 text-[17px] font-medium text-ink">
              LeadForge
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              AI SDR and CRM: lead scoring, RAG-backed nurture, scheduling, and
              executive reporting.
            </p>
          </Link>

          <Link
            href="/workflows/mediforge"
            className="group flex flex-col rounded-lg border border-border bg-surface p-6 transition-[border-color,background-color] duration-200 hover:border-accent-tint-border hover:bg-background"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-md bg-accent-tint text-accent-ink transition-transform duration-200 group-hover:scale-105">
                <FirstAidKitIcon className="size-5" weight="fill" />
              </div>
              <ArrowUpRightIcon className="size-4 text-ink-subtle transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
            </div>
            <h3 className="mt-4 text-[17px] font-medium text-ink">
              MediForge
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              AI hospital receptionist across web chat, WhatsApp, and live
              voice calls.
            </p>
          </Link>
        </div>
      </Reveal>

      {/* Every category, every agent - not a curated subset */}
      <div className="space-y-12">
        {AGENT_CATEGORIES.map((category) => {
          const agents = getAgentsByCategory(category);
          const CategoryIcon = CATEGORY_ICONS[category];
          const hue = CATEGORY_HUE[category];
          return (
            <div key={category}>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                  <CategoryIcon
                    className="category-ink size-4"
                    style={hue !== undefined ? ({ "--cat-hue": hue } as React.CSSProperties) : undefined}
                  />
                  {category}
                </h2>
                <Link
                  href={CATEGORY_HREF[category]}
                  className="text-xs font-medium text-ink-subtle transition-colors hover:text-ink"
                >
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent, i) => (
                  <Reveal key={agent.slug} delay={i * 0.04} className="h-full">
                    <AgentCard agent={agent} />
                  </Reveal>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
