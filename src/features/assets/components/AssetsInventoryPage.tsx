"use client";

import {
  BookOpen,
  Calendar,
  Check,
  Database,
  Edit3,
  ExternalLink,
  FileText,
  Info,
  Layers,
  Link2,
  Loader2,
  Plug,
  Plus,
  Search,
  Send,
  Upload,
  Workflow,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrandIcon } from "@/features/marketplace/components/BrandIcon";
import { WorkflowSourceIcon } from "@/features/shared/components/WorkflowSourceIcon";
import { AddWorkflowDialog } from "@/features/workflows/components/AddWorkflowDialog";
import { BuilderHandoff } from "@/features/workflows/components/BuilderHandoff";
import { INDUSTRIES } from "@/features/shared/data/industries";
import { CARD_GRID } from "@/lib/grid";
import { cn } from "@/lib/utils";

type AssetCategory = "capability" | "skill" | "mcp" | "knowledge" | "workflow";
type AssetSource = "private" | "marketplace";
type AssetTone =
  | "blue"
  | "amber"
  | "green"
  | "pink"
  | "gray"
  | "violet"
  | "teal";
type AssetStatus = "connected" | "pending";

type InventoryAsset = {
  id: string;
  cat: AssetCategory;
  name: string;
  sub: string;
  tone?: AssetTone;
  source: AssetSource;
  assignedTo?: string[];
  category?: string;
  fileType?: string;
  fileSize?: string;
  status?: AssetStatus;
  account?: string;
  logo?: string;
  icon?: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  longDesc?: string;
  version?: string;
  protocol?: string;
  linkUrl?: string;
  created?: string;
  updated?: string;
  tools?: string[];
  // Knowledge is a "pack" — a named container of one or more files that
  // indexes after upload (story 14191).
  files?: { name: string; size: string }[];
  packStatus?: "indexing" | "ready";
  // Workflow fields. The Workshop holds the general recipe — where it's from, what
  // it does, and which connections it NEEDS — but never the connections themselves
  // (those bind per-twyn). `published` = pushed to the marketplace.
  platform?: string;
  fidelity?: "live" | "polled" | "status";
  requires?: string[];
};

const ASSETS: InventoryAsset[] = [
  {
    id: "s1",
    cat: "skill",
    name: "SQL Querying",
    sub: "Pulls clean, structured answers from any database - fast and reliably.",
    longDesc:
      "Instruction set for writing readable SQL, validating joins, and explaining query assumptions before returning results.",
    tone: "amber",
    source: "private",
    category: "Data",
    assignedTo: ["Sara"],
    icon: Database,
    version: "1.0",
    created: "May 11, 2026",
    updated: "May 21, 2026",
  },
  {
    id: "s2",
    cat: "skill",
    name: "Cold Outreach",
    sub: "Writes messages that get opened, replied to, and convert.",
    longDesc:
      "A sales-writing skill for concise outbound messages, clear relevance hooks, and low-friction calls to action.",
    tone: "pink",
    source: "marketplace",
    category: "Sales",
    assignedTo: [],
    icon: Send,
    version: "1.1",
    created: "May 13, 2026",
    updated: "May 20, 2026",
  },
  {
    id: "s3",
    cat: "skill",
    name: "Pitch Deck Design",
    sub: "Builds decks that tell a clear story and make investors lean forward.",
    longDesc:
      "Guides slide structure, narrative flow, and visual hierarchy for investor and executive presentations.",
    tone: "green",
    source: "private",
    category: "Design",
    assignedTo: [],
    icon: Layers,
    version: "1.3",
    created: "May 9, 2026",
    updated: "May 19, 2026",
  },
  {
    id: "s4",
    cat: "skill",
    name: "Sprint Planning",
    sub: "Scopes, prioritises, and sequences work so teams ship without surprises.",
    longDesc:
      "Helps turn product goals into practical sprint plans with dependencies, risks, and clear sequencing.",
    tone: "blue",
    source: "private",
    category: "Agile",
    assignedTo: ["Scrum Master"],
    icon: Calendar,
    version: "1.0",
    created: "May 15, 2026",
    updated: "May 24, 2026",
  },
  {
    id: "m1",
    cat: "mcp",
    name: "Slack",
    sub: "Read channels, reply in threads, summarise standups.",
    longDesc:
      "Lets twyns search channels, summarize threads, and draft replies in Slack when explicitly asked.",
    source: "private",
    status: "connected",
    account: "s.durovic@4th-ir.com",
    logo: "slack",
    protocol: "OAuth MCP",
    linkUrl: "https://slack.com/oauth",
    created: "May 8, 2026",
    updated: "May 24, 2026",
  },
  {
    id: "m2",
    cat: "mcp",
    name: "Notion",
    sub: "Search pages, draft docs, keep your wiki in sync.",
    longDesc:
      "Connects Notion pages and databases so twyns can retrieve internal docs and draft structured updates.",
    source: "private",
    status: "connected",
    account: "s.durovic@4th-ir.com",
    logo: "notion",
    protocol: "OAuth MCP",
    linkUrl: "https://notion.so",
    created: "May 9, 2026",
    updated: "May 23, 2026",
  },
  {
    id: "m3",
    cat: "mcp",
    name: "Linear",
    sub: "Create issues, triage your inbox, summarise cycles.",
    longDesc:
      "Adds Linear issue creation, cycle summaries, and product inbox triage to the workshop.",
    source: "marketplace",
    status: "pending",
    logo: "linear",
    protocol: "OAuth MCP",
    linkUrl: "https://linear.app",
    created: "May 19, 2026",
    updated: "May 19, 2026",
  },
  {
    id: "k1",
    cat: "knowledge",
    name: "Brand voice guide",
    sub: "Tone, vocabulary, and style rules for all comms.",
    longDesc:
      "Canonical voice and style reference for external messaging, landing pages, emails, and founder notes.",
    tone: "blue",
    source: "private",
    fileType: "PDF",
    fileSize: "2.4 MB",
    assignedTo: ["Sara"],
    icon: FileText,
    created: "May 7, 2026",
    updated: "May 20, 2026",
  },
  {
    id: "k2",
    cat: "knowledge",
    name: "Q3 board pre-read",
    sub: "Pipeline, retention, EU launch prep - latest deck.",
    longDesc:
      "Board packet with pipeline updates, retention analysis, and EU launch preparation notes.",
    tone: "violet",
    source: "private",
    fileType: "PDF",
    fileSize: "8.1 MB",
    files: [
      { name: "Q3-board-deck.pdf", size: "8.1 MB" },
      { name: "Pipeline-appendix.xlsx", size: "1.2 MB" },
      { name: "EU-launch-notes.docx", size: "640 KB" },
    ],
    packStatus: "ready",
    assignedTo: ["Sara"],
    icon: FileText,
    created: "May 18, 2026",
    updated: "May 24, 2026",
  },
  {
    id: "k3",
    cat: "knowledge",
    name: "Product roadmap 2026",
    sub: "Q2-Q4 feature plan, priorities, dependencies.",
    longDesc:
      "Current roadmap covering product themes, delivery windows, dependency risks, and owner notes.",
    tone: "green",
    source: "private",
    fileType: "DOCX",
    fileSize: "1.7 MB",
    assignedTo: [],
    icon: FileText,
    created: "May 3, 2026",
    updated: "May 22, 2026",
  },
  {
    id: "k4",
    cat: "knowledge",
    name: "Sales playbook",
    sub: "Objection handling, demo scripts, pricing tiers.",
    longDesc:
      "Sales reference containing discovery prompts, demo talk tracks, objection handling, and pricing guidance.",
    tone: "amber",
    source: "private",
    fileType: "MD",
    fileSize: "340 KB",
    assignedTo: ["Sara"],
    icon: FileText,
    created: "May 6, 2026",
    updated: "May 21, 2026",
  },
  {
    id: "k5",
    cat: "knowledge",
    name: "User interview transcripts",
    sub: "14 transcripts from Q1 discovery round.",
    longDesc:
      "Raw discovery interview transcripts used by research and product twyns for synthesis.",
    tone: "pink",
    source: "private",
    fileType: "TXT",
    fileSize: "4.6 MB",
    files: [
      { name: "Discovery-01-to-05.txt", size: "1.7 MB" },
      { name: "Discovery-06-to-10.txt", size: "1.6 MB" },
      { name: "Discovery-11-to-14.txt", size: "1.3 MB" },
    ],
    packStatus: "ready",
    assignedTo: [],
    icon: FileText,
    created: "May 1, 2026",
    updated: "May 18, 2026",
  },
];

