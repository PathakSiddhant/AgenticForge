import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { AgentDefinition } from "@/lib/agents";

export function AgentCard({ agent }: { agent: AgentDefinition }) {
  const AgentIcon = agent.icon;

  return (
    <Link
      href={agent.href}
      className="group flex flex-col rounded-md border border-border bg-background p-5 transition-colors hover:border-border-strong hover:bg-surface"
    >
      <div className="flex size-10 items-center justify-center rounded-md bg-surface text-ink-muted transition-colors group-hover:bg-accent-tint group-hover:text-accent-ink">
        <AgentIcon className="size-5" />
      </div>
      <h3 className="mt-4 text-[15px] font-medium text-ink">{agent.name}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">
        {agent.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {agent.capabilities.map((capability) => (
          <Badge key={capability} variant="neutral">
            {capability}
          </Badge>
        ))}
      </div>
    </Link>
  );
}
