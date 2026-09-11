"use client";

import { Command } from "cmdk";
import {
  FirstAidKitIcon,
  MagnifyingGlassIcon,
  ShuffleIcon,
  SquaresFourIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AGENT_CATEGORIES, ALL_AGENTS, getAgentsByCategory } from "@/lib/agents";
import { cn } from "@/lib/utils";

// Fired by anything that wants to open the palette without prop-drilling or
// lifting state (e.g. the dashboard hero's search button).
export const OPEN_COMMAND_PALETTE_EVENT = "agenticforge:open-command-palette";

function randomAgent() {
  return ALL_AGENTS[Math.floor(Math.random() * ALL_AGENTS.length)];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const openHandler = () => setOpen(true);
    document.addEventListener("keydown", handler);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, openHandler);
    return () => {
      document.removeEventListener("keydown", handler);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, openHandler);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setSearch("");
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full max-w-sm items-center gap-2.5 rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
      >
        <MagnifyingGlassIcon className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search agents...</span>
        <kbd className="rounded-sm border border-border-strong bg-surface-raised px-1.5 py-0.5 font-mono text-[11px] text-ink-subtle">
          &#8984;K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-modal-backdrop flex items-start justify-center bg-ink/40 pt-[15vh] backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="w-full max-w-xl"
              onClick={(event) => event.stopPropagation()}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <Command
                className={cn(
                  "z-modal w-full overflow-hidden rounded-lg border border-border bg-surface-raised shadow-2xl"
                )}
                shouldFilter
              >
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <MagnifyingGlassIcon className="size-4 shrink-0 text-ink-subtle" />
              <Command.Input
                autoFocus
                value={search}
                onValueChange={setSearch}
                placeholder="Search agents, LeadForge, MediForge..."
                className="h-12 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-subtle outline-none"
              />
              <kbd className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[11px] text-ink-subtle">
                Esc
              </kbd>
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              <Command.Empty className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <p className="text-sm text-ink-muted">
                  Nothing matches &ldquo;{search}&rdquo;.
                </p>
                <button
                  onClick={() => go(randomAgent().href)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
                >
                  <ShuffleIcon className="size-3.5" /> Try a random agent instead
                </button>
              </Command.Empty>

              <Command.Group
                heading="Enterprise Workflows"
                className="px-2 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle [&_[cmdk-group-items]]:mt-1.5"
              >
                <Command.Item
                  onSelect={() => go("/workflows/leadforge")}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm text-ink data-[selected=true]:bg-accent-tint data-[selected=true]:text-accent-ink"
                >
                  <UsersThreeIcon className="size-4 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium">LeadForge</span>
                    <span className="text-xs text-ink-muted">
                      AI SDR & CRM pipeline
                    </span>
                  </div>
                </Command.Item>
                <Command.Item
                  onSelect={() => go("/workflows/mediforge")}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm text-ink data-[selected=true]:bg-accent-tint data-[selected=true]:text-accent-ink"
                >
                  <FirstAidKitIcon className="size-4 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium">MediForge</span>
                    <span className="text-xs text-ink-muted">
                      AI hospital receptionist
                    </span>
                  </div>
                </Command.Item>
                <Command.Item
                  onSelect={() => go("/dashboard")}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm text-ink data-[selected=true]:bg-accent-tint data-[selected=true]:text-accent-ink"
                >
                  <SquaresFourIcon className="size-4 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium">Browse all agents</span>
                    <span className="text-xs text-ink-muted">
                      {ALL_AGENTS.length} agents across 8 categories
                    </span>
                  </div>
                </Command.Item>
              </Command.Group>

              {AGENT_CATEGORIES.map((category) => {
                const agents = getAgentsByCategory(category);
                if (agents.length === 0) return null;
                return (
                  <Command.Group
                    key={category}
                    heading={category}
                    className="px-2 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle [&_[cmdk-group-items]]:mt-1.5"
                  >
                    {agents.map((agent) => {
                      const AgentIcon = agent.icon;
                      return (
                        <Command.Item
                          key={agent.slug}
                          value={`${agent.name} ${agent.category}`}
                          onSelect={() => go(agent.href)}
                          className="flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm text-ink data-[selected=true]:bg-accent-tint data-[selected=true]:text-accent-ink"
                        >
                          <AgentIcon className="size-4 shrink-0" />
                          <span>{agent.name}</span>
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                );
              })}
              </Command.List>

              <div className="flex items-center justify-between border-t border-border px-4 py-2">
                <div className="flex items-center gap-3 text-[11px] text-ink-subtle">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded-sm border border-border px-1 font-mono">&uarr;</kbd>
                    <kbd className="rounded-sm border border-border px-1 font-mono">&darr;</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded-sm border border-border px-1 font-mono">&crarr;</kbd>
                    select
                  </span>
                </div>
                <span className="text-[11px] text-ink-subtle">
                  {ALL_AGENTS.length} agents
                </span>
              </div>
              </Command>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