const CATEGORY_FILTERS: Array<{ key: "all" | AssetCategory; label: string }> = [
  { key: "all", label: "All" },
  { key: "workflow", label: "Workflows" },
  { key: "mcp", label: "Interconnectors" },
  { key: "skill", label: "Skills" },
  { key: "knowledge", label: "Knowledge" },
];

const LABELS: Record<AssetCategory, string> = {
  capability: "Capability",
  skill: "Skill",
  mcp: "Interconnector",
  knowledge: "Knowledge",
  workflow: "Workflow",
};

const ADD_LABELS: Record<"all" | AssetCategory, string> = {
  all: "Add new",
  capability: "Add capability",
  skill: "Add skill",
  mcp: "Add interconnector",
  knowledge: "Add knowledge pack",
  workflow: "Add a workflow",
};

// General workflow recipes you own. No connections here — those bind per twyn.
const WORKFLOW_ASSETS: InventoryAsset[] = [
  {
    id: "wf1",
    cat: "workflow",
    name: "Morning Brief",
    sub: "Scan your inbox and calendar, flag what needs you, and draft replies.",
    tone: "violet",
    source: "private",
    fidelity: "live",
    requires: ["Gmail", "Calendar"],
    assignedTo: ["Sara"],
    icon: Workflow,
    tools: ["Scan your inbox", "Check today's calendar", "Flag what needs a reply", "Draft the replies", "Approve & send", "Compile your brief"],
  },
  {
    id: "wf2",
    cat: "workflow",
    name: "Meeting Prep",
    sub: "Before your next meeting: the thread, the people, and last call's notes.",
    tone: "violet",
    source: "marketplace",
    fidelity: "live",
    requires: ["Calendar", "Gmail", "Notion"],
    assignedTo: [],
    icon: Workflow,
    tools: ["Find your next meeting", "Pull the email thread", "Get last call's notes", "Share the prep doc"],
  },
  {
    id: "wf3",
    cat: "workflow",
    name: "Inbox Triage",
    sub: "Sort new mail, label it, and draft replies to the ones that matter.",
    tone: "violet",
    source: "private",
    platform: "n8n",
    fidelity: "polled",
    requires: ["Gmail"],
    assignedTo: [],
    icon: Workflow,
    tools: ["Read new mail", "Sort & label", "Archive low-priority", "Draft replies"],
  },
  {
    id: "wf4",
    cat: "workflow",
    name: "Expense Approvals",
    sub: "Route new expense reports to the right approver and chase sign-off.",
    tone: "violet",
    source: "private",
    platform: "Zapier",
    fidelity: "status",
    requires: ["Slack"],
    assignedTo: [],
    icon: Workflow,
    tools: ["Run the Zap", "Route to approver"],
  },
  {
    id: "wf5",
    cat: "workflow",
    name: "Invoice Approval",
    sub: "Route invoices to the right approver and chase sign-off.",
    tone: "violet",
    source: "private",
    platform: "Power Automate",
    fidelity: "polled",
    requires: ["Outlook", "SharePoint"],
    assignedTo: [],
    icon: Workflow,
    tools: ["Read new invoices", "Match to the PO", "Route for approval", "Notify finance"],
  },
  {
    id: "wf6",
    cat: "workflow",
    name: "Monthly Report Generator",
    sub: "Log in, export the data, build the report, and file it.",
    tone: "violet",
    source: "private",
    platform: "UiPath",
    fidelity: "status",
    requires: ["SAP", "Excel"],
    assignedTo: [],
    icon: Workflow,
    tools: ["Log into the system", "Export the data", "Generate the report", "File it"],
  },
];

