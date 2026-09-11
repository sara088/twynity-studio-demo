import {
  BarChart3,
  Download,
  RefreshCw,
  X,
  Maximize2,
  Sparkles,
  Check,
  Plus,
  Building2,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";

import {
  AppCard,
  AppHeader,
  AppHeaderAction,
  AppBody,
  AppFooter,
  Action,
  SectionLabel,
  Chip,
  DataTable,
  BarChart,
  List,
  KeyValue,
  FileList,
  Media,
  MapBlock,
  Form,
  Field,
  Input,
  Select,
  StateRunning,
  StateLoading,
  StateEmpty,
  StateError,
} from "@/components/mcp-kit";

// ─────────────────────────────────────────────────────────────────────────
// MCP App Design Guide — live reference.
// Everything here is composed from the real component kit (@/components/mcp-kit)
// so this page IS the proof the kit works, not a mock-up. It's the "golden
// example" the written guide points to, and the source of its screenshots.
// Route: /mcp-guide
// ─────────────────────────────────────────────────────────────────────────

// Shared data for the "Market Pulse" example app.
const ROWS = [
  { name: "Northwind", price: "$52/mo", pos: "Premium", value: 52, you: false },
  { name: "Acme Co.", price: "$46/mo", pos: "Mid-market", value: 46, you: false },
  { name: "You", price: "$40/mo", pos: "Value", value: 40, you: true },
];

export default function McpGuidePage() {
  return (
    <div className="min-h-screen bg-bg-page px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-[1080px]">
        <header className="mb-9">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-violet">
            <Sparkles size={12} /> Live reference · built from @/components/mcp-kit
          </span>
          <h1 className="mt-3 font-heading text-[30px] font-bold tracking-[-0.6px] text-dark">
            MCP apps in Studio — what they look like
          </h1>
          <p className="mt-1.5 max-w-[680px] text-[14px] leading-[1.6] text-gray-3">
            The same app shown two ways (inline → Canvas), the component kit, and the required
            states — all composed from the real, importable kit. This is the &ldquo;Market Pulse&rdquo;
            example the guide refers to.
          </p>
        </header>

        <Section
          n="1"
          title="Inline result card"
          note="A glanceable result inside the chat thread. ≤ 2 actions, no internal scroll, opens into the Canvas for depth."
        >
          <ChatContext>
            <AppCard mode="inline" className="max-w-[460px]">
              <AppHeader icon={<BarChart3 size={15} />} title="Market Pulse" />
              <AppBody>
                <SectionLabel>3 competitors analyzed</SectionLabel>
                <div className="mt-1 font-sans text-[15px] font-semibold text-dark">
                  You&apos;re priced <span className="text-violet">12% below</span> the segment average.
                </div>
                <div className="mt-2.5 flex gap-2">
                  <Chip>Avg $46/mo</Chip>
                  <Chip>You $40/mo</Chip>
                  <Chip tone="mint">Best value</Chip>
                </div>
              </AppBody>
              <AppFooter>
                <Action size="sm">
                  <Download size={13} /> Export
                </Action>
                <Action size="sm" variant="primary">
                  <Maximize2 size={13} /> Open in Canvas
                </Action>
              </AppFooter>
            </AppCard>
          </ChatContext>
        </Section>

        <Section
          n="2"
          title="Canvas — expanded view"
          note="The same app, opened in the workspace beside chat: room for the full table, a chart, and a primary action."
        >
          <AppCard mode="canvas">
            <AppHeader
              icon={<BarChart3 size={15} />}
              title="Market Pulse"
              actions={
                <>
                  <AppHeaderAction aria-label="Refresh"><RefreshCw size={14} /></AppHeaderAction>
                  <AppHeaderAction aria-label="Export"><Download size={14} /></AppHeaderAction>
                  <AppHeaderAction aria-label="Close"><X size={15} /></AppHeaderAction>
                </>
              }
            />
            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <SectionLabel className="mb-2">Competitor pricing</SectionLabel>
                <DataTable
                  rows={ROWS}
                  highlight={(r) => r.you}
                  columns={[
                    { key: "name", header: "Company" },
                    { key: "price", header: "Price", numeric: true },
                    { key: "pos", header: "Position" },
                  ]}
                />
              </div>
              <div>
                <SectionLabel className="mb-2">Relative price</SectionLabel>
                <BarChart
                  data={ROWS.map((r) => ({ label: r.name, value: r.value, highlight: r.you }))}
                />
                <Action variant="primary" className="mt-5">
                  <Check size={14} /> Add to brief
                </Action>
              </div>
            </div>
          </AppCard>
        </Section>

        <Section
          n="3"
          title="Required states"
          note="Every MCP app defines all of these. Running always shows a tool-execution log — never a blank spinner."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StateDemo label="Running">
              <StateRunning
                label="Querying sources…"
                log={[
                  { text: "fetched 3 sources", done: true },
                  { text: "parsed pricing", done: true },
                  { text: "ranking…" },
                ]}
              />
            </StateDemo>
            <StateDemo label="Loading">
              <StateLoading lines={4} />
            </StateDemo>
            <StateDemo label="Empty">
              <StateEmpty
                title="No competitors yet"
                action={<Action size="sm" variant="primary"><Plus size={12} /> Add one</Action>}
              />
            </StateDemo>
            <StateDemo label="Error">
              <StateError
                title="Couldn't reach a source"
                action={<Action size="sm"><RefreshCw size={12} /> Retry</Action>}
              />
            </StateDemo>
          </div>
        </Section>

        <Section
          n="4"
          title="Component kit"
          note="The building blocks every app composes from — each rendered here from the real kit, so apps share one look."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <KitTile label="Table">
              <DataTable
                rows={ROWS}
                highlight={(r) => r.you}
                columns={[
                  { key: "name", header: "Company" },
                  { key: "price", header: "Price", numeric: true },
                ]}
              />
            </KitTile>
            <KitTile label="Chart">
              <BarChart
                height={120}
                data={ROWS.map((r) => ({ label: r.name, value: r.value, highlight: r.you }))}
              />
            </KitTile>
            <KitTile label="List">
              <List
                items={[
                  { icon: <Building2 size={15} />, title: "Northwind", meta: "Premium · $52/mo", trailing: "+8%" },
                  { icon: <Building2 size={15} />, title: "Acme Co.", meta: "Mid-market · $46/mo", trailing: "+2%" },
                ]}
              />
            </KitTile>
            <KitTile label="Key-value summary">
              <KeyValue
                pairs={[
                  { label: "Segment avg", value: "$46/mo" },
                  { label: "Your price", value: "$40/mo" },
                  { label: "Position", value: "Value" },
                  { label: "Gap", value: "−12%" },
                ]}
              />
            </KitTile>
            <KitTile label="File list">
              <FileList
                files={[
                  { name: "market-pulse-Q2.csv", meta: "CSV · 12 KB", icon: <FileSpreadsheet size={15} />, trailing: <Download size={14} /> },
                  { name: "pricing-brief.pdf", meta: "PDF · 240 KB", trailing: <Download size={14} /> },
                ]}
              />
            </KitTile>
            <KitTile label="Media">
              <Media aspect="16 / 9" caption="Trend snapshot — last 90 days" />
            </KitTile>
            <KitTile label="Map">
              <MapBlock height={150} pins={[{ x: 30, y: 45 }, { x: 62, y: 60 }, { x: 48, y: 30 }]} />
            </KitTile>
            <KitTile label="Form — needs input">
              <Form>
                <Field label="Competitor URL">
                  <Input placeholder="https://acme.co/pricing" />
                </Field>
                <Field label="Refresh cadence">
                  <Select defaultValue="weekly">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </Select>
                </Field>
              </Form>
            </KitTile>
          </div>
        </Section>

        <Section
          n="5"
          title="Theming — inherit, don't reskin"
          note="Left: native, inherits Studio tokens (correct). Right: bespoke colors/fonts/gradient (wrong — breaks the surface)."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Compare good />
            <Compare good={false} />
          </div>
        </Section>

        <footer className="mt-4 flex items-center gap-2 border-t border-border pt-5 text-[12px] text-gray-4">
          <TrendingUp size={13} className="text-violet" />
          Every block above is imported from{" "}
          <code className="rounded bg-bg-input px-1.5 py-0.5 font-sans text-[11.5px] text-gray-2">@/components/mcp-kit</code>
          . See its README for the full API.
        </footer>
      </div>
    </div>
  );
}

/* ── reference-page chrome (not part of the kit) ──────────────────────────── */

function Section({
  n,
  title,
  note,
  children,
}: {
  n: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-11">
      <div className="mb-3.5 flex items-baseline gap-2.5">
        <span className="font-heading text-[13px] font-bold text-violet">{n}</span>
        <h2 className="font-heading text-[18px] font-bold tracking-[-0.3px] text-dark">{title}</h2>
      </div>
      <p className="mb-4 max-w-[760px] text-[12.5px] leading-[1.55] text-gray-3">{note}</p>
      {children}
    </section>
  );
}

// Mimics the Studio chat: twyn avatar + a message, with the app card inside.
function ChatContext({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-white p-5">
      <div className="flex gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-violet text-[12px] font-bold text-white">
          VS
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 text-[12.5px] text-gray-4">
            <span className="font-semibold text-dark">Virtual Bob</span> · just now
          </div>
          <p className="mb-3 max-w-[560px] text-[13.5px] leading-[1.5] text-gray-2">
            I pulled the latest on your three main competitors — here&apos;s the snapshot.
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}

// A labelled box that frames one required state for demonstration. The label
// ("Running"/"Loading"/…) is demo chrome — the state itself is the kit content.
function StateDemo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-white">
      <div className="border-b border-border px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-5">
        {label}
      </div>
      <div className="grid min-h-[140px] place-items-center p-4">{children}</div>
    </div>
  );
}

