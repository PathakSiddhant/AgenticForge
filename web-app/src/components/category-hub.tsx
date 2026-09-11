import { AgentCard } from "@/components/agent-card";
import { CATEGORY_HUE, CATEGORY_ICONS, getAgentsByCategory, type AgentCategory } from "@/lib/agents";

export function CategoryHub({
  category,
  description,
}: {
  category: AgentCategory;
  description: string;
}) {
  const agents = getAgentsByCategory(category);
  const CategoryIcon = CATEGORY_ICONS[category];
  const hue = CATEGORY_HUE[category];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-start gap-4">
        <div
          className="category-badge flex size-12 shrink-0 items-center justify-center rounded-md"
          style={hue !== undefined ? ({ "--cat-hue": hue } as React.CSSProperties) : undefined}
        >
          <CategoryIcon className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{category}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard key={agent.slug} agent={agent} />
        ))}
      </div>
    </div>
  );
}
