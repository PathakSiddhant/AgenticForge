"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CrownSimpleIcon,
  FirstAidKitIcon,
  SquaresFourIcon,
  TerminalIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { AGENT_CATEGORIES, CATEGORY_HREF, CATEGORY_ICONS } from "@/lib/agents";
import { cn } from "@/lib/utils";

const coreLinks = [
  { href: "/dashboard", icon: SquaresFourIcon, label: "Discover Agents" },
  { href: "/sandbox", icon: TerminalIcon, label: "Developer Sandbox" },
];

const workflowLinks = [
  { href: "/workflows/leadforge", icon: UsersThreeIcon, label: "LeadForge" },
  { href: "/workflows/mediforge", icon: FirstAidKitIcon, label: "MediForge" },
];

function NavLink({
  href,
  icon: NavIcon,
  label,
  collapsed,
  active,
  accent = false,
}: {
  href: string;
  icon: typeof SquaresFourIcon;
  label: string;
  collapsed: boolean;
  active: boolean;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
        collapsed && "justify-center",
        active
          ? accent
            ? "bg-accent-tint font-medium text-accent-ink"
            : "bg-surface font-medium text-ink"
          : "text-ink-muted hover:bg-surface hover:text-ink"
      )}
    >
      <NavIcon
        className="size-[18px] shrink-0"
        weight={active ? "fill" : "regular"}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const { user, isLoaded } = useUser();

  if (pathname === "/" || pathname.startsWith("/sign-")) return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={cn(
        "relative hidden h-full shrink-0 flex-col border-r border-border bg-background transition-[width] duration-200 md:flex",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-6 z-sticky flex size-6 items-center justify-center rounded-full border border-border bg-surface-raised text-ink-subtle shadow-sm transition-colors hover:text-ink"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <CaretRightIcon className="size-3" />
        ) : (
          <CaretLeftIcon className="size-3" />
        )}
      </button>

      <div
        className={cn(
          "flex h-20 shrink-0 items-center gap-3 px-4",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="relative size-11 shrink-0">
          <Image src="/logo.png" alt="" fill priority className="object-contain" />
        </div>
        {!collapsed && (
          <span className="truncate text-base font-semibold tracking-tight text-ink">
            AgenticForge
          </span>
        )}
      </div>

      <nav className="flex flex-1 flex-col overflow-hidden px-3 pb-3">
        <div className="shrink-0 space-y-0.5">
          {coreLinks.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              collapsed={collapsed}
              active={isActive(link.href)}
            />
          ))}
        </div>

        <div className="my-3 shrink-0 border-t border-border" />

        <div className="shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
              <CrownSimpleIcon className="size-3" />
              Enterprise Workflows
            </div>
          )}
          <div className="space-y-0.5">
            {workflowLinks.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                collapsed={collapsed}
                active={isActive(link.href)}
                accent
              />
            ))}
          </div>
        </div>

        <div className="my-3 shrink-0 border-t border-border" />

        <div className="flex min-h-0 flex-1 flex-col">
          <button
            onClick={() => setCategoriesOpen((v) => !v)}
            className={cn(
              "flex shrink-0 items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle transition-colors hover:text-ink",
              collapsed && "justify-center"
            )}
          >
            {!collapsed && <span>Agent Library</span>}
            {!collapsed && (
              <CaretDownIcon
                className={cn(
                  "size-3 transition-transform",
                  categoriesOpen && "rotate-180"
                )}
              />
            )}
          </button>

          {(categoriesOpen || collapsed) && (
            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto custom-scrollbar pr-0.5">
              {AGENT_CATEGORIES.map((category) => (
                <NavLink
                  key={category}
                  href={CATEGORY_HREF[category]}
                  icon={CATEGORY_ICONS[category]}
                  label={category}
                  collapsed={collapsed}
                  active={isActive(CATEGORY_HREF[category])}
                />
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-md px-1 py-1",
            collapsed && "justify-center"
          )}
        >
          <UserButton
            appearance={{ elements: { avatarBox: "size-7 rounded-full" } }}
          />
          {!collapsed && isLoaded && user && (
            <span className="truncate text-[13px] font-medium text-ink">
              {user.fullName}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
