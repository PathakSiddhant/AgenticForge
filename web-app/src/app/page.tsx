import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  ChatCircleDotsIcon,
  CheckIcon,
  FirstAidKitIcon,
  PhoneCallIcon,
  UsersThreeIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

import { ALL_AGENTS, CATEGORY_HREF, CATEGORY_ICONS } from "@/lib/agents";

export default function LandingPage() {
  const previewAgents = ALL_AGENTS.slice(4, 9);

  return (
    <div className="min-h-dvh bg-background">
      <LandingNav />

      {/* Hero - asymmetric split, not centered */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-16 md:grid-cols-[1.1fr_0.9fr] md:pt-24">
        <div>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-ink md:text-[3.4rem]">
            Purpose-built AI agents,
            <br />
            not one more chatbot.
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-muted">
            {ALL_AGENTS.length} specialized agents across finance, sales,
            support, and operations, plus two complete AI-run workflows for
            sales and front-desk reception.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-6 text-[15px] font-medium text-background transition-opacity hover:opacity-90"
            >
              Enter Workspace
              <ArrowRightIcon className="size-4" />
            </Link>
            <a
              href="https://github.com/PathakSiddhant/AgenticForge"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border-strong px-6 text-[15px] font-medium text-ink transition-colors hover:bg-surface"
            >
              View source
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 divide-x divide-border text-sm text-ink-muted [&>*:not(:first-child)]:pl-8">
            <span className="flex items-center gap-2">
              <CheckIcon className="size-4 text-accent" weight="bold" />
              Structured, not vague, outputs
            </span>
            <span className="flex items-center gap-2">
              <CheckIcon className="size-4 text-accent" weight="bold" />
              Built on your own data (RAG)
            </span>
            <span className="flex items-center gap-2">
              <CheckIcon className="size-4 text-accent" weight="bold" />
              Two complete workflow products
            </span>
          </div>
        </div>

        {/* Honest UI preview panel, not a fake browser-chrome screenshot */}
        <div className="relative">
          <div className="rounded-lg border border-border bg-surface-raised p-2 shadow-[0_1px_0_0_var(--color-border)]">
            <div className="flex items-center gap-1.5 border-b border-border px-3 py-2.5">
              <span className="size-2 rounded-full bg-border-strong" />
              <span className="size-2 rounded-full bg-border-strong" />
              <span className="size-2 rounded-full bg-border-strong" />
              <span className="ml-2 text-xs text-ink-subtle">
                Agent Library
              </span>
            </div>
            <ul className="divide-y divide-border">
              {previewAgents.map((agent) => {
                const AgentIcon = agent.icon;
                return (
                  <li
                    key={agent.slug}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-surface text-ink-muted">
                      <AgentIcon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {agent.name}
                      </p>
                    </div>
                    <span className="text-[11px] text-ink-subtle">
                      {agent.category.split(" ")[0]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="absolute -right-4 -top-4 -z-10 size-full rounded-lg border border-border bg-surface" />
        </div>
      </section>

      {/* LeadForge spotlight */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="mb-5 flex size-11 items-center justify-center rounded-md bg-accent-tint text-accent-ink">
              <UsersThreeIcon className="size-5" weight="fill" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              LeadForge: the AI SDR that never sleeps
            </h2>
            <p className="mt-4 max-w-[52ch] leading-relaxed text-ink-muted">
              Every inbound lead gets scored and routed by Gemini the moment
              it arrives, nurtured through a RAG-backed email assistant that
              actually knows your pricing and playbook, and scheduled
              straight onto your calendar. Executive reporting - Excel
              exports and AI-written memos - ships on demand, not once a
              quarter.
            </p>
            <Link
              href="/workflows/leadforge"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink hover:underline"
            >
              Open LeadForge
              <ArrowUpRightIcon className="size-4" />
            </Link>
          </div>
          <div className="order-1 grid grid-cols-2 gap-3 md:order-2">
            <StatPanel label="Lead captured" value="Scored in seconds" />
            <StatPanel label="Pipeline" value="Hot / Warm / Cold routing" />
            <StatPanel label="Meetings" value="Auto-scheduled" />
            <StatPanel label="Reporting" value="AI executive memos" />
          </div>
        </div>
      </section>

      {/* MediForge spotlight - deliberately different layout family */}
      <section className="border-t border-border bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-5 flex size-11 items-center justify-center rounded-md bg-white/10 text-background">
            <FirstAidKitIcon className="size-5" weight="fill" />
          </div>
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-background md:text-3xl">
            MediForge: reception that answers on the first ring
          </h2>
          <p className="mt-4 max-w-[58ch] leading-relaxed text-background/70">
            One receptionist agent, three channels. It books, reschedules,
            and cancels appointments across doctors and specialties, respects
            capacity limits per slot, and follows up with a PDF confirmation
            automatically.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-white/10 sm:grid-cols-3">
            <ChannelTile
              icon={ChatCircleDotsIcon}
              title="Web chat"
              body="Embedded assistant on your site, booking in real time."
            />
            <ChannelTile
              icon={WhatsappLogoIcon}
              title="WhatsApp"
              body="Patients message the same agent on WhatsApp via Twilio."
            />
            <ChannelTile
              icon={PhoneCallIcon}
              title="Live voice"
              body="A real phone call, answered by Vapi-powered voice AI."
            />
          </div>

          <Link
            href="/workflows/mediforge"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-background hover:underline"
          >
            Open MediForge
            <ArrowUpRightIcon className="size-4" />
          </Link>
        </div>
      </section>

      {/* Agent library */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            One agent for almost everything else
          </h2>
          <p className="max-w-[60ch] leading-relaxed text-ink-muted">
            Eight categories, each with focused agents that take one job and
            do it well - no generic do-everything prompt box.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(CATEGORY_HREF)
            .filter(([category]) => category !== "Developer Sandbox")
            .map(([category, href]) => {
              const CategoryIcon =
                CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
              const count = ALL_AGENTS.filter(
                (agent) => agent.category === category
              ).length;
              return (
                <Link
                  key={category}
                  href={href}
                  className="group rounded-md border border-border p-5 transition-colors hover:border-border-strong hover:bg-surface"
                >
                  <CategoryIcon className="size-5 text-ink-muted transition-colors group-hover:text-accent-ink" />
                  <p className="mt-4 text-sm font-medium text-ink">
                    {category}
                  </p>
                  <p className="mt-1 text-xs text-ink-subtle">
                    {count} agent{count === 1 ? "" : "s"}
                  </p>
                </Link>
              );
            })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              Pick an agent. See it work.
            </h2>
            <p className="mt-2 text-ink-muted">
              No setup ceremony - sign in and every agent is one click away.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-ink px-6 text-[15px] font-medium text-background transition-opacity hover:opacity-90"
          >
            Enter Workspace
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function LandingNav() {
  return (
    <header className="sticky top-0 z-sticky flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="relative size-6">
          <Image src="/logo.png" alt="" fill className="object-contain" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          AgenticForge
        </span>
      </Link>
      <Link
        href="/dashboard"
        className="inline-flex h-9 items-center rounded-md bg-ink px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Sign in
      </Link>
    </header>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-ink-subtle sm:flex-row">
        <span>&copy; {new Date().getFullYear()} AgenticForge</span>
        <a
          href="https://github.com/PathakSiddhant/AgenticForge"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-ink"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}

function StatPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function ChannelTile({
  icon: TileIcon,
  title,
  body,
}: {
  icon: typeof ChatCircleDotsIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-ink p-6">
      <TileIcon className="size-5 text-background/60" />
      <p className="mt-3 text-sm font-medium text-background">{title}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-background/60">
        {body}
      </p>
    </div>
  );
}
