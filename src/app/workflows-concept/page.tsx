import {
  Sparkles,
  Search,
  Star,
  Check,
  Clock,
  Zap,
  MessageSquare,
  Camera,
  LayoutTemplate,
  ArrowRight,
  GripVertical,
  Bot,
  UserRound,
  Users,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { BrandIcon } from "@/features/marketplace/components/BrandIcon";

// ─────────────────────────────────────────────────────────────────────────
// Workflows & Teams — concept preview (what the USER sees, in Studio design).
// A visual walkthrough of the journey: discover outcome-based workflows →
// open one → make your own → run it in chat → grow into a team.
// No product logic; this page is for design sign-off. Route: /workflows
// ─────────────────────────────────────────────────────────────────────────

export default function WorkflowsPreview() {
  return (
    <div className="min-h-screen bg-bg-page px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-[1080px]">
        <header className="mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-violet">
            <Sparkles size={12} /> Concept preview
          </span>
          <h1 className="mt-3 font-heading text-[32px] font-bold leading-[1.1] tracking-[-0.8px] text-dark">
            Workflows — outcomes your twyn runs
          </h1>
          <p className="mt-2 max-w-[660px] text-[15px] leading-[1.6] text-gray-3">
            Not a canvas of nodes. A gallery of <span className="font-semibold text-dark">outcomes</span> — pick one,
            make it yours, and your twyn runs it end-to-end across your tools. Built by us and by the community,
            free or paid, like a template you can use in a click.
          </p>
        </header>

        <IntraInterCallout />
        <DiscoverSection />
        <UpCloseSection />
        <CreateSection />
        <RunSection />
        <TeamsSection />

        <footer className="mt-6 border-t border-border pt-5 text-[12px] text-gray-4">
          Concept preview for design — outcome-first discovery inspired by ElevenLabs templates; invocation &amp;
          capture patterns from Claude / Cursor / OpenAI, tailored to a twyn that works across your tools.
        </footer>
      </div>
    </div>
  );
}

/* ─── Concept callout · Solo (intra) vs Team (inter) ─────────────────────── */

function IntraInterCallout() {
  return (
    <div className="mb-10 rounded-card border-[1.5px] border-violet/25 bg-violet-light/40 p-5 sm:p-6">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-violet ring-1 ring-violet/20">
        Concept · for discussion
      </span>
      <h2 className="mt-3 font-heading text-[18px] font-bold tracking-[-0.3px] text-dark">Two kinds of workflow: Solo and Team</h2>
      <p className="mt-1.5 max-w-[740px] text-[13.5px] leading-[1.6] text-gray-3">
        Same thing, different cast. You build and run both the same way — type <span className="font-sans font-semibold text-gray-2">/</span>.
        The only difference is <span className="font-semibold text-dark">who does the steps</span>.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-white p-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-violet-light text-violet"><Bot size={16} /></span>
            <div>
              <div className="text-[13.5px] font-bold text-dark">Solo workflow <span className="font-normal text-gray-4">· “intra”</span></div>
              <div className="text-[11.5px] text-gray-4">One twyn · its own tools</div>
            </div>
          </div>
          <p className="mt-2.5 text-[12.5px] leading-[1.55] text-gray-3">
            Your twyn runs the whole outcome itself, across your connected tools — and you run it right in your twyn's chat. Most workflows here are Solo.
          </p>
        </div>
        <div className="rounded-card border border-border bg-white p-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-amber text-amber-text"><Users size={16} /></span>
            <div>
              <div className="text-[13.5px] font-bold text-dark">Team workflow <span className="font-normal text-gray-4">· “inter”</span></div>
              <div className="text-[11.5px] text-gray-4">A crew of twyns · one lead</div>
            </div>
          </div>
          <p className="mt-2.5 text-[12.5px] leading-[1.55] text-gray-3">
            Bigger outcomes run across several specialist twyns — a lead splits the steps and hands each to the right one. You run these in the team chat.
          </p>
        </div>
      </div>
      <p className="mt-3.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] leading-[1.5] text-gray-3">
        <Sparkles size={13} className="text-violet" />
        <span className="font-semibold text-dark">How they connect:</span>
        a Solo workflow becomes a Team one the moment a step needs a specialist your twyn doesn't have — you add a twyn and it graduates.
        <a href="/teams" className="font-semibold text-violet">See team workflows →</a>
      </p>
    </div>
  );
}

/* ─── Section 1 · Discover ───────────────────────────────────────────────── */

function DiscoverSection() {
  return (
    <Section n="1" title="Discover — see the outcome you want, instantly">
      {/* The one bar: search a known outcome, OR describe what you want. */}
      <div className="flex items-center gap-3 rounded-btn border border-border bg-white px-5 py-3.5 shadow-[0_2px_10px_rgba(15,15,30,0.04)]">
        <Search size={18} className="text-gray-4" />
        <span className="text-[14.5px] text-gray-4">
          Search an outcome — or describe what you want to automate…
        </span>
        <span className="ml-auto rounded-md border border-border px-2 py-0.5 font-sans text-[12px] font-semibold text-gray-4">/</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["Popular", "Sales", "Marketing", "Ops", "Research", "Personal"].map((c, i) => (
          <span
            key={c}
            className={
              i === 0
                ? "rounded-full bg-violet px-3.5 py-1.5 text-[12.5px] font-semibold text-white"
                : "rounded-full border border-border bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-gray-3"
            }
          >
            {c}
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OUTCOMES.map((o) => (
          <OutcomeCard key={o.title} {...o} />
        ))}
      </div>
    </Section>
  );
}

type Outcome = {
  title: string;
  desc: string;
  tools: string[];
  trigger: string;
  by: string;
  verified?: boolean;
  rating: string;
  runs: string;
  price: string;
  team?: boolean;
};

const OUTCOMES: Outcome[] = [
  { title: "Daily inbox brief", desc: "Every morning, summarize overnight email and flag what actually needs you.", tools: ["gmail", "slack"], trigger: "Every weekday 8:00", by: "@twynity", verified: true, rating: "4.9", runs: "2.1k", price: "Free" },
  { title: "Weekly competitor report", desc: "Research rivals, write it up, and lay it out — a research + copy + design crew.", tools: ["notion", "slack"], trigger: "Weekly · Mon", by: "@priyac", rating: "4.8", runs: "890", price: "$4/mo", team: true },
  { title: "Meetings → follow-ups", desc: "After a call, draft the follow-up emails and log action items as tasks.", tools: ["calendar", "gmail", "linear"], trigger: "On calendar event", by: "@chenwei", verified: true, rating: "4.9", runs: "1.4k", price: "Free" },
  { title: "Chase overdue invoices", desc: "Find overdue invoices and send polite, on-brand nudges — with your OK.", tools: ["stripe", "gmail"], trigger: "Daily", by: "@4th-ir", verified: true, rating: "4.7", runs: "560", price: "$5/mo" },
  { title: "New lead → qualified & routed", desc: "Enrich each inbound lead, score it, and route the hot ones to sales.", tools: ["hubspot", "slack"], trigger: "On new lead", by: "@sales", rating: "4.6", runs: "1.1k", price: "Free" },
  { title: "Design review digest", desc: "Round up new Figma comments and post a tidy digest for the team.", tools: ["figma", "slack"], trigger: "Daily 5:00", by: "@maria", rating: "4.8", runs: "430", price: "$3" },
];

function OutcomeCard({ title, desc, tools, trigger, by, verified, rating, runs, price, team }: Outcome) {
  const paid = price !== "Free";
  return (
    <article className="hover-lift flex flex-col rounded-card border border-border bg-white p-5">
      <div className="mb-3 flex items-center gap-1.5">
        {tools.map((t) => (
          <span key={t} className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] border border-border bg-white">
            <BrandIcon logo={t} className="h-[15px] w-[15px]" />
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-gray-4">
          <Clock size={11} /> {trigger}
        </span>
      </div>
      <h3 className="font-heading text-[16.5px] font-bold tracking-[-0.3px] text-dark">{title}</h3>
      <div className="mt-1.5">
        {team ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber px-2 py-0.5 text-[10.5px] font-bold text-amber-text">
            <Users size={11} /> Team · a crew
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-bg-input px-2 py-0.5 text-[10.5px] font-bold text-gray-4">
            <Bot size={11} /> Solo · your twyn
          </span>
        )}
      </div>
      <p className="mt-1.5 flex-1 text-[13px] leading-[1.5] text-gray-3">{desc}</p>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-4">
          <span className="font-semibold text-gray-2">{by}</span>
          {verified && <Check size={12} className="text-violet" />}
          <span className="text-gray-5">·</span>
          <Star size={11} className="fill-amber-text/80 text-amber-text" /> {rating}
          <span className="font-sans tabular-nums">· {runs}</span>
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={paid ? "font-sans text-[13px] font-bold text-dark" : "text-[13px] font-bold text-mint-text"}>{price}</span>
        <button className="inline-flex items-center gap-1.5 rounded-btn bg-violet px-4 py-2 text-[12.5px] font-bold text-white">
          Use <ArrowRight size={13} />
        </button>
      </div>
    </article>
  );
}

/* ─── Section 2 · A workflow, up close ───────────────────────────────────── */

function UpCloseSection() {
  const steps = [
    { icon: <BrandIcon logo="gmail" className="h-4 w-4" />, text: "Pull overnight email", tag: "tool" },
    { icon: <Bot size={15} />, text: "Summarize & flag what needs you", tag: "twyn" },
    { icon: <ShieldCheck size={15} />, text: "Wait for your OK", tag: "you" },
    { icon: <BrandIcon logo="slack" className="h-4 w-4" />, text: "Post the brief to #morning", tag: "tool" },
  ] as const;
  return (
    <Section n="2" title="Open one — see exactly what it does, then make it yours">
      <div className="overflow-hidden rounded-[18px] border border-border bg-white shadow-[0_8px_30px_rgba(15,15,30,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          {/* left — what it does */}
          <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-violet-light text-violet"><Zap size={17} /></span>
              <div>
                <h3 className="font-heading text-[18px] font-bold tracking-[-0.3px] text-dark">Daily inbox brief</h3>
                <span className="text-[12px] text-gray-4">@twynity · <Star size={10} className="inline fill-amber-text/80 text-amber-text" /> 4.9 · 2.1k runs</span>
              </div>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-bg-input px-3 py-1.5 text-[12px] font-medium text-gray-3">
              <Clock size={12} className="text-violet" /> Runs every weekday at 8:00 — or type <span className="font-sans font-semibold text-gray-2">/morning-brief</span>
            </div>

            <div className="mt-5">
              <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-5">What it does</div>
              <ol className="space-y-2.5">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="font-sans text-[12px] font-bold text-gray-5">{i + 1}</span>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-border bg-white">{s.icon}</span>
                    <span className="flex-1 text-[13.5px] text-dark">{s.text}</span>
                    <StepTag tag={s.tag} />
                  </li>
                ))}
              </ol>
              <div className="mt-3 rounded-[10px] bg-mint/40 px-3 py-2 text-[12.5px] text-mint-text">
                <Check size={13} className="mr-1 inline" /> Success: brief posted, ready before your day starts.
              </div>
            </div>
          </div>

          {/* right — make it yours */}
          <div className="flex flex-col gap-4 bg-bg-content/60 p-6">
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-5">It'll ask you for</div>
              <div className="flex flex-wrap gap-2">
                {["Which inbox", "Post to #channel", "Tone: brief"].map((c) => (
                  <span key={c} className="rounded-full border border-border bg-white px-3 py-1.5 text-[12.5px] text-gray-2">{c}</span>
                ))}
              </div>
            </div>

            <button className="inline-flex items-center justify-center gap-2 rounded-btn bg-violet px-5 py-3 text-[14px] font-bold text-white">
              Use this workflow <ArrowRight size={15} />
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-btn border border-border bg-white px-5 py-3 text-[13.5px] font-semibold text-gray-2">
              Remix &amp; edit
            </button>

            <div className="mt-auto space-y-2 rounded-[12px] border border-border bg-white p-3.5 text-[12px] leading-[1.5] text-gray-3">
              <div className="flex items-center gap-1.5 font-semibold text-mint-text"><Check size={13} /> Free workflows: fork, edit, and make them your own.</div>
              <div className="flex items-center gap-1.5 font-semibold text-gray-2"><ShieldCheck size={13} className="text-violet" /> Paid ones run on your twyn — the recipe stays private.</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function StepTag({ tag }: { tag: "tool" | "twyn" | "you" }) {
  const map = {
    tool: { label: "tool", cls: "bg-amber text-amber-text" },
    twyn: { label: "your twyn", cls: "bg-violet-light text-violet" },
    you: { label: "your OK", cls: "bg-mint text-mint-text" },
  } as const;
  const t = map[tag];
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${t.cls}`}>{t.label}</span>;
}

/* ─── Section 3 · Make your own ──────────────────────────────────────────── */

function CreateSection() {
  return (
    <Section n="3" title="Make your own — three ways, no diagrams">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MethodCard
          icon={<MessageSquare size={18} />}
          title="Describe it"
          desc="“Every Monday, pull last week's revenue, draft the board update, wait for my OK, then post to Slack.” Your twyn drafts the workflow."
          tag="Most people start here"
        />
        <MethodCard
          icon={<Camera size={18} />}
          title="Capture it"
          desc="Just did something useful with your twyn? Tap “Save as a workflow” and it turns what you did into a reusable one."
          tag="From what you just did"
        />
        <MethodCard
          icon={<LayoutTemplate size={18} />}
          title="Start from a template"
          desc="Grab one from the gallery and tweak the steps, tools, and tone until it fits how you work."
          tag="Remix & go"
        />
      </div>

      {/* The builder — a readable card, not a node graph. */}
      <div className="mt-5 overflow-hidden rounded-card border border-border bg-white">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-violet text-white"><Zap size={16} /></span>
          <input
            readOnly
            value="Weekly board update"
            className="flex-1 bg-transparent font-heading text-[16px] font-bold tracking-[-0.3px] text-dark outline-none"
          />
          <span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-mint-text">Draft ready</span>
        </div>
        <div className="space-y-4 p-5">
          <BuilderRow label="When">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-input px-3 py-1.5 text-[12.5px] text-gray-2"><Clock size={12} /> Every Monday 8:00</span>
            <span className="text-gray-5">or</span>
            <span className="rounded-full bg-bg-input px-3 py-1.5 font-sans text-[12.5px] font-semibold text-gray-2">/board-update</span>
          </BuilderRow>
          <BuilderRow label="Inputs">
            {["Revenue source: Stripe", "Post to: #board", "Tone: concise"].map((c) => (
              <span key={c} className="rounded-full border border-border bg-white px-3 py-1.5 text-[12.5px] text-gray-2">{c}</span>
            ))}
          </BuilderRow>
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-5">Steps</div>
            <div className="space-y-2">
              {[
                { icon: <BrandIcon logo="stripe" className="h-4 w-4" />, text: "Pull last week's revenue", tag: "tool" },
                { icon: <Bot size={15} />, text: "Draft the board update", tag: "twyn" },
                { icon: <ShieldCheck size={15} />, text: "Wait for my OK", tag: "you" },
                { icon: <BrandIcon logo="slack" className="h-4 w-4" />, text: "Post to #board", tag: "tool" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-[12px] border border-border bg-bg-content/50 px-3 py-2.5">
                  <GripVertical size={15} className="text-gray-5" />
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-border bg-white">{s.icon}</span>
                  <span className="flex-1 text-[13.5px] text-dark">{s.text}</span>
                  <StepTag tag={s.tag as "tool" | "twyn" | "you"} />
                </div>
              ))}
              <div className="flex items-center gap-2 pl-11 text-[12px] text-gray-4">
                <span className="text-violet">↳</span> if I edit the draft → re-draft (up to 2×)
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-btn border border-dashed border-border px-3.5 py-2 text-[12.5px] font-semibold text-gray-4">
                <Plus size={14} /> Add a step
              </button>
            </div>
          </div>
          <div className="rounded-[10px] bg-mint/40 px-3 py-2 text-[12.5px] text-mint-text">
            <Check size={13} className="mr-1 inline" /> Done when: the update is posted &amp; acknowledged.
          </div>
        </div>
      </div>
    </Section>
  );
}

function MethodCard({ icon, title, desc, tag }: { icon: React.ReactNode; title: string; desc: string; tag: string }) {
  return (
    <div className="hover-lift flex flex-col rounded-card border border-border bg-white p-5">
      <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-violet-light text-violet">{icon}</span>
      <h3 className="mt-3 font-heading text-[16px] font-bold tracking-[-0.3px] text-dark">{title}</h3>
      <p className="mt-1 flex-1 text-[13px] leading-[1.5] text-gray-3">{desc}</p>
      <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-bg-input px-2.5 py-1 text-[11px] font-semibold text-gray-4">{tag}</span>
    </div>
  );
}

function BuilderRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="w-[64px] shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-5">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

/* ─── Section 4 · Run it ─────────────────────────────────────────────────── */

function RunSection() {
  return (
    <Section n="4" title="Run it — right inside the conversation">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* invoke via / */}
        <div className="rounded-card border border-border bg-white p-5">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-5">Invoke</div>
          <div className="rounded-[14px] border border-border bg-bg-input/50 p-3">
            <div className="flex items-center gap-2 rounded-[10px] border border-violet bg-white px-3 py-2 text-[13.5px] text-dark">
              <span className="font-sans font-semibold text-violet">/</span> morning
            </div>
            <div className="mt-2 overflow-hidden rounded-[10px] border border-border bg-white">
              {[
                { name: "/morning-brief", desc: "Daily inbox brief", icon: "gmail" },
                { name: "/competitor-report", desc: "Weekly competitor report", icon: "notion" },
                { name: "/follow-ups", desc: "Meetings → follow-ups", icon: "calendar" },
              ].map((r, i) => (
                <div key={r.name} className={`flex items-center gap-2.5 px-3 py-2.5 ${i === 0 ? "bg-violet-light" : ""}`}>
                  <span className="grid h-6 w-6 place-items-center rounded-[6px] border border-border bg-white"><BrandIcon logo={r.icon} className="h-[13px] w-[13px]" /></span>
                  <span className="font-sans text-[12.5px] font-semibold text-dark">{r.name}</span>
                  <span className="text-[12px] text-gray-4">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-[12.5px] leading-[1.5] text-gray-4">
            Type <span className="font-sans font-semibold text-gray-2">/</span> to pick a workflow, @mention a twyn to run
            theirs, or just ask in plain words. Scheduled ones run on their own.
          </p>
        </div>

        {/* live run */}
        <div className="rounded-card border border-border bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-5">Running · Daily inbox brief</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-light px-2.5 py-1 text-[11px] font-bold text-violet"><Clock size={11} /> Every weekday 8:00</span>
          </div>
          <div className="space-y-2 rounded-[12px] bg-bg-input/60 p-3.5 text-[13px]">
            <RunStep done text="Fetched 12 overnight emails" />
            <RunStep done text="Summarized · flagged 2 as urgent" />
            <div className="flex items-center gap-2 text-dark">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-amber text-amber-text"><Clock size={12} /></span>
              <span className="flex-1 font-medium">Waiting for your OK</span>
              <span className="rounded-btn bg-violet px-3 py-1 text-[11.5px] font-bold text-white">Approve</span>
              <span className="rounded-btn border border-border px-3 py-1 text-[11.5px] font-semibold text-gray-2">Edit</span>
            </div>
            <RunStep text="Post the brief to #morning" pending />
          </div>
          <div className="mt-3 rounded-[12px] border border-border bg-white p-3.5">
            <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-gray-5">Your brief · today</div>
            <div className="mt-1.5 text-[13.5px] font-semibold text-dark">3 things need you</div>
            <p className="mt-1 text-[12.5px] leading-[1.5] text-gray-3">Contract from Acme to sign · reply to investor intro · standup at 10.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function RunStep({ text, done, pending }: { text: string; done?: boolean; pending?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${pending ? "text-gray-4" : "text-gray-2"}`}>
      <span className={`grid h-5 w-5 place-items-center rounded-full ${done ? "bg-mint text-mint-text" : "border border-border text-gray-5"}`}>
        {done ? <Check size={12} strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-gray-5" />}
      </span>
      <span className={pending ? "" : "font-medium"}>{text}</span>
    </div>
  );
}

/* ─── Section 5 · Teams ──────────────────────────────────────────────────── */

function TeamsSection() {
  return (
    <Section n="5" title="Teams — when one outcome needs more than one twyn">
      <p className="mb-4 max-w-[720px] text-[13.5px] leading-[1.6] text-gray-3">
        Bigger outcomes become a <span className="font-semibold text-dark">team</span>: your twyn plus specialists you
        bring in — yours, a teammate's, or hired from the marketplace. A neutral lead splits the work, each twyn does its
        part in its owner's voice, and you approve the important calls.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* the team */}
        <div className="rounded-card border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-[16px] font-bold tracking-[-0.3px] text-dark">Launch brief team</h3>
              <span className="text-[12px] text-gray-4">Goal: ship the Q3 launch one-pager</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-light px-2.5 py-1 text-[11px] font-bold text-violet"><Bot size={12} /> Orchestrated</span>
          </div>
          <div className="mt-4 space-y-2">
            <TeamMember name="Virtual Sara" role="Lead the brief · your voice" owner="you" initials="VS" you />
            <TeamMember name="Research twyn" role="Market + competitor research" owner="@chenwei" initials="RT" />
            <TeamMember name="Design twyn" role="Layout & visuals" owner="@maria" initials="DT" />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-[10px] bg-bg-input/60 px-3 py-2.5 text-[12.5px] text-gray-3">
            <ShieldCheck size={14} className="text-violet" /> Each twyn only shares its results — private knowledge stays with its owner.
          </div>
        </div>

        {/* hire */}
        <div className="rounded-card border border-border bg-white p-5">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-5">Add a specialist</div>
          <div className="space-y-2.5">
            {[
              { name: "Research twyn", by: "@chenwei", rating: "4.9", price: "$5/task" },
              { name: "Copy twyn", by: "@lena", rating: "4.8", price: "$4/task" },
              { name: "Data twyn", by: "@omar", rating: "4.7", price: "$6/task" },
            ].map((s) => (
              <div key={s.name} className="flex items-center gap-3 rounded-[12px] border border-border bg-white px-3 py-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-violet text-[12px] font-bold text-white">{s.name[0]}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-dark">{s.name}</div>
                  <div className="text-[11.5px] text-gray-4">{s.by} · <Star size={9} className="inline fill-amber-text/80 text-amber-text" /> {s.rating} · {s.price}</div>
                </div>
                <button className="rounded-btn border border-border px-3 py-1.5 text-[12px] font-semibold text-violet">Add</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function TeamMember({ name, role, owner, initials, you }: { name: string; role: string; owner: string; initials: string; you?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-border bg-bg-content/50 px-3 py-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet text-[13px] font-bold text-white">{initials}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-bold text-dark">{name}</span>
          {you ? (
            <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-mint-text">you</span>
          ) : (
            <span className="rounded-full bg-bg-input px-2 py-0.5 text-[10px] font-bold text-gray-4">{owner}</span>
          )}
        </div>
        <div className="text-[12px] text-gray-4">{role}</div>
      </div>
      <UserRound size={16} className="text-gray-5" />
    </div>
  );
}

/* ─── shared ─────────────────────────────────────────────────────────────── */

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-baseline gap-2.5">
        <span className="font-heading text-[13px] font-bold text-violet">{n}</span>
        <h2 className="font-heading text-[20px] font-bold tracking-[-0.4px] text-dark">{title}</h2>
      </div>
      {children}
    </section>
  );
}
