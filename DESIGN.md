# AgenticForge Design System

## Direction

Restrained, technical, premium. The explicit anti-goals: no glassmorphism,
no blue-purple gradient blobs, no glowing borders, no emoji as icons, no
generic "AI SaaS template" look. Reference points: Linear, Vercel,
Stripe, Raycast - studied for information hierarchy and restraint, not
copied.

Color strategy: **Restrained** (per impeccable's new-project guidance) -
tinted neutrals plus one controlled accent, not a full multi-color
palette. Dark-first (matches the product's current default and the
reference set), with a fully-designed light mode - **light is the
default theme**, dark is opt-in and persisted.

## Why this palette, specifically

The generic move for an "AI product" is blue-to-purple. We're
deliberately not doing that. "Forge" is a literal name - a forge is
where raw material becomes something crafted, under heat. The palette
takes that seriously instead of treating the name as decoration: cool,
structural zinc neutrals (the "workshop") plus a single warm ember/amber
accent (the "heat") used sparingly and consistently. It's distinctive
to this product specifically, not a swap-in-able brand blue.

## Tokens

### Neutrals
Tailwind's built-in `zinc` scale, mapped to semantic roles:

| Role | Light | Dark |
|---|---|---|
| `bg` (page) | white | zinc-950 |
| `surface` (cards, panels) | zinc-50 | zinc-900 |
| `surface-raised` (modals, popovers) | white | zinc-900 |
| `border` | zinc-200 | zinc-800 |
| `border-strong` | zinc-300 | zinc-700 |
| `ink` (primary text) | zinc-900 | zinc-50 |
| `ink-muted` (secondary text) | zinc-500 | zinc-400 |
| `ink-subtle` (tertiary/placeholder) | zinc-400 | zinc-600 |

No pure black or pure white as a *fill* (zinc-950/zinc-50 instead) -
pure black reads harsh and cheap on screens.

### Accent (ember)
Custom OKLCH ramp, not Tailwind's stock orange/amber (too close to
"warning" connotation and too yellow):

| Token | Value | Use |
|---|---|---|
| `accent-100` | `oklch(0.95 0.04 38)` | subtle tint backgrounds, badges |
| `accent-200` | `oklch(0.90 0.07 38)` | badge borders |
| `accent-500` | `oklch(0.68 0.19 38)` | highlights, icons, links |
| `accent-600` | `oklch(0.60 0.20 35)` | primary button fill (AA vs. white text) |
| `accent-700` | `oklch(0.52 0.19 32)` | hover/active state |

One accent, used consistently. No secondary "brand purple." Status
colors (success/warning/danger) are separate, semantic, and never used
as decoration - only to communicate real state (Hot/Warm/Cold lead
status, error states, confirmations).

### Typography
- **Sans:** Geist (via `next/font/google`) - not Inter. Deliberate,
  technical, pairs with the Vercel/Linear-adjacent register without
  being a literal copy.
- **Mono:** Geist Mono - for agent IDs, technical values, code-like
  data (API responses, timestamps in tables).
- Display headings: `tracking-tight`, capped at a sane clamp, never
  gradient-filled text.
- Body: zinc-500/600 range minimum for AA contrast, capped at 65-75ch
  line length.

### Radius & shape
One radius scale, used consistently: `--radius-sm` (6px, inputs/badges),
`--radius-md` (10px, cards/buttons), `--radius-lg` (16px, modals/panels).
No mixing of `rounded-xl` and `rounded-3xl` on sibling elements the way
the current app does.

### Icons
`@phosphor-icons/react`, **regular** weight by default, **fill** weight
for active/selected nav states only. One family, one weight convention,
site-wide. Replaces every emoji used as a UI icon.

### Motion
Functional, not decorative. Transitions on `transform`/`opacity` only.
Theme toggle transitions color tokens (200ms, not the current 400ms
blanket rule on every element). Respects `prefers-reduced-motion`.
No infinite-loop ambient animation on product screens (the current
`animate-bounce` on the MediForge chat launcher and `animate-pulse` on
status dots used indiscriminately get re-evaluated case by case: a
pulse on a genuine "live" indicator communicates state and stays; a
bounce on a static button is decorative and goes).

## Component inventory (built as needed, not speculatively)

Shared primitives to extract as the redesign touches each surface:
Button (primary/secondary/ghost/danger), Card, Badge (status pills -
replaces ad hoc colored spans), Input/Select/Textarea, Dialog (replaces
native `alert()`/`confirm()`), Dropdown menu, Tabs, Empty state, Skeleton
loader, Toast. Each gets built the first time a real screen needs it,
then reused - not designed in the abstract ahead of need.
