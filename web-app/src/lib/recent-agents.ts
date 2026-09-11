const STORAGE_KEY = "af-recent-agents";
const MAX_RECENT = 6;

// Tracking "what you've actually used" only makes sense for a platform of
// many specialized tools (it's meaningless for a single-purpose SaaS app) -
// this is deliberately specific to AgenticForge being a multi-agent forge,
// not a generic "recently viewed" feature bolted on.

export function recordAgentVisit(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentAgentSlugs();
    const next = [slug, ...existing.filter((s) => s !== slug)].slice(0, MAX_RECENT);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private browsing, storage full, etc). Not
    // worth surfacing to the user - this feature is a convenience, not core.
  }
}

export function getRecentAgentSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}
