import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { CATEGORY_HUE, type AgentDefinition } from "@/lib/agents";

export function AgentCard({ agent }: { agent: AgentDefinition }) {
  const AgentIcon = agent.icon;
  const hue = CATEGORY_HUE[agent.category];

  return (
    <Link
      href={agent.href}
      className="group flex h-full flex-col rounded-md border border-border bg-background p-5 transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface hover:shadow-[0_4px_16px_-4px_rgb(0_0_0/0.08)]"
    >
      <div
        className="category-badge-hover flex size-10 items-center justify-center rounded-md bg-surface text-ink-muted transition-[transform,background-color,color] duration-200 group-hover:scale-105"
        style={hue !== undefined ? ({ "--cat-hue": hue } as React.CSSProperties) : undefined}
      >
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