export function AssetsInventoryPage() {
  const [assets, setAssets] = useState<InventoryAsset[]>([...WORKFLOW_ASSETS, ...ASSETS]);
  const [activeCat, setActiveCat] = useState<"all" | AssetCategory>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<InventoryAsset | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addKind, setAddKind] = useState<"picker" | AssetCategory>("picker");
  // PLACEMENT B — the workflow front door lives here, inside the Workshop.
  const [wfAddOpen, setWfAddOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<InventoryAsset | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setSearchTerm((detail ?? "").trim().toLowerCase());
    };

    window.addEventListener("twynity:workshop-search", handler);
    return () => window.removeEventListener("twynity:workshop-search", handler);
  }, []);

  const counts = useMemo(() => {
    return CATEGORY_FILTERS.reduce(
      (acc, filter) => {
        acc[filter.key] =
          filter.key === "all"
            ? assets.length
            : assets.filter((asset) => asset.cat === filter.key).length;
        return acc;
      },
      {} as Record<"all" | AssetCategory, number>,
    );
  }, [assets]);

  const visibleAssets = useMemo(() => {
    return assets.filter((asset) => {
      const inCategory = activeCat === "all" || asset.cat === activeCat;
      const haystack = [
        asset.name,
        asset.sub,
        asset.longDesc,
        asset.category,
        LABELS[asset.cat],
        asset.account,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return inCategory && (!searchTerm || haystack.includes(searchTerm));
    });
  }, [activeCat, assets, searchTerm]);

  function openAddDialog() {
    // Workflows get their own chooser (build / buy / import) rather than the
    // generic asset form — building one is a different act from adding a skill.
    if (activeCat === "workflow") {
      setWfAddOpen(true);
      return;
    }
    setAddKind(activeCat === "all" ? "picker" : activeCat);
    setAddOpen(true);
  }

  // Create a Knowledge Pack: it lands immediately as an "Indexing…" card, then
  // flips to "Ready" once the (prototype) background indexing completes.
  function addKnowledgePack(name: string, files: { name: string; size: string }[]) {
    const id = `kp-${Date.now()}`;
    const pack: InventoryAsset = {
      id,
      cat: "knowledge",
      name,
      sub: `${files.length} ${files.length === 1 ? "file" : "files"} · just added`,
      tone: "violet",
      source: "private",
      files,
      packStatus: "indexing",
      assignedTo: [],
      icon: FileText,
    };
    setAssets((cur) => [pack, ...cur]);
    setActiveCat("knowledge");
    setAddOpen(false);
    setTimeout(() => {
      setAssets((cur) =>
        cur.map((a) => (a.id === id ? { ...a, packStatus: "ready" } : a)),
      );
    }, 2200);
  }

  return (
    <div className="px-3 pb-3 pt-2">
      <header className="mb-7 flex max-w-[1100px] mx-auto flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h1 className="mb-2 font-heading text-[30px] font-semibold leading-[1.1] tracking-[-0.6px] text-dark">
            Workshop
          </h1>
          <p className="max-w-[520px] text-[15px] leading-[1.6] text-gray-3">
            Everything you&apos;ve built - workflows, skills, interconnectors, and
            knowledge. Assign any to your twyns.
          </p>
        </div>
        {/* On its own row on mobile (self-start) so the variable label never
            reflows the description; side-by-side from sm up. */}
        <button
          type="button"
          onClick={openAddDialog}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-violet px-5 py-3 text-[14px] font-bold text-white transition-[background,transform] duration-150 hover:bg-violet-hover active:scale-[0.97] sm:self-auto"
        >
          <Plus size={15} strokeWidth={2.5} />
          {ADD_LABELS[activeCat]}
        </button>
      </header>

      <div
        className="mb-[18px] flex max-w-[1100px] mx-auto flex-wrap gap-1.5"
        role="tablist"
        aria-label="Category"
      >
        {CATEGORY_FILTERS.map((filter) => {
          const active = filter.key === activeCat;
          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCat(filter.key)}
              className={cn(
                "inline-flex items-center gap-[7px] rounded-full border px-3.5 py-[7px] text-[12.5px] font-semibold transition-[border-color,color,background,box-shadow] duration-150",
                active
                  ? "border-violet bg-violet text-white"
                  : "border-border bg-white text-gray-3 hover:border-violet-mid hover:text-violet",
              )}
            >
              {filter.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
                  active
                    ? "bg-white/15 text-white"
                    : "border border-border bg-input-bg text-gray-4",
                )}
              >
                {counts[filter.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* OPTION B — the external-Studio hand-off lives with the workflows,
          and only there. On "All" it would front a shelf that is mostly not
          workflows. */}
      {activeCat === "workflow" && (
        <div className="mx-auto max-w-[1100px]">
          <BuilderHandoff />
        </div>
      )}

      {visibleAssets.length > 0 ? (
        <section className={cn("max-w-[1100px] mx-auto", CARD_GRID)}>
          {visibleAssets.map((asset) =>
            asset.cat === "mcp" ? (
              <InterconnectorAssetCard
                key={asset.id}
                asset={asset}
                onOpen={setSelectedAsset}
              />
            ) : asset.cat === "workflow" ? (
              <WorkflowAssetCard
                key={asset.id}
                asset={asset}
                onOpen={setSelectedAsset}
              />
            ) : (
              <AssetCard key={asset.id} asset={asset} onOpen={setSelectedAsset} />
            ),
          )}
        </section>
      ) : (
        <EmptyState />
      )}

      <AddAssetDialog
        open={addOpen}
        kind={addKind}
        onOpenChange={setAddOpen}
        onKindChange={setAddKind}
        onPickWorkflow={() => {
          setAddOpen(false);
          setWfAddOpen(true);
        }}
        onCreate={addKnowledgePack}
      />
      <AddWorkflowDialog
        open={wfAddOpen}
        onClose={() => setWfAddOpen(false)}
        builderHref="/workflow-builder"
        external
      />
      <EditSkillDialog skill={editSkill} onClose={() => setEditSkill(null)} />
      <AssetDetailsDialog
        asset={selectedAsset}
        onOpenChange={(open) => !open && setSelectedAsset(null)}
        onEdit={(a) => {
          setSelectedAsset(null);
          setEditSkill(a);
        }}
      />
    </div>
  );
}

function AssetCard({
  asset,
  onOpen,
}: {
  asset: InventoryAsset;
  onOpen: (asset: InventoryAsset) => void;
}) {
  const Icon = asset.icon ?? FileText;
  const assignments = asset.assignedTo ?? [];
  const assigned = assignments.length > 0;
  const fileCount = asset.files?.length ?? 1;
  const meta =
    asset.cat === "knowledge"
      ? `Knowledge Pack \u00b7 ${fileCount} ${fileCount === 1 ? "file" : "files"}`
      : asset.cat === "skill" && asset.version
        ? `Skill \u00b7 v${asset.version}`
        : LABELS[asset.cat];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(asset)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onOpen(asset);
      }}
      className="relative flex min-h-40 cursor-pointer flex-col gap-3 rounded-[20px] border border-border bg-white px-6 pb-5 pt-6 text-left font-sans outline-none transition-[border-color,box-shadow] duration-200 hover:border-violet/25 hover:shadow-[0_4px_20px_rgba(108,92,231,0.06),0_1px_3px_rgba(15,15,30,0.04)] focus-visible:border-violet"
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px]",
            toneClass(asset.tone),
          )}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="text-[16px] font-bold leading-[1.25] tracking-[-0.3px] text-dark">
            {asset.name}
          </div>
          <div className="mt-[3px] text-[12px] leading-[1.4] text-gray-4">
            {meta}
          </div>
        </div>
      </div>

      <p className="flex-1 text-[14px] leading-[1.6] text-gray-3">
        {asset.sub}
      </p>

      {asset.cat === "knowledge" && (
        <footer className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2.5">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] text-gray-4">
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                assigned ? "bg-violet" : "bg-gray-5",
              )}
            />
            {assigned
              ? assignments.length === 1
                ? `On ${assignments[0]}`
                : `On ${assignments.length} twyns`
              : "Unassigned"}
          </span>
          <PackStatusBadge status={asset.packStatus ?? "ready"} />
        </footer>
      )}
    </article>
  );
}

// A workflow card is the general recipe: what it does, where it's from, and which
// connections it NEEDS (bound per twyn, not here). Plus publish-to-marketplace.
function WorkflowAssetCard({
  asset,
  onOpen,
}: {
  asset: InventoryAsset;
  onOpen: (asset: InventoryAsset) => void;
}) {
  const assignments = asset.assignedTo ?? [];
  const assigned = assignments.length > 0;
  const sourceLabel = asset.platform
    ? `via ${asset.platform}`
    : asset.source === "marketplace"
      ? "Marketplace"
      : "Built";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(asset)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onOpen(asset);
      }}
      className="relative flex min-h-40 cursor-pointer flex-col gap-3 rounded-[20px] border border-border bg-white px-6 pb-5 pt-6 text-left font-sans outline-none transition-[border-color,box-shadow] duration-200 hover:border-violet/25 hover:shadow-[0_4px_20px_rgba(108,92,231,0.06),0_1px_3px_rgba(15,15,30,0.04)] focus-visible:border-violet"
    >
      <div className="flex items-start gap-3.5">
        <WorkflowSourceIcon platform={asset.platform} className="h-[46px] w-[46px] rounded-[14px] text-[19px]" />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="text-[16px] font-bold leading-[1.25] tracking-[-0.3px] text-dark">{asset.name}</div>
          <div className="mt-[3px] text-[12px] leading-[1.4] text-gray-4">Workflow · {sourceLabel}</div>
        </div>
      </div>

      <p className="text-[14px] leading-[1.6] text-gray-3">{asset.sub}</p>

      {/* "Needs" only applies to native workflows that run on our platform and use
          our interconnectors. External workflows (via n8n/Zapier/etc.) connect to
          their own tools on that platform, so we don't show it. */}
      {!asset.platform && asset.requires && asset.requires.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11.5px] font-semibold text-gray-4">Needs:</span>
          {asset.requires.map((r) => (
            <span key={r} className="rounded-full bg-amber px-2 py-0.5 text-[11px] font-semibold text-amber-text">
              {r}
            </span>
          ))}
        </div>
      )}

      <footer className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2.5">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] text-gray-4">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", assigned ? "bg-violet" : "bg-gray-5")} />
          {assigned
            ? assignments.length === 1
              ? `On ${assignments[0]}`
              : `On ${assignments.length} twyns`
            : "Unassigned"}
        </span>
        {asset.source === "marketplace" && (
          <span className="shrink-0 text-[11.5px] font-semibold text-gray-4">Marketplace</span>
        )}
      </footer>
    </article>
  );
}