// A labelled tile framing one kit component for the gallery.
function KitTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-white">
      <div className="border-b border-border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-5">
        {label}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// Theming comparison: native (inherits tokens) vs bespoke (breaks the surface).
function Compare({ good }: { good: boolean }) {
  if (good) {
    return (
      <div className="rounded-card border border-border bg-white">
        <div className="flex items-center gap-1.5 rounded-t-card bg-mint px-4 py-2 text-[12px] font-bold text-mint-text">
          <Check size={14} /> Native — inherits Studio tokens
        </div>
        <div className="p-4">
          <div className="mb-2 h-3 w-1/2 rounded bg-bg-input" />
          <div className="mb-3 h-3 w-3/4 rounded bg-bg-input" />
          <Action variant="primary" size="sm">Primary action</Action>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-card border border-border bg-white">
      <div className="flex items-center gap-1.5 rounded-t-card bg-error/10 px-4 py-2 text-[12px] font-bold text-error">
        <X size={14} /> Bespoke — custom colors, font, gradient
      </div>
      <div className="p-4" style={{ background: "linear-gradient(135deg,#ff7a59,#ffb44d)" }}>
        <div className="mb-2 h-3 w-1/2 rounded bg-white/50" />
        <div className="mb-3 h-3 w-3/4 rounded bg-white/50" />
        <button
          className="rounded-[20px] px-3.5 py-1.5 text-[12.5px] font-black text-white"
          style={{ background: "#0a7", fontFamily: "Georgia, serif" }}
        >
          Primary action
        </button>
      </div>
    </div>
  );
}
