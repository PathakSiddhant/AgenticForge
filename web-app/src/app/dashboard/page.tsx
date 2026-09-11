import { ArrowUpRightIcon, FirstAidKitIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { AgentCard } from "@/components/agent-card";
import {
  AGENT_CATEGORIES,
  ALL_AGENTS,
  CATEGORY_HREF,
  getAgentsByCategory,
} from "@/lib/agents";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Agent Library
        </h1>
        <p className="mt-1.5 text-ink-muted">
          {ALL_AGENTS.length} agents across {AGENT_CATEGORIES.length}{" "}
          categories, plus two complete enterprise workflows.
        </p>
      </div>

      {/* Flagship workflows - distinct, larger treatment */}
      <div className="mb-14 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/workflows/leadforge"
          className="group flex flex-col rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent-tint-border"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-md bg-accent-tint text-accent-ink">
              <UsersThreeIcon className="size-5" weight="fill" />
            </div>
            <ArrowUpRightIcon className="size-4 text-ink-subtle transition-colors group-hover:text-ink" />
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
          className="group flex flex-col rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent-tint-border"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-md bg-accent-tint text-accent-ink">
              <FirstAidKitIcon className="size-5" weight="fill" />
            </div>
            <ArrowUpRightIcon className="size-4 text-ink-subtle transition-colors group-hover:text-ink" />
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

      {/* Every category, every agent - not a curated subset */}
      <div className="space-y-12">
        {AGENT_CATEGORIES.map((category) => {
          const agents = getAgentsByCategory(category);
          return (
            <div key={category}>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-[15px] font-semibold text-ink">
                  {category}
                </h2>
                <Link
                  href={CATEGORY_HREF[category]}
                  className="text-xs font-medium text-ink-subtle hover:text-ink"
                >
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <AgentCard key={agent.slug} agent={agent} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