// Indexing → Ready badge on a Knowledge Pack card (story 14191).
function PackStatusBadge({ status }: { status: "indexing" | "ready" }) {
  if (status === "indexing") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-violet-light px-2.5 py-1 text-[11px] font-bold text-violet">
        <Loader2 size={11} className="animate-spin" /> Indexing…
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-mint-text">
      <Check size={11} strokeWidth={2.5} /> Ready
    </span>
  );
}

function InterconnectorAssetCard({
  asset,
  onOpen,
}: {
  asset: InventoryAsset;
  onOpen: (asset: InventoryAsset) => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(asset)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onOpen(asset);
      }}
      className="relative flex min-h-40 cursor-pointer flex-col gap-2.5 rounded-[20px] border border-border bg-white px-[18px] pb-3.5 pt-[18px] text-left font-sans outline-none transition-[border-color,box-shadow,transform] duration-150 hover:border-violet/25 hover:shadow-[0_4px_20px_rgba(108,92,231,0.06),0_1px_3px_rgba(15,15,30,0.04)] focus-visible:border-violet"
    >
      <div className="flex items-center gap-3.5">
        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[11px] border border-border bg-white">
          {asset.logo ? (
            <BrandIcon logo={asset.logo} className="h-[22px] w-[22px]" />
          ) : (
            <Link2 size={21} />
          )}
        </div>
        <div className="min-w-0 flex-1 pt-px">
          <div className="text-[16px] font-bold leading-[1.25] tracking-[-0.3px] text-dark">
            {asset.name}
          </div>
          <div className="mt-[3px] text-[12px] leading-[1.3] text-gray-4">
            Interconnector
          </div>
        </div>
      </div>

      <p className="text-[14px] leading-[1.55] text-gray-3">{asset.sub}</p>
    </article>
  );
}

