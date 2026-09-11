// Path: web-app/src/lib/agents.ts
import {
  ArrowCounterClockwiseIcon,
  ArrowsClockwiseIcon,
  BookOpenIcon,
  BracketsCurlyIcon,
  BrainIcon,
  CalendarCheckIcon,
  ChartBarIcon,
  ChartLineUpIcon,
  CompassIcon,
  CurrencyCircleDollarIcon,
  FileMagnifyingGlassIcon,
  FileTextIcon,
  GraduationCapIcon,
  HandshakeIcon,
  HeadsetIcon,
  IdentificationCardIcon,
  LightningIcon,
  MagnetStraightIcon,
  MagnifyingGlassIcon,
  MapTrifoldIcon,
  MegaphoneIcon,
  NotePencilIcon,
  PaperPlaneTiltIcon,
  PencilSimpleLineIcon,
  ShieldCheckIcon,
  ShieldWarningIcon,
  SirenIcon,
  TicketIcon,
  TrendDownIcon,
  TrendUpIcon,
  TruckIcon,
  UserPlusIcon,
  UsersIcon,
  WrenchIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

export type AgentCategory =
  | "Developer Sandbox"
  | "Finance & Trading"
  | "Human Resources"
  | "Education & Research"
  | "Sales & Marketing"
  | "Customer Support"
  | "Logistics & Supply Chain"
  | "Media & Content"
  | "Travel & Event Management";

export interface AgentDefinition {
  slug: string;
  name: string;
  category: AgentCategory;
  href: string;
  description: string;
  icon: Icon;
  capabilities: string[];
}

export const CATEGORY_HREF: Record<AgentCategory, string> = {
  "Developer Sandbox": "/sandbox",
  "Finance & Trading": "/finance",
  "Human Resources": "/hr",
  "Education & Research": "/education",
  "Sales & Marketing": "/sales",
  "Customer Support": "/support",
  "Logistics & Supply Chain": "/logistics",
  "Media & Content": "/media",
  "Travel & Event Management": "/travel",
};

export const CATEGORY_ICONS: Record<AgentCategory, Icon> = {
  "Developer Sandbox": BracketsCurlyIcon,
  "Finance & Trading": CurrencyCircleDollarIcon,
  "Human Resources": UsersIcon,
  "Education & Research": GraduationCapIcon,
  "Sales & Marketing": MegaphoneIcon,
  "Customer Support": HeadsetIcon,
  "Logistics & Supply Chain": TruckIcon,
  "Media & Content": MagnetStraightIcon,
  "Travel & Event Management": CompassIcon,
};

// A quiet identity per category - the same restrained tint/ink system as
// the brand accent, just rotated to a different hue. Used sparingly (a
// category-hub header badge, a card's hover state) so the product reads as
// "many specialized agents" rather than "one generic accent everywhere",
// without turning any single screen into a rainbow. Developer Sandbox
// intentionally has none - it's the brand's own home base, so it keeps the
// default accent instead of a category color.
export const CATEGORY_HUE: Partial<Record<AgentCategory, number>> = {
  "Finance & Trading": 150,
  "Human Resources": 290,
  "Education & Research": 225,
  "Sales & Marketing": 15,
  "Customer Support": 195,
  "Logistics & Supply Chain": 75,
  "Media & Content": 320,
  "Travel & Event Management": 255,
};

export const ALL_AGENTS: AgentDefinition[] = [
  {
    slug: "json-structurer",
    name: "Data Structurer AI",
    category: "Developer Sandbox",
    href: "/sandbox/json-structurer",
    description:
      "Takes raw, unstructured text and strictly outputs formatted JSON matching a schema you define.",
    icon: BracketsCurlyIcon,
    capabilities: ["Structured Output", "Schema Validation"],
  },
  {
    slug: "memory-bot",
    name: "Contextual Memory AI",
    category: "Developer Sandbox",
    href: "/sandbox/memory-bot",
    description:
      "Remembers prior turns within an active session, demonstrating stateful conversation memory.",
    icon: BrainIcon,
    capabilities: ["Session Memory", "Multi-turn"],
  },
  {
    slug: "tool-caller",
    name: "Tool Caller AI",
    category: "Developer Sandbox",
    href: "/sandbox/tool-caller",
    description:
      "Decides when to invoke external tools mid-conversation to complete a task, and shows its reasoning.",
    icon: WrenchIcon,
    capabilities: ["Tool Calling", "Function Execution"],
  },
  {
    slug: "document-reader",
    name: "Document Reader AI",
    category: "Developer Sandbox",
    href: "/sandbox/document-reader",
    description:
      "Upload a document and ask questions about it, with answers grounded in the actual text.",
    icon: FileTextIcon,
    capabilities: ["Doc Parsing", "Grounded Q&A"],
  },
  {
    slug: "market-intel",
    name: "Market Intel Agent",
    category: "Finance & Trading",
    href: "/finance/market-intel",
    description:
      "Deep dive into any company's market position: competitors, sentiment, and a full SWOT analysis.",
    icon: ChartLineUpIcon,
    capabilities: ["Tool Calling", "Structured Output"],
  },
  {
    slug: "portfolio-risk",
    name: "Portfolio Risk Analyzer",
    category: "Finance & Trading",
    href: "/finance/portfolio-risk",
    description:
      "Reviews a portfolio's holdings and flags concentration, volatility, and diversification risk.",
    icon: ShieldWarningIcon,
    capabilities: ["Risk Scoring", "Structured Output"],
  },
  {
    slug: "earnings-rag",
    name: "Earnings Report RAG",
    category: "Finance & Trading",
    href: "/finance/earnings-rag",
    description:
      "Ask questions about a company's earnings report, answered from the actual filing text.",
    icon: FileMagnifyingGlassIcon,
    capabilities: ["RAG Pipeline", "Grounded Q&A"],
  },
  {
    slug: "resume-screener",
    name: "Resume Screener",
    category: "Human Resources",
    href: "/hr/resume-screener",
    description:
      "Matches a candidate resume against a job description and returns a detailed scoring breakdown.",
    icon: IdentificationCardIcon,
    capabilities: ["Structured Output", "Doc Parsing"],
  },
  {
    slug: "interview-planner",
    name: "Interview Planner",
    category: "Human Resources",
    href: "/hr/interview-planner",
    description:
      "Generates a structured interview plan and question set tailored to a specific role.",
    icon: CalendarCheckIcon,
    capabilities: ["Structured Output"],
  },
  {
    slug: "onboarding-rag",
    name: "Onboarding RAG",
    category: "Human Resources",
    href: "/hr/onboarding-rag",
    description:
      "Answers new-hire questions directly from your internal onboarding documentation.",
    icon: UserPlusIcon,
    capabilities: ["RAG Pipeline", "Vector DB"],
  },
  {
    slug: "research-analyzer",
    name: "Research Analyzer",
    category: "Education & Research",
    href: "/education/research-analyzer",
    description:
      "Summarizes long research papers and extracts the key findings and methodology.",
    icon: MagnifyingGlassIcon,
    capabilities: ["Doc Parsing", "Summarization"],
  },
  {
    slug: "edu-planner",
    name: "Edu-Planner Agent",
    category: "Education & Research",
    href: "/education/edu-planner",
    description:
      "Reads a course syllabus and generates custom practice questions and a study plan.",
    icon: BookOpenIcon,
    capabilities: ["RAG Pipeline", "Structured Output"],
  },
  {
    slug: "essay-evaluator",
    name: "Essay Evaluator",
    category: "Education & Research",
    href: "/education/essay-evaluator",
    description:
      "Scores written essays against a rubric and returns specific, actionable feedback.",
    icon: PencilSimpleLineIcon,
    capabilities: ["Structured Output", "Rubric Scoring"],
  },
  {
    slug: "cold-outreach",
    name: "Cold Outreach Architect",
    category: "Sales & Marketing",
    href: "/sales/cold-outreach",
    description:
      "Writes personalized, non-spammy B2B outreach emails from prospect and product context.",
    icon: PaperPlaneTiltIcon,
    capabilities: ["Copywriting", "Structured Output"],
  },
  {
    slug: "seo-analyzer",
    name: "SEO Analyzer",
    category: "Sales & Marketing",
    href: "/sales/seo-analyzer",
    description:
      "Audits a page or topic and returns prioritized, actionable SEO recommendations.",
    icon: TrendUpIcon,
    capabilities: ["Analysis", "Structured Output"],
  },
  {
    slug: "churn-predictor",
    name: "Churn Predictor",
    category: "Sales & Marketing",
    href: "/sales/churn-predictor",
    description:
      "Scores customer accounts by churn risk based on usage and account signals.",
    icon: TrendDownIcon,
    capabilities: ["Predictive AI", "Structured Output"],
  },
  {
    slug: "ticket-router",
    name: "Omni-Channel Ticket Router",
    category: "Customer Support",
    href: "/support/ticket-router",
    description:
      "Reads incoming support tickets and categorizes, prioritizes, and routes them automatically.",
    icon: TicketIcon,
    capabilities: ["Triage AI", "Workflow"],
  },
  {
    slug: "auto-responder",
    name: "Auto Responder",
    category: "Customer Support",
    href: "/support/auto-responder",
    description:
      "Drafts an on-brand first response to an incoming support request.",
    icon: LightningIcon,
    capabilities: ["Copywriting"],
  },
  {
    slug: "refund-automator",
    name: "Refund Automator",
    category: "Customer Support",
    href: "/support/refund-automator",
    description:
      "Evaluates a refund request against policy and drafts the resolution.",
    icon: ArrowCounterClockwiseIcon,
    capabilities: ["Policy Reasoning", "Structured Output"],
  },
  {
    slug: "inventory-forecaster",
    name: "AI Inventory Forecaster",
    category: "Logistics & Supply Chain",
    href: "/logistics/inventory-forecaster",
    description:
      "Predicts stock depletion and calculates optimal reorder quantities to prevent stockouts.",
    icon: ChartBarIcon,
    capabilities: ["Predictive AI", "Analytics"],
  },
  {
    slug: "supplier-risk",
    name: "Supplier Risk Evaluator",
    category: "Logistics & Supply Chain",
    href: "/logistics/supplier-risk",
    description:
      "Flags supplier risk from delivery history, financial signals, and concentration.",
    icon: ShieldCheckIcon,
    capabilities: ["Risk Scoring"],
  },
  {
    slug: "freight-optimizer",
    name: "Freight & Route Optimizer",
    category: "Logistics & Supply Chain",
    href: "/logistics/freight-optimizer",
    description:
      "Suggests the lowest-cost, fastest shipping route for a given shipment.",
    icon: MapTrifoldIcon,
    capabilities: ["Predictive AI", "Structured Output"],
  },
  {
    slug: "viral-hook",
    name: "Viral Hook Architect",
    category: "Media & Content",
    href: "/media/viral-hook",
    description:
      "Generates short-form video hooks engineered for the critical first three seconds.",
    icon: MagnetStraightIcon,
    capabilities: ["Creative AI", "Retention"],
  },
  {
    slug: "raw-scriptwriter",
    name: "The Raw Scriptwriter",
    category: "Media & Content",
    href: "/media/raw-scriptwriter",
    description:
      "Turns a topic into a full short-form video script written in your voice.",
    icon: NotePencilIcon,
    capabilities: ["Creative AI"],
  },
  {
    slug: "content-repurposer",
    name: "The Content Repurposer",
    category: "Media & Content",
    href: "/media/content-repurposer",
    description:
      "Turns one long-form piece of content into multiple platform-native posts.",
    icon: ArrowsClockwiseIcon,
    capabilities: ["Creative AI", "Structured Output"],
  },
  {
    slug: "itinerary-planner",
    name: "Hyper-Personalized Itinerary",
    category: "Travel & Event Management",
    href: "/travel/itinerary-planner",
    description:
      "Builds a realistic day-by-day travel schedule with estimated costs from your vibe and budget.",
    icon: CompassIcon,
    capabilities: ["Predictive AI", "Structured Output"],
  },
  {
    slug: "vendor-negotiator",
    name: "Vendor Negotiator",
    category: "Travel & Event Management",
    href: "/travel/vendor-negotiator",
    description:
      "Drafts negotiation talking points and counter-offers for a vendor contract.",
    icon: HandshakeIcon,
    capabilities: ["Negotiation AI"],
  },
  {
    slug: "crisis-manager",
    name: "Crisis Manager",
    category: "Travel & Event Management",
    href: "/travel/crisis-manager",
    description:
      "Drafts a response plan and stakeholder communications for an active event crisis.",
    icon: SirenIcon,
    capabilities: ["Structured Output"],
  },
];

export const AGENT_CATEGORIES: AgentCategory[] = [
  "Finance & Trading",
  "Human Resources",
  "Education & Research",
  "Sales & Marketing",
  "Customer Support",
  "Logistics & Supply Chain",
  "Media & Content",
  "Travel & Event Management",
];

export function getAgentsByCategory(category: AgentCategory) {
  return ALL_AGENTS.filter((agent) => agent.category === category);
}
