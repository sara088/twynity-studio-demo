"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { deleteTwyn } from "@/features/my-twyns/lib/deleted";
import { Pencil, MessageSquare, Sparkles } from "lucide-react";
import { PillButton, pillClass } from "@/features/shared/components/PillButton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { EditBasicsModal } from "./EditBasicsModal";
import { ComingSoonSections } from "./ComingSoonSections";
import { AvatarVoiceSection } from "./AvatarVoiceSection";
import { PersistentMemorySection } from "./PersistentMemorySection";
import { GuardrailsSection } from "./GuardrailsSection";
import { SaveFooter } from "./SaveFooter";
import { Section } from "./Section";
import { useTier } from "@/features/shared/hooks/useTier";
import { BrowseDrawer } from "./BrowseDrawer";
import {
  LoadoutCard,
  EquippedChip,
  InterconnectorChip,
  AddMoreChip,
  GmailLogo,
  AzureLogo,
} from "./LoadoutCard";
import {
  SKILLS,
  KNOWLEDGE,
  WORKFLOWS,
  EQUIPPED_CAPABILITIES,
  EQUIPPED_SKILLS,
  EQUIPPED_WORKFLOWS,
  ASSIGNED_KNOWLEDGE,
  byIds,
  type CatalogItem,
} from "../data/loadout";
import {
  getPurchases,
  onPurchasesChanged,
  type PurchasedItem,
} from "@/features/shared/lib/purchases";
import type { Twyn } from "@/features/my-twyns/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { WorkflowDetailsDialog, type Schedule } from "@/features/talk/components/WorkflowDetailsDialog";
import { getItem as getWorkshopItem, slashFor, type WorkshopItem } from "@/features/talk/data/workshop";

const PROVIDERS = ["Anthropic", "OpenAI", "Google", "Meta", "Mistral"];
const MODELS = ["Claude Sonnet 4", "Claude Opus 4", "Claude Haiku 4"];

// Default system instruction seeded into a new twyn (kept as a single string
// with literal \n separators, matching the source system-prompt format).
const DEFAULT_INSTRUCTIONS =
  "ROLE\\nYou are a Graduate Executive Agent representing the organization's entry-level professional support and execution capability. Your focus is administrative coordination, business operations support, research, documentation, reporting, communication drafting, task follow-up, and structured execution of assigned responsibilities.\\n\\nPRIMARY RESPONSIBILITIES\\n- Support daily business and administrative operations\\n- Conduct basic research and summarize findings clearly\\n- Prepare reports, memos, meeting notes, proposals, and business documents\\n- Track tasks, deadlines, follow-ups, and assigned deliverables\\n- Assist with customer, client, staff, and stakeholder communication\\n- Organize information into clear formats such as tables, checklists, and summaries\\n- Support project coordination by documenting progress, risks, and next steps\\n- Help prepare presentations, briefs, internal updates, and operational records\\n- Identify gaps, inconsistencies, or missing information in assigned work\\n- Escalate issues that require senior management, technical, legal, financial, or strategic decisions\\n\\nBOUNDARIES\\n- Do not make final management decisions without approval\\n- Do not approve budgets, contracts, payments, employment decisions, or policy changes\\n- Do not give legal, financial, medical, or compliance advice as final authority\\n- Do not share confidential company, client, staff, or customer information without permission\\n- Do not fabricate data, references, reports, or business facts\\n- Do not communicate externally on behalf of the organization unless instructed\\n- Do not override instructions from senior officers, managers, or department heads\\n\\nINPUTS YOU ACCEPT\\n- Tasks from managers or supervisors\\n- Meeting notes, emails, memos, and business instructions\\n- Research topics and reporting requirements\\n- Customer or stakeholder requests\\n- Project updates, deadlines, and deliverables\\n- Company policies, templates, and standard operating procedures\\n- Raw data, lists, documents, and operational records\\n\\nOUTPUTS YOU PRODUCE\\n- Clear task summaries\\n- Professional emails and letters\\n- Meeting minutes and action points\\n- Research summaries and brief reports\\n- Checklists, trackers, and work plans\\n- Operational updates and progress reports\\n- Draft proposals, memos, notices, and internal communications\\n- Organized tables, schedules, and documentation\\n- Escalation notes when a matter requires senior review\\n\\nWORKFLOW\\n1. Understand the assigned task and expected outcome.\\n2. Identify missing information, risks, deadlines, and required approvals.\\n3. Organize the task into clear steps.\\n4. Execute the task using accurate, professional, and structured communication.\\n5. Present outputs in a clean and business-ready format.\\n6. Highlight assumptions, unresolved issues, and recommended next actions.\\n7. Escalate matters that are outside the Graduate Executive role.\\n\\nCOMMUNICATION STYLE\\n- Be professional, respectful, and clear\\n- Use simple business English\\n- Avoid vague statements\\n- Be concise but complete\\n- Use structured formats where helpful\\n- State problems clearly and recommend practical next steps\\n- Maintain confidentiality and discretion at all times\\n\\nQUALITY STANDARDS\\n- Accuracy is more important than speed\\n- Do not guess when information is missing\\n- Check grammar, tone, names, dates, figures, and formatting before finalizing work\\n- Keep records organized and easy to review\\n- Ensure every report or update includes the key issue, current status, and next action\\n\\nESCALATION RULE\\nEscalate any matter involving major financial decisions, legal risk, customer complaints, HR discipline, confidential data, safety issues, reputational risk, or unclear authority to the appropriate supervisor or manager before proceeding.";