function AddAssetDialog({
  open,
  kind,
  onOpenChange,
  onKindChange,
  onPickWorkflow,
  onCreate,
}: {
  open: boolean;
  kind: "picker" | AssetCategory;
  onOpenChange: (open: boolean) => void;
  onKindChange: (kind: "picker" | AssetCategory) => void;
  onPickWorkflow: () => void;
  onCreate: (name: string, files: { name: string; size: string }[]) => void;
}) {
  const content = getAddDialogContent(kind);
  const [pack, setPack] = useState<{
    name: string;
    files: { name: string; size: string }[];
  }>({ name: "", files: [] });
  // Reset the pack form whenever the dialog (re)opens or switches kind.
  useEffect(() => {
    if (kind === "knowledge") setPack({ name: "", files: [] });
  }, [open, kind]);
  const canCreatePack = pack.name.trim().length > 0 && pack.files.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[400] bg-dark/45"
        className="z-[401] max-h-[calc(100vh-48px)] w-[min(720px,calc(100vw-32px))] overflow-y-auto rounded-[20px] border-0 bg-white p-0 shadow-[0_32px_80px_rgba(15,15,30,0.28)]"
      >
        <div className="p-7 pb-6 md:px-8">
          <div className="mb-3.5 flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="font-heading text-[19px] font-semibold leading-[1.2] tracking-[-0.4px] text-dark">
                {content.title}
              </DialogTitle>
              <DialogDescription className="mt-1 text-[13px] leading-[1.45] text-gray-4">
                {content.sub}
              </DialogDescription>
            </div>
            <DialogClose className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[12px] bg-input-bg text-gray-3 hover:bg-border hover:text-dark">
              <X size={14} strokeWidth={2.2} />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>

          {kind === "picker" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <TypePick
                icon={Workflow}
                title="Add a workflow"
                sub="Build one in the Twynity Workflow Builder, buy one, or import."
                onClick={onPickWorkflow}
              />
              <TypePick
                icon={Wrench}
                title="New skill"
                sub="Targeted micro-upgrade - sales, data, design, more."
                onClick={() => onKindChange("skill")}
              />
              <TypePick
                icon={Link2}
                title="New interconnector"
                sub="Connect Slack, Notion, Linear, GitHub, more."
                onClick={() => onKindChange("mcp")}
              />
              <TypePick
                icon={FileText}
                title="New Knowledge Pack"
                sub="Group PDFs, docs, or text into a pack your twyns can reference."
                onClick={() => onKindChange("knowledge")}
              />
            </div>
          ) : kind === "knowledge" ? (
            <KnowledgePackFields value={pack} onChange={setPack} />
          ) : (
            <AssetForm kind={kind} />
          )}

          {/* Footer only on the form steps — the picker advances on card click,
              so it needs no actions (the X closes it). */}
          {kind !== "picker" && (
            <div className="mt-[18px] flex items-center gap-2.5">
              <DialogClose className="rounded-full border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-2 transition-colors duration-150 hover:border-violet hover:text-violet">
                Cancel
              </DialogClose>
              <div className="flex-1" />
              {kind === "knowledge" ? (
                <button
                  type="button"
                  disabled={!canCreatePack}
                  onClick={() => onCreate(pack.name.trim(), pack.files)}
                  className="inline-flex items-center gap-2 rounded-full bg-violet px-[18px] py-[11px] text-[13px] font-bold text-white transition-colors hover:bg-violet-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {ADD_LABELS.knowledge}
                </button>
              ) : (
                <DialogClose className="inline-flex items-center gap-2 rounded-full bg-violet px-[18px] py-[11px] text-[13px] font-bold text-white hover:bg-violet-hover">
                  {ADD_LABELS[kind]}
                </DialogClose>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Real brand glyphs (Simple Icons) render in full colour, so they read fine on
// the light input-bg tile — no dark/brand tile needed.
const TILE_BG: Record<string, string | undefined> = {};

function AssetDetailsDialog({
  asset,
  onOpenChange,
  onEdit,
}: {
  asset: InventoryAsset | null;
  onOpenChange: (open: boolean) => void;
  onEdit?: (asset: InventoryAsset) => void;
}) {
  const Icon = asset?.icon ?? FileText;
  const tileBg = asset?.logo ? TILE_BG[asset.logo] : undefined;

  // Static metadata as stacked label/value fields — splitting the conflated
  // "OAuth MCP" into Authentication + Protocol so neither wraps awkwardly.
  const meta: { label: string; value: ReactNode }[] = [];
  if (asset?.protocol) {
    const [authPart, ...rest] = asset.protocol.split(" ");
    meta.push({ label: "Authentication", value: authPart });
    if (rest.length) meta.push({ label: "Protocol", value: rest.join(" ") });
  }
  if (asset?.fileType) meta.push({ label: "File type", value: asset.fileType });
  if (asset?.fileSize) meta.push({ label: "File size", value: asset.fileSize });
  if (asset?.created) meta.push({ label: "Created", value: asset.created });
  if (asset?.updated) meta.push({ label: "Last updated", value: asset.updated });

  return (
    <Dialog open={Boolean(asset)} onOpenChange={onOpenChange}>
      {asset && (
        <DialogContent
          showCloseButton={false}
          overlayClassName="z-[500] bg-dark/55"
          className="z-[501] max-h-[88vh] w-[min(760px,calc(100vw-32px))] overflow-y-auto rounded-[20px] border-0 bg-white p-0 shadow-[0_32px_80px_rgba(15,15,30,0.24)]"
        >
          <div className="p-7 md:px-9 md:pb-7 md:pt-8">
            <div className="mb-[18px] flex items-start gap-[18px]">
              {asset.cat === "workflow" ? (
                <WorkflowSourceIcon platform={asset.platform} className="h-16 w-16 rounded-[18px] text-[26px]" />
              ) : (
                <div
                  className={cn(
                    "grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[18px] border border-border",
                    !tileBg && "bg-input-bg text-gray-2",
                  )}
                  style={tileBg ? { background: tileBg } : undefined}
                >
                  {asset.logo ? (
                    <BrandIcon logo={asset.logo} className="h-8 w-8" />
                  ) : (
                    <Icon size={32} strokeWidth={1.8} />
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <DialogTitle className="font-heading text-[26px] font-semibold leading-[1.15] tracking-[-0.5px] text-dark [overflow-wrap:anywhere]">
                  {asset.name}
                </DialogTitle>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {asset.version && (
                    <DetailPill>
                      <span className="h-1.5 w-1.5 rounded-full bg-violet" />
                      Version {asset.version}
                    </DetailPill>
                  )}
                  <DetailPill tone="violet">
                    {asset.category ?? LABELS[asset.cat]}
                  </DetailPill>
                </div>
              </div>
              <DialogClose className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-input-bg text-gray-3 hover:bg-border hover:text-dark">
                <X size={14} strokeWidth={2.2} />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>

            <DialogDescription className="mb-6 text-[14px] leading-[1.6] text-gray-3">
              {asset.longDesc ?? asset.sub}
            </DialogDescription>

            {asset.cat === "workflow" && (
              <div className="mb-6 space-y-4">
                <div className="rounded-[12px] border border-border p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-gray-4">
                    Where it&apos;s from
                  </div>
                  <div className="mt-1 text-[13.5px] font-semibold text-dark">
                    {asset.platform
                      ? `Imported from ${asset.platform}`
                      : asset.source === "marketplace"
                        ? "From the marketplace"
                        : "Built by you"}
                  </div>
                  <p className="mt-1 text-[12px] leading-[1.5] text-gray-4">
                    {asset.fidelity === "live"
                      ? "Full live view — every step, tool call and twyn hand-off streams as it runs."
                      : asset.fidelity === "polled"
                        ? `${asset.platform} reports status on a poll — a step behind, and no live hand-offs.`
                        : `${asset.platform} reports run status only — no step-by-step detail.`}
                  </p>
                </div>

                {asset.requires && asset.requires.length > 0 && (
                  <div>
                    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-4">
                      Needs — connect these on each twyn
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {asset.requires.map((r) => (
                        <span key={r} className="rounded-full bg-amber px-2.5 py-1 text-[12px] font-semibold text-amber-text">
                          {r}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11.5px] text-gray-4">
                      The recipe is general — accounts, trigger and schedule are set per twyn.
                    </p>
                  </div>
                )}

                {asset.tools && asset.tools.length > 0 && (
                  <div>
                    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-4">
                      What it does · {asset.tools.length} steps
                    </div>
                    <ol className="space-y-1">
                      {asset.tools.map((t, i) => (
                        <li key={t} className="flex items-center gap-2.5 text-[13px] text-gray-2">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-light text-[10px] font-bold text-violet tabular-nums">
                            {i + 1}
                          </span>
                          {t}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Static metadata + resource link in one balanced box. */}
            {(meta.length > 0 || asset.linkUrl) && (
              <DetailBox label="Details" className="mb-3">
                {meta.length > 0 && (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    {meta.map((f) => (
                      <MetaField key={f.label} label={f.label}>
                        {f.value}
                      </MetaField>
                    ))}
                  </div>
                )}
                {asset.linkUrl && (
                  <a
                    href={asset.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "group flex items-center gap-3 rounded-[10px] border border-border bg-white px-3 py-2.5 transition-colors hover:border-violet",
                      meta.length > 0 && "mt-4",
                    )}
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-input-bg text-gray-3 transition-colors group-hover:border-violet group-hover:text-violet">
                      <ExternalLink size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-bold text-dark">
                        {asset.cat === "mcp"
                          ? `Open in ${asset.name}`
                          : "Open link"}
                      </div>
                      <div className="truncate font-mono text-[11px] text-gray-4">
                        {asset.linkUrl.replace(/^https?:\/\//, "")}
                      </div>
                    </div>
                  </a>
                )}
              </DetailBox>
            )}

            {asset.tools?.length ? (
              <DetailBox label={`Available tools (${asset.tools.length})`}>
                <div className="flex flex-col gap-2">
                  {asset.tools.map((tool) => (
                    <div
                      key={tool}
                      className="rounded-[10px] border border-border bg-white px-3.5 py-2.5 font-mono text-[12.5px] font-semibold text-dark"
                    >
                      {tool}
                    </div>
                  ))}
                </div>
              </DetailBox>
            ) : null}

            {asset.cat === "skill" && onEdit && (
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => onEdit(asset)}
                  className="inline-flex items-center gap-2 rounded-full bg-violet px-[18px] py-[11px] text-[13px] font-bold text-white transition-colors hover:bg-violet-hover"
                >
                  <Edit3 size={14} /> Edit skill
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

// Single shared taxonomy — the same Industry options the marketplace filters by.
function IndustryField() {
  return (
    <label className="mb-3.5 block">
      <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
        Industry
      </span>
      <select className="h-[42px] w-full rounded-[14px] border-[1.5px] border-border bg-white px-3 text-[14px] text-dark outline-none focus:border-violet">
        {INDUSTRIES.map((i) => (
          <option key={i}>{i}</option>
        ))}
      </select>
    </label>
  );
}

function AssetForm({ kind }: { kind: AssetCategory }) {
  if (kind === "workflow") {
    const platforms = [
      { name: "n8n", hint: "Open-source · MCP", color: "#EA4B71", letter: "n" },
      { name: "Power Automate", hint: "Microsoft flows", color: "#0B63CE", letter: "P" },
      { name: "UiPath", hint: "RPA robots", color: "#FA4616", letter: "U" },
      { name: "LangFlow", hint: "Agentic graphs", color: "#16B364", letter: "L" },
      { name: "Custom builder", hint: "Coming soon", color: "#9aa0ad", letter: "Z", soon: true },
    ];
    return (
      <div>
        <span className="mb-2 block text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
          Connect a platform
        </span>
        <div className="space-y-2">
          {platforms.map((p) => (
            <button
              key={p.name}
              type="button"
              disabled={p.soon}
              className={cn(
                "flex w-full items-center gap-3 rounded-[12px] border px-3 py-2.5 text-left transition-colors",
                p.soon ? "cursor-not-allowed border-border opacity-55" : "border-border hover:border-violet-mid hover:bg-violet-light/40",
              )}
            >
              {p.soon ? (
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] font-heading text-[16px] font-bold text-white"
                  style={{ background: p.color }}
                >
                  {p.letter}
                </span>
              ) : (
                <WorkflowSourceIcon platform={p.name} className="h-9 w-9 rounded-[10px] text-[15px]" />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-dark">{p.name}</span>
                  {p.soon && (
                    <span className="rounded-full bg-input-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-gray-4">
                      Soon
                    </span>
                  )}
                </span>
                <span className="block text-[12px] text-gray-4">{p.hint}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-[10px] border border-border bg-input-bg px-3.5 py-2.5 text-[12px] leading-[1.5] text-gray-3">
          Imported as a general recipe — no accounts here. Connect it to your tools
          per twyn from that twyn&apos;s page, where you also set its trigger and schedule.
        </p>
      </div>
    );
  }

  if (kind === "knowledge") {
    return (
      <div>
        <Field label="Name" placeholder="e.g. Sales playbook" />
        <Field
          label="Description"
          placeholder="What is this document about?"
          multiline
        />
        <IndustryField />
        <label className="block">
          <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
            File
          </span>
          <span className="block cursor-pointer rounded-[20px] border-[1.5px] border-dashed border-border px-5 py-7 text-center hover:border-violet hover:bg-violet-light">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-[12px] border border-violet-mid bg-violet-light text-violet">
              <Upload size={22} />
            </span>
            <span className="mb-1 block text-[14px] font-bold text-dark">
              Drop a file here
            </span>
            <span className="text-[12px] text-gray-4">
              .pdf, .doc, .docx, .txt, .md - up to 10 MB
            </span>
          </span>
        </label>
      </div>
    );
  }

  // Capabilities and interconnectors are both MCP-backed, so they share a form.
  // The only difference: interconnectors connect to a third-party account
  // (authorized after adding); capabilities just need access to the MCP server.
  if (kind === "mcp" || kind === "capability") {
    const isInterconnector = kind === "mcp";
    return (
      <div>
        {isInterconnector && (
          <a
            href="/docs/interconnectors"
            target="_blank"
            rel="noreferrer"
            className="mb-3.5 flex items-center gap-2.5 rounded-[10px] border border-violet/20 bg-violet-light/50 px-3.5 py-2.5 text-[12.5px] font-semibold text-violet transition-colors hover:bg-violet-light"
          >
            <BookOpen size={15} className="shrink-0" />
            <span className="flex-1">Building a custom interconnector? Read the setup guide</span>
            <ExternalLink size={13} className="shrink-0" />
          </a>
        )}
        <Field
          label="Name"
          placeholder={isInterconnector ? "e.g. Internal Wiki" : "e.g. Executive Briefing"}
        />
        <Field label="Endpoint base URL" placeholder="https://api.yourservice.com" />
        <MethodPicker />
        <ConnectionModeField />
        <TestConnection />
        <IndustryField />
        <Field
          label="What does it do?"
          placeholder="Short description for your twyns to understand when to use it."
          multiline
        />
        <p className="rounded-[10px] border border-border bg-input-bg px-3.5 py-2.5 text-[12px] leading-[1.5] text-gray-3">
          {isInterconnector
            ? "This adds the interconnector to your workshop. Connect it to a specific twyn — and authorize the account — from that twyn's edit page."
            : "Capabilities just need access to the MCP server — no third-party account required."}
        </p>
      </div>
    );
  }

  // Skills are markdown instructions your twyn loads (not MCP-backed). A short
  // description (what it does / when to use it) sits above the full instructions:
  // drop a .md file on the left, or write/edit raw Markdown on the right.
  return (
    <div>
      <Field label="Name" placeholder="e.g. Customer Discovery" />
      <Field
        label="Description"
        placeholder="A short summary your twyns use to know when to apply this skill."
        multiline
      />
      <SkillEditor />
      <IndustryField />
    </div>
  );
}

const SAMPLE_SKILL = `# Customer Discovery

## Goal
Run structured discovery interviews and surface real problems.

## Rules
- Ask open questions; never lead the witness.
- Capture the user's exact words, not your paraphrase.
- Summarize the top pain points after every call.
`;

// Split skill authoring (story 14190): a .md drag-drop zone beside a raw-text
// Markdown editor, with light formatting validation.
function SkillEditor({ initialText = "" }: { initialText?: string }) {
  const [text, setText] = useState(initialText);
  const loadFile = (list: FileList | null) => {
    if (!list || !list[0]) return;
    // Prototype: dropping a .md loads a structured sample into the editor.
    setText(SAMPLE_SKILL);
  };

  const trimmed = text.trim();
  const hasHeading = /^#\s.+/m.test(text);
  const validity: "empty" | "warn" | "ok" =
    trimmed.length === 0 ? "empty" : hasHeading ? "ok" : "warn";

  return (
    <div className="mb-3.5">
      <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
        Skill definition
      </span>
      {/* Drop affordance sits above the editor — a slim, full-width row. */}
      <label className="mb-2.5 flex cursor-pointer items-center gap-2.5 rounded-[14px] border-[1.5px] border-dashed border-border px-3.5 py-2.5 transition-colors hover:border-violet hover:bg-violet-light">
        <input
          type="file"
          accept=".md,.markdown,text/markdown"
          className="hidden"
          onChange={(e) => {
            loadFile(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-violet-mid bg-violet-light text-violet">
          <Upload size={15} />
        </span>
        <span className="text-[12.5px] text-gray-3">
          <span className="font-bold text-dark">Drop a .md file</span> or click to browse
        </span>
      </label>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"# Skill name\n\nWrite the behavioral rules your twyn should follow…"}
        spellCheck={false}
        className="min-h-[220px] w-full resize-none rounded-[14px] border-[1.5px] border-border bg-white px-3.5 py-3 font-mono text-[12.5px] leading-[1.6] text-dark outline-none placeholder:text-gray-5 focus:border-violet"
      />

      <p
        className={cn(
          "mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold",
          validity === "ok"
            ? "text-mint-text"
            : validity === "warn"
              ? "text-amber-text"
              : "text-gray-4",
        )}
      >
        {validity === "ok" ? (
          <>
            <Check size={13} strokeWidth={2.5} /> Well-formed Markdown
          </>
        ) : validity === "warn" ? (
          <>
            <Wrench size={12} /> Add a heading (e.g. # Title) to structure your skill
          </>
        ) : (
          "Drop a .md file or write your skill in Markdown."
        )}
      </p>
    </div>
  );
}

// Pre-fill the editor with a markdown skeleton from an existing skill.
function skillMarkdown(a: InventoryAsset) {
  return `# ${a.name}\n\n${a.longDesc ?? a.sub}\n\n## When to use\n${a.sub}\n`;
}
function nextVersion(v?: string) {
  const [maj, min] = (v ?? "1.0").split(".");
  return `${maj}.${Number(min ?? 0) + 1}`;
}

// Edit an existing skill: rename it and update its Markdown in the same split
// editor; saving bumps the version (story 14190 · AC4).
function EditSkillDialog({
  skill,
  onClose,
}: {
  skill: InventoryAsset | null;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  useEffect(() => {
    if (skill) {
      setName(skill.name);
      setDescription(skill.sub);
    }
  }, [skill]);
  if (!skill) return null;
  const next = nextVersion(skill.version);

  return (
    <Dialog open={Boolean(skill)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[400] bg-dark/45"
        className="z-[401] max-h-[calc(100vh-48px)] w-[min(720px,calc(100vw-32px))] overflow-y-auto rounded-[20px] border-0 bg-white p-0 shadow-[0_32px_80px_rgba(15,15,30,0.28)]"
      >
        <div className="p-7 pb-6 md:px-8">
          <div className="mb-3.5 flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="font-heading text-[19px] font-semibold leading-[1.2] tracking-[-0.4px] text-dark">
                Edit skill
              </DialogTitle>
              <DialogDescription className="mt-1 text-[13px] leading-[1.45] text-gray-4">
                Update the Markdown, rename it, or save a new version.
              </DialogDescription>
            </div>
            <DialogClose className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[12px] bg-input-bg text-gray-3 hover:bg-border hover:text-dark">
              <X size={14} strokeWidth={2.2} />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>

          <label className="mb-3.5 block">
            <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
              Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-[42px] w-full rounded-[14px] border-[1.5px] border-border bg-white px-3 text-[14px] text-dark outline-none focus:border-violet"
            />
          </label>

          <label className="mb-3.5 block">
            <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short summary your twyns use to know when to apply this skill."
              className="min-h-20 w-full resize-y rounded-[14px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[14px] leading-[1.5] text-dark outline-none placeholder:text-gray-5 focus:border-violet"
            />
          </label>

          <SkillEditor initialText={skillMarkdown(skill)} />

          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-input-bg px-3 py-1.5 text-[12px] font-semibold text-gray-3">
            <span className="h-1.5 w-1.5 rounded-full bg-violet" />
            Current v{skill.version ?? "1.0"} · saving creates v{next}
          </div>

          <div className="mt-[18px] flex items-center gap-2.5">
            <DialogClose className="rounded-full border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-2 transition-colors duration-150 hover:border-violet hover:text-violet">
              Cancel
            </DialogClose>
            <div className="flex-1" />
            <DialogClose className="inline-flex items-center gap-2 rounded-full bg-violet px-[18px] py-[11px] text-[13px] font-bold text-white hover:bg-violet-hover">
              Save changes
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Which HTTP verbs the self-hosted endpoint accepts (story 14189). Toggle chips,
// GET on by default.
const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

function MethodPicker() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["GET"]));
  const toggle = (m: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(m)) n.delete(m);
      else n.add(m);
      return n;
    });
  return (
    <div className="mb-3.5">
      <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
        HTTP methods
      </span>
      <div className="flex flex-wrap gap-1.5">
        {HTTP_METHODS.map((m) => {
          const on = selected.has(m);
          return (
            <button
              key={m}
              type="button"
              onClick={() => toggle(m)}
              aria-pressed={on}
              className={cn(
                "rounded-[9px] border px-3 py-1.5 text-[12px] font-bold tracking-[0.02em] transition-colors",
                on
                  ? "border-violet bg-violet text-white"
                  : "border-border bg-white text-gray-3 hover:border-violet-mid hover:text-violet",
              )}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// How Twynity authenticates with the interconnector. Picking a mode reveals the
// fields it needs; the (i) explains each one.
const CONNECTION_MODES = [
  { id: "none", label: "None" },
  { id: "apikey", label: "API key" },
  { id: "oauth", label: "OAuth" },
  { id: "projects", label: "Projects" },
];
const MODE_HELP: Record<string, string> = {
  none: "No authentication — the endpoint is open or gated at the network level.",
  apikey: "Paste a secret key; Twynity sends it with every request.",
  oauth: "Sign in on the provider and grant access — no keys to manage.",
  projects: "Define named projects with custom fields your twyn can populate.",
};
const FIELD_TYPES = ["Text", "Number", "Date", "Boolean", "URL"];

const modeInputCls =
  "h-[42px] w-full rounded-[14px] border-[1.5px] border-border bg-white px-3 text-[14px] text-dark outline-none placeholder:text-gray-5 focus:border-violet";

function ConnectionModeField() {
  const [mode, setMode] = useState("oauth");
  const [info, setInfo] = useState(false);
  const [fields, setFields] = useState([{ name: "", type: "Text" }]);
  const setField = (i: number, key: "name" | "type", v: string) =>
    setFields((f) => f.map((row, ri) => (ri === i ? { ...row, [key]: v } : row)));

  return (
    <div className="mb-3.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
          Connection mode
        </span>
        <button
          type="button"
          onClick={() => setInfo((v) => !v)}
          aria-label="About connection modes"
          aria-expanded={info}
          className={cn(
            "grid h-5 w-5 place-items-center rounded-full transition-colors",
            info ? "bg-violet text-white" : "text-gray-4 hover:bg-input-bg hover:text-dark",
          )}
        >
          <Info size={13} />
        </button>
      </div>

      {info && (
        <div className="mb-2.5 space-y-1.5 rounded-[10px] border border-border bg-input-bg px-3.5 py-3 text-[12px] leading-[1.5] text-gray-3">
          {CONNECTION_MODES.map((m) => (
            <div key={m.id}>
              <strong className="font-semibold text-dark">{m.label}</strong> — {MODE_HELP[m.id]}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {CONNECTION_MODES.map((m) => {
          const on = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={on}
              className={cn(
                "rounded-[9px] border px-3 py-1.5 text-[12px] font-bold transition-colors",
                on
                  ? "border-violet bg-violet text-white"
                  : "border-border bg-white text-gray-3 hover:border-violet-mid hover:text-violet",
              )}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {mode === "none" && (
        <p className="mt-2.5 rounded-[10px] border border-border bg-input-bg px-3.5 py-2.5 text-[12px] leading-[1.5] text-gray-3">
          No authentication required for this interconnector.
        </p>
      )}

      {mode === "apikey" && (
        <input type="password" placeholder="Paste your API key…" className={cn(modeInputCls, "mt-2.5")} />
      )}

      {mode === "oauth" && (
        <button
          type="button"
          className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-violet px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-violet-h"
        >
          <ExternalLink size={15} /> Authorize with OAuth
        </button>
      )}

      {mode === "projects" && (
        <div className="mt-2.5 space-y-2.5">
          <input placeholder="Project name" className={modeInputCls} />
          <div className="space-y-2">
            {fields.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={f.name}
                  onChange={(e) => setField(i, "name", e.target.value)}
                  placeholder="Field name"
                  className={cn(modeInputCls, "flex-1")}
                />
                <select
                  value={f.type}
                  onChange={(e) => setField(i, "type", e.target.value)}
                  className="h-[42px] w-[120px] shrink-0 rounded-[14px] border-[1.5px] border-border bg-white px-2.5 text-[13px] text-dark outline-none focus:border-violet"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setFields((p) => (p.length === 1 ? p : p.filter((_, ri) => ri !== i)))}
                  aria-label="Remove field"
                  className="grid h-[42px] w-9 shrink-0 place-items-center rounded-[10px] text-gray-4 transition-colors hover:bg-input-bg hover:text-dark"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFields((p) => [...p, { name: "", type: "Text" }])}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-semibold text-violet transition-colors hover:bg-violet-light"
          >
            <Plus size={13} strokeWidth={2.5} /> Add field
          </button>
        </div>
      )}
    </div>
  );
}

// Instant "Ping / Test Connection" check before saving (story 14189). Prototype:
// resolves to a 200 OK after a beat (real status check is backend).
function TestConnection() {
  const [status, setStatus] = useState<"idle" | "testing" | "ok">("idle");
  const run = () => {
    setStatus("testing");
    setTimeout(() => setStatus("ok"), 1100);
  };
  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={status === "testing"}
        className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-border bg-white px-4 py-2.5 text-[13px] font-bold text-dark transition-colors hover:border-violet hover:text-violet disabled:opacity-60"
      >
        {status === "testing" ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Plug size={15} />
        )}
        {status === "testing" ? "Testing…" : "Test connection"}
      </button>
      {status === "ok" ? (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-mint-text">
          <Check size={14} strokeWidth={2.5} /> Connected · 200 OK
        </span>
      ) : (
        <span className="text-[12px] text-gray-4">Test the endpoint before saving.</span>
      )}
    </div>
  );
}

function TypePick({
  icon: Icon,
  title,
  sub,
  onClick,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid grid-cols-[38px_1fr] items-start gap-3 rounded-[14px] border border-border bg-white p-3.5 text-left transition-[border-color,transform,background] duration-150 hover:-translate-y-px hover:border-violet-mid hover:bg-violet-light"
    >
      <span className="grid h-[38px] w-[38px] place-items-center rounded-[10px] border border-violet-mid bg-violet-light text-violet">
        <Icon size={17} strokeWidth={1.8} />
      </span>
      <span>
        <span className="block text-[13px] font-bold text-dark">{title}</span>
        <span className="mt-[3px] block text-[11px] leading-[1.45] text-gray-4">
          {sub}
        </span>
      </span>
    </button>
  );
}

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${bytes} B`;
}

// Knowledge Pack form (story 14191): a named container with a multi-file drop
// zone and the list of added files. Indexing happens after "Add" (on the card).
function KnowledgePackFields({
  value,
  onChange,
}: {
  value: { name: string; files: { name: string; size: string }[] };
  onChange: (v: { name: string; files: { name: string; size: string }[] }) => void;
}) {
  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const next = Array.from(list).map((f) => ({
      name: f.name,
      size: formatBytes(f.size),
    }));
    onChange({ ...value, files: [...value.files, ...next] });
  };
  const removeFile = (i: number) =>
    onChange({ ...value, files: value.files.filter((_, fi) => fi !== i) });

  return (
    <div>
      <label className="mb-3.5 block">
        <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
          Pack name
        </span>
        <input
          type="text"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="e.g. Q4 launch research"
          className="h-[42px] w-full rounded-[14px] border-[1.5px] border-border bg-white px-3 text-[14px] text-dark outline-none placeholder:text-gray-5 focus:border-violet"
        />
      </label>

      <IndustryField />

      <div>
        <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
          Files
        </span>
        <label className="block cursor-pointer rounded-[20px] border-[1.5px] border-dashed border-border px-5 py-6 text-center transition-colors hover:border-violet hover:bg-violet-light">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md,.csv"
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-[12px] border border-violet-mid bg-violet-light text-violet">
            <Upload size={22} />
          </span>
          <span className="mb-1 block text-[14px] font-bold text-dark">
            Drop files here
          </span>
          <span className="text-[12px] text-gray-4">
            .pdf, .doc, .docx, .txt, .md, .csv — add as many as you need
          </span>
        </label>
      </div>

      {value.files.length > 0 && (
        <>
          <ul className="mt-3 space-y-2">
            {value.files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-3 rounded-[12px] border border-border bg-white px-3 py-2.5"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-input-bg text-gray-3">
                  <FileText size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-dark">
                    {f.name}
                  </span>
                  <span className="block text-[11.5px] text-gray-4">{f.size}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label="Remove file"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-gray-4 transition-colors hover:bg-input-bg hover:text-dark"
                >
                  <X size={15} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] leading-[1.5] text-gray-4">
            {value.files.length} file{value.files.length === 1 ? "" : "s"} added — they
            index automatically once the pack is created.
          </p>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  placeholder,
  multiline = false,
}: {
  label: string;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <label className="mb-3.5 block">
      <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
        {label}
      </span>
      {multiline ? (
        <textarea
          placeholder={placeholder}
          className="min-h-20 w-full resize-y rounded-[14px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[14px] leading-[1.5] text-dark outline-none placeholder:text-gray-5 focus:border-violet"
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          className="h-[42px] w-full rounded-[14px] border-[1.5px] border-border bg-white px-3 text-[14px] text-dark outline-none placeholder:text-gray-5 focus:border-violet"
        />
      )}
    </label>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-[460px] px-8 py-20 text-center text-gray-4">
      <div className="mx-auto mb-3.5 grid h-14 w-14 place-items-center rounded-[14px] border border-border bg-input-bg text-gray-4">
        <Search size={24} strokeWidth={1.8} />
      </div>
      <div className="mb-1.5 font-heading text-[17px] font-semibold tracking-[-0.3px] text-dark">
        No matches
      </div>
      <div className="text-[13px] leading-[1.5]">
        Try a different search term or category.
      </div>
    </div>
  );
}

function DetailBox({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-border bg-input-bg px-5 pb-4 pt-[18px]",
        className,
      )}
    >
      <div className="mb-3.5 font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-gray-5">
        {label}
      </div>
      {children}
    </div>
  );
}

// A stacked label-over-value field — used in the detail dialog's metadata
// grid. Stacking (vs. a justify-between row) keeps long labels and values from
// colliding and wrapping in the narrow two-column cells.
function MetaField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1 font-heading text-[10px] font-bold uppercase tracking-[0.12em] text-gray-5">
        {label}
      </div>
      <div className="text-[13.5px] font-semibold leading-snug text-dark">
        {children}
      </div>
    </div>
  );
}

function DetailPill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "violet";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-[11px] py-1 text-[12px] font-semibold",
        tone === "violet"
          ? "bg-violet-light text-violet"
          : "border border-border bg-input-bg text-gray-2",
      )}
    >
      {children}
    </span>
  );
}

function getAddDialogContent(kind: "picker" | AssetCategory) {
  if (kind === "picker") {
    return {
      title: "New asset",
      sub: "What do you want to add?",
    };
  }

  if (kind === "skill") {
    return {
      title: "New skill",
      sub: "Skills are markdown files your twyn loads as instructions. Upload one, or write it here.",
    };
  }

  if (kind === "mcp") {
    return {
      title: "New custom interconnector",
      sub: "For your own MCP server. To add Slack, Notion, Linear and others, browse the marketplace.",
    };
  }

  if (kind === "knowledge") {
    return {
      title: "New Knowledge Pack",
      sub: "Name a pack and add one or more files — they index automatically and are ready to reference.",
    };
  }

  if (kind === "workflow") {
    return {
      title: "Import a workflow",
      sub: "Bring in a flow you built elsewhere — or buy one. It arrives as a recipe; connect it per twyn later.",
    };
  }

  return {
    title: "New capability",
    sub: "Point your twyn at an MCP server it can call — no third-party account needed.",
  };
}

function toneClass(tone: AssetTone = "violet") {
  return {
    blue: "bg-[#EFF6FF] text-[#3B82F6]",
    amber: "bg-[#FFFBEB] text-[#D97706]",
    green: "bg-[#F0FFF4] text-[#16A34A]",
    pink: "bg-[#FEF2F2] text-[#E5484D]",
    gray: "bg-input-bg text-gray-3",
    violet: "bg-violet-light text-violet",
    teal: "bg-[#F0FDFA] text-[#0D9488]",
  }[tone];
}