export type BrowseType = "capabilities" | "skills" | "interconnectors" | "knowledge" | "workflows";

export function EditTwynView({ twyn }: { twyn: Twyn }) {
  const router = useRouter();
  const { hasCustom } = useTier();
  const [name, setName] = useState(twyn.name);
  const [role, setRole] = useState("Graduate Executive");
  const [gender, setGender] = useState("female");
  const [provider, setProvider] = useState("Anthropic");
  const [model, setModel] = useState("Claude Sonnet 4");
  const [editOpen, setEditOpen] = useState(false);
  const [browse, setBrowse] = useState<BrowseType | null>(null);
  // When ?show=purchased is present (deep-link from a marketplace purchase),
  // open the Browse drawer straight onto the Purchased tab.
  const [browseSource, setBrowseSource] = useState<string | undefined>(undefined);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("show") === "purchased") {
      setBrowse((params.get("cat") as BrowseType) || "interconnectors");
      setBrowseSource("Purchased");
    }
  }, []);
  // How the twyn comes across in conversation — character & tone, kept separate
  // from the task directives below.
  const [personality, setPersonality] = useState("");
  // Free-text system prompt for behavior.
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);

  // Unsaved-changes tracking, scoped per section — Save/Discard live at the
  // bottom of each section, not in the header. (Name/role save in their modal.)
  const [baseline, setBaseline] = useState({ personality, provider, model, instructions });
  const personalityDirty = personality !== baseline.personality;
  const savePersonality = () => {
    setBaseline((b) => ({ ...b, personality }));
    toast.success("Changes saved");
  };
  const discardPersonality = () => setPersonality(baseline.personality);
  const instructionsDirty =
    provider !== baseline.provider ||
    model !== baseline.model ||
    instructions !== baseline.instructions;
  const saveInstructions = () => {
    setBaseline((b) => ({ ...b, provider, model, instructions }));
    toast.success("Changes saved");
  };
  const discardInstructions = () => {
    setProvider(baseline.provider);
    setModel(baseline.model);
    setInstructions(baseline.instructions);
  };
  // Display name without the "Virtual " prefix (matches the design copy).
  const who = name.replace(/^Virtual\s+/i, "") || name;

  // Equipped state (ids per category) — the drawer toggles these.
  const [equipped, setEquipped] = useState<Record<BrowseType, string[]>>({
    capabilities: EQUIPPED_CAPABILITIES,
    skills: EQUIPPED_SKILLS,
    interconnectors: ["gmail", "azure"],
    knowledge: ASSIGNED_KNOWLEDGE,
    workflows: EQUIPPED_WORKFLOWS,
  });

  // Per-twyn workflow config: which workflow's details are open, plus its trigger
  // phrase, schedule, and the connections wired up on THIS twyn.
  const [wfDetails, setWfDetails] = useState<WorkshopItem | null>(null);
  const [wfTriggers, setWfTriggers] = useState<Record<string, string>>({});
  const [wfSchedules, setWfSchedules] = useState<Record<string, Schedule>>({});
  const [wfConnected, setWfConnected] = useState<Set<string>>(new Set());
  const WF_DEFAULT_SCHEDULE: Schedule = { enabled: false, time: "08:00", freq: "weekdays" };

  const toggle = (cat: BrowseType, id: string) =>
    setEquipped((prev) => ({
      ...prev,
      [cat]: prev[cat].includes(id) ? prev[cat].filter((x) => x !== id) : [...prev[cat], id],
    }));

  // Marketplace purchases for this twyn — merged into the catalog so they're
  // equippable here too (and resolve when shown as loadout chips).
  const [purchases, setPurchases] = useState<PurchasedItem[]>([]);
  useEffect(() => {
    const load = () => setPurchases(getPurchases(twyn.id));
    load();
    return onPurchasesChanged(load);
  }, [twyn.id]);
  const purchasedFor = (cat: BrowseType): CatalogItem[] =>
    purchases
      .filter((p) => p.type === cat)
      .map((p) => ({ id: p.id, name: p.name, desc: p.description, icon: Sparkles }));

  const skills = byIds([...SKILLS, ...purchasedFor("skills")], equipped.skills);
  const knowledge = byIds([...KNOWLEDGE, ...purchasedFor("knowledge")], equipped.knowledge);
  const workflows = byIds([...WORKFLOWS, ...purchasedFor("workflows")], equipped.workflows);
  const interIds = equipped.interconnectors;

  // A required connection is satisfied if this twyn has the matching interconnector
  // connected (Gmail↔gmail, Calendar/Outlook↔azure), or the user wired it up here.
  const baseConnected = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("gmail")) return interIds.includes("gmail");
    if (n.includes("calendar") || n.includes("outlook") || n.includes("teams"))
      return interIds.includes("azure");
    return false;
  };
  // Only native workflows (built/captured/marketplace — they run on our platform via
  // our interconnectors) bind connections per twyn. Workflows imported from an
  // external platform (n8n/Zapier/…) connect to their own tools over there, so we
  // don't ask for any connections inside our platform.
  const wfConnectionsFor = (item: WorkshopItem) =>
    item.workflow?.platform
      ? []
      : (item.workflow?.requires ?? []).map((name) => ({
          name,
          connected: baseConnected(name) || wfConnected.has(name),
        }));
  const wfPhraseFor = (item: WorkshopItem) =>
    (wfTriggers[item.id] ?? item.workflow?.trigger ?? item.name).toLowerCase();

  return (
    <div className="mx-auto max-w-[1200px] space-y-3">
      {/* Identity header + actions */}
      <div className="flex flex-col gap-4 rounded-card border border-border bg-white p-5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 items-center gap-5">
          <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-[18px] bg-violet-mid">
            <Image src={twyn.portrait} alt={name} fill sizes="120px" className="object-cover" style={{ objectPosition: "center 20%" }} />
            <span className="absolute bottom-2 right-2 h-[15px] w-[15px] rounded-full border-[2.5px] border-white bg-success animate-status-pulse" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-[22px] font-semibold leading-tight tracking-[-0.5px] text-dark">
              {name}
            </h1>
            <p className="mt-0.5 text-[13px] text-gray-3">{role}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-gray-4">
              <span><strong className="font-semibold text-dark">Online</strong> · responding now</span>
              <span className="h-[3px] w-[3px] rounded-full bg-gray-6" />
              <span>Updated <span className="font-sans">2</span> days ago</span>
              <span className="h-[3px] w-[3px] rounded-full bg-gray-6" />
              <span className="text-gray-5">Level <span className="font-sans">1</span></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 lg:ml-auto lg:justify-end">
          <PillButton variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil size={14} /> Edit basics
          </PillButton>
          <Link href={`/talk/${twyn.id}`} className={pillClass("primary", "sm")}>
            <MessageSquare size={14} /> Talk to {name.split(" ").slice(-1)[0]}
          </Link>
        </div>
      </div>


      {/* Personality — character & tone, separate from task instructions. */}
      <Section
        title="Personality"
        summary={`How ${who} comes across in conversation.`}
        defaultOpen={false}
      >
        <FieldBlock
          title="Personality"
          hint={`How ${who} comes across — tone, warmth, and conversational style.`}
        >
          <textarea
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            maxLength={1000}
            spellCheck={false}
            placeholder="e.g. Warm and concise. Curious and direct. Uses plain language and a little humor…"
            className="min-h-[200px] w-full resize-none rounded-input border-[1.5px] border-border bg-white p-3.5 text-[13px] leading-[1.65] text-dark outline-none transition-colors placeholder:text-gray-5 focus:border-violet"
          />
          <div className="mt-2 text-[11.5px] text-gray-5">
            Character and tone, not role or task rules.
          </div>
        </FieldBlock>
        {personalityDirty && (
          <SaveFooter onDiscard={discardPersonality} onSave={savePersonality} />
        )}
      </Section>

      {/* Instructions & model */}
      <Section
        title="Instructions & model"
        summary={`Core directives sent to the model on every reply — role, constraints, and priorities for ${who}.`}
        defaultOpen={false}
      >
        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <FieldBlock
            title="Instruction"
            hint={`Core directives sent to the model on every reply — role, constraints, and priorities for ${who}.`}
            className="flex flex-col"
            contentClassName="flex min-h-0 flex-1 flex-col"
          >
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={8000}
              spellCheck={false}
              placeholder={`e.g. You are ${who}, a Graduate Executive. Be concise and warm. Ask before acting…`}
              className="min-h-[320px] flex-1 resize-none rounded-input border-[1.5px] border-border bg-white p-3.5 text-[13px] leading-[1.65] text-dark outline-none transition-colors placeholder:text-gray-5 focus:border-violet"
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-[11.5px] text-gray-5">
              <span>Plain language works best — brief it like a new hire.</span>
              <span className="shrink-0 font-sans tabular-nums">{instructions.length}/8000</span>
            </div>
          </FieldBlock>

          <div className="flex flex-col gap-6">
            <FieldBlock title="Provider & model" hint="Choose which AI provider and model run this twyn.">
              <div className="space-y-3">
                <FieldSelect label="Provider" value={provider} onChange={setProvider} options={PROVIDERS} />
                <FieldSelect label="Model" value={model} onChange={setModel} options={MODELS} />
              </div>
            </FieldBlock>
          </div>
        </div>
        {instructionsDirty && (
          <SaveFooter onDiscard={discardInstructions} onSave={saveInstructions} />
        )}
      </Section>

      {/* Skills & connections */}
      <Section
        title="Skills & connections"
        summary="What Sara can do."
      >
        <div className="grid gap-[14px] md:grid-cols-2">
          <LoadoutCard title="Connected interconnectors" count={interIds.length} countLabel="connected" addLabel="Edit interconnectors" onAdd={() => setBrowse("interconnectors")}>
            {interIds.includes("gmail") && <InterconnectorChip logo={<GmailLogo />} label="Gmail" />}
            {interIds.includes("azure") && <InterconnectorChip logo={<AzureLogo />} label="Microsoft Azure" />}
            <AddMoreChip label="Connect more" onClick={() => setBrowse("interconnectors")} />
          </LoadoutCard>

          <LoadoutCard title="Skills" count={skills.length} countLabel="equipped" addLabel="Edit skills" onAdd={() => setBrowse("skills")}>
            {skills.map((s) => (
              <EquippedChip key={s.id} icon={s.icon} label={s.name} kind="skills" />
            ))}
            <AddMoreChip onClick={() => setBrowse("skills")} />
          </LoadoutCard>

          <LoadoutCard title="Knowledge" count={knowledge.length} countLabel="assigned" addLabel="Edit knowledge packs" onAdd={() => setBrowse("knowledge")}>
            {knowledge.map((k) => (
              <EquippedChip key={k.id} icon={k.icon} label={k.name} kind="knowledge" />
            ))}
            <AddMoreChip onClick={() => setBrowse("knowledge")} />
          </LoadoutCard>

          <LoadoutCard title="Workflows" count={workflows.length} countLabel="equipped" addLabel="Edit workflows" onAdd={() => setBrowse("workflows")}>
            {workflows.map((w) => {
              const item = getWorkshopItem(w.id);
              return item?.workflow ? (
                <button key={w.id} type="button" onClick={() => setWfDetails(item)} className="outline-none">
                  <EquippedChip icon={w.icon} label={w.name} kind="workflows" />
                </button>
              ) : (
                <EquippedChip key={w.id} icon={w.icon} label={w.name} kind="workflows" />
              );
            })}
            <AddMoreChip onClick={() => setBrowse("workflows")} />
          </LoadoutCard>
        </div>
      </Section>

      {/* Persistent memory — connect an external second brain (experimental). */}
      <PersistentMemorySection twynName={who} />

      {/* Guardrails — hard limits picked from a library (experimental). */}
      <GuardrailsSection twynName={who} />

      {/* Avatar & voice — swap custom for stock (no regenerate). */}
      <AvatarVoiceSection twyn={twyn} hasCustom={hasCustom} />

      <ComingSoonSections />

      <BrowseDrawer
        category={browse}
        twynId={twyn.id}
        defaultSource={browseSource}
        onClose={() => {
          setBrowse(null);
          setBrowseSource(undefined);
        }}
        onCategoryChange={setBrowse}
        equipped={equipped}
        onToggle={toggle}
        onOpenWorkflowDetails={(id) => {
          const it = getWorkshopItem(id);
          if (it?.workflow) setWfDetails(it);
        }}
      />

      <WorkflowDetailsDialog
        key={wfDetails?.id ?? "wf-details"}
        open={!!wfDetails}
        onClose={() => setWfDetails(null)}
        item={wfDetails}
        slash={wfDetails ? slashFor(wfDetails.name) : ""}
        phrase={wfDetails ? wfPhraseFor(wfDetails) : ""}
        onSetPhrase={(phrase) =>
          wfDetails &&
          setWfTriggers((t) => ({
            ...t,
            [wfDetails.id]: phrase || (wfDetails.workflow?.trigger ?? wfDetails.name),
          }))
        }
        schedule={(wfDetails && wfSchedules[wfDetails.id]) || WF_DEFAULT_SCHEDULE}
        onSetSchedule={(s) => wfDetails && setWfSchedules((m) => ({ ...m, [wfDetails.id]: s }))}
        onRemove={() => wfDetails && toggle("workflows", wfDetails.id)}
        connections={wfDetails ? wfConnectionsFor(wfDetails) : []}
        onConnect={(name) => setWfConnected((s) => new Set(s).add(name))}
        equipped={wfDetails ? equipped.workflows.includes(wfDetails.id) : true}
      />

      <EditBasicsModal
        open={editOpen}
        onOpenChange={setEditOpen}
        name={name}
        role={role}
        gender={gender}
        onSave={({ name: n, role: r, gender: g }) => {
          setName(n);
          setRole(r);
          setGender(g);
        }}
        onDelete={() => {
          deleteTwyn(twyn.id);
          setEditOpen(false);
          toast.success(`${name} deleted`);
          router.push("/my-twyns");
        }}
      />

      {/* Floating support agent — only on the Edit page for now. */}
    </div>
  );
}

// A borderless titled field block (used inside a Section card).
function FieldBlock({
  title,
  hint,
  children,
  className,
  contentClassName,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className={cn("rounded-card border border-border bg-bg-input p-4", className)}>
      <h3 className="font-heading text-[14px] font-semibold tracking-[-0.2px] text-dark">{title}</h3>
      {hint && <p className="mt-1 text-[12.5px] leading-[1.5] text-gray-4">{hint}</p>}
      <div className={cn("mt-3", contentClassName)}>{children}</div>
    </div>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-5">
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-full rounded-input border-[1.5px] border-border bg-white px-3 text-[13px] font-semibold text-dark focus-visible:border-violet focus-visible:ring-0 [&>svg]:text-gray-5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o} className="text-[13px]">
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
