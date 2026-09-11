import Link from "next/link";
import {
  AlertTriangle, ArrowRight, Check, ExternalLink, Layers, Minus,
  RefreshCw, Shield, Upload, Workflow, X,
} from "lucide-react";

// PO decision surface — where the workflow builder lives, and how work gets
// back. Concept page; not for the design branch. Route: /workflows-compare

export default function Page() {
  return (
    <div className="min-h-screen bg-bg-page px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-[1040px]">
        <header className="mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-violet">
            <Workflow size={12} /> Decision
          </span>
          <h1 className="mt-3 font-heading text-[33px] font-bold leading-[1.08] tracking-[-0.9px] text-dark">
            Where does the workflow builder live?
          </h1>
          <p className="mt-2.5 max-w-[700px] text-[15px] leading-[1.6] text-gray-3">
            We already have a Workflow Builder. The question is whether a user{" "}
            <span className="font-semibold text-dark">leaves Twynity to use it</span>, or
            never notices it&apos;s a separate thing. Three options, all clickable, all
            running the same builder.
          </p>
        </header>

        {/* ── the three options ─────────────────────────────────────────── */}
        <div className="mb-12 grid gap-4 lg:grid-cols-3">
          <Opt
            tag="Option A" title="Native" href="/workflows"
            sub="We rebuild the builder inside Twynity. Our shell, our design system."
            badge="Best experience · highest cost"
            tone="border-border"
            pros={["No context switch at all", "One design system, one login", "Full control of every detail"]}
            cons={["Rebuilds something we already own", "Two builders to maintain forever", "Slowest to ship"]}
          />
          <Opt
            tag="Option C" title="Embedded" href="/workflows/embedded"
            sub="The existing builder, iframed into a Twynity tab and themed to match."
            badge="Recommended"
            tone="border-violet ring-1 ring-violet/20"
            accent
            pros={["Feels native — never leaves the page", "Reuses the builder we already have", "No export, no upload, no second copy"]}
            cons={["Theming and auth plumbing needed", "iframe adds some technical constraints"]}
          />
          <Opt
            tag="Option B" title="Launch out" href="/assets"
            sub="Workshop links to Workflow Builder. It opens in a new browser tab."
            badge="Cheapest · weakest experience"
            tone="border-border"
            pros={["Ships almost immediately", "Zero integration work", "Builder evolves independently"]}
            cons={["User leaves Twynity mid-task", "Different look, different app", "Work must be moved back by hand"]}
          />
        </div>

        {/* ── why the ranking ───────────────────────────────────────────── */}
        <Section title="Why that order — the evidence" n="1">
          <div className="grid gap-3 sm:grid-cols-3">
            <Eviq
              title="New tabs disorient people"
              body="NN/g has given the same advice since 1999: links should open in the same tab. New tabs break the Back button, and users often don't notice the switch — worst for people with attention or memory difficulties."
              src="nngroup.com"
            />
            <Eviq
              title="Context switching is expensive"
              body="Switching tools costs real focus time, and the effect compounds across a day. Every hop out of Twynity and back is a place the user can stall or simply not return."
              src="uxmatters.com"
            />
            <Eviq
              title="Embedding is the industry answer"
              body="Prismatic, Workato, Cyclr, Albato and n8n Embedded exist precisely to put an existing builder inside someone else's product — themed, chrome hidden, host-authenticated."
              src="prismatic.io"
            />
          </div>
          <p className="mt-3 rounded-card border border-border bg-white px-4 py-3 text-[12.5px] leading-[1.55] text-gray-3">
            <span className="font-semibold text-dark">Worth knowing:</span> native-vs-iframe
            is genuinely contested — there are vendors whose whole pitch is
            &ldquo;white-label builders that <em>don&apos;t</em> use iframes.&rdquo; Option C
            is the pragmatic middle, not a free lunch. If the builder ever needs to feel
            truly seamless, Option A is where it ends up.
          </p>
        </Section>

        {/* ── the handoff problem ───────────────────────────────────────── */}
        <Section title="If we launch out: how does the work get back?" n="2">
          <p className="mb-4 max-w-[760px] text-[13.5px] leading-[1.6] text-gray-3">
            This is the part that decides whether Option B is viable. The team&apos;s
            instinct is <span className="font-semibold text-dark">download the workflow,
            then upload it to Twynity</span>. That works once, and then quietly rots.
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            <Transport
              rank="Worst" icon={<Upload size={17} />} title="Download &amp; upload a file"
              tone="border-error/30 bg-error/5"
              points={[
                { ok: false, t: "Two copies from the moment you export — nothing keeps them in step" },
                { ok: false, t: "n8n's own docs: exports omit credentials, so users re-add them by hand" },
                { ok: false, t: "Exported IDs can silently overwrite an existing workflow" },
                { ok: false, t: "Newer schemas fail to import on older versions" },
                { ok: false, t: "No run visibility — a file is a step list, not a live connection" },
              ]}
            />
            <Transport
              rank="Workable" icon={<RefreshCw size={17} />} title="Connect &amp; sync via API"
              tone="border-amber-text/30 bg-amber/30"
              points={[
                { ok: true, t: "Connect the builder account once, then pull the flow list" },
                { ok: true, t: "One source of truth — upstream edits appear here" },
                { ok: true, t: "We already mock exactly this for n8n / Power Automate" },
                { ok: false, t: "Still two apps, still a round trip to author" },
              ]}
            />
            <Transport
              rank="Best" icon={<Shield size={17} />} title="Embed — no transfer at all"
              tone="border-violet bg-violet-light/40"
              points={[
                { ok: true, t: "The builder writes straight to our store" },
                { ok: true, t: "Nothing to export, so nothing can drift" },
                { ok: true, t: "Save event comes back over postMessage" },
                { ok: true, t: "Paid workflows stay run-only — never handed to the user as a file" },
              ]}
            />
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-card border-[1.5px] border-amber-text/35 bg-amber/40 p-4">
            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-text" />
            <p className="text-[13px] leading-[1.55] text-dark">
              <span className="font-semibold">The file approach also contradicts our own monetization plan.</span>{" "}
              The Workflows &amp; Teams brainstorm already concluded that paid workflows must
              be <em>run-only on our runtime</em>, because &ldquo;anything the buyer&apos;s
              runtime can read, the buyer can extract — n8n&apos;s downloadable JSON proves
              zero protection.&rdquo; Shipping a download button hands away the thing we
              planned to sell.
            </p>
          </div>

          <p className="mt-3 text-[13px] leading-[1.6] text-gray-3">
            <span className="font-semibold text-dark">The decisive point:</span> a file tells
            Twynity what the steps <em>are</em>, but the workflow still executes on the
            builder. To run it or show progress we need a live connection anyway — and once
            we have that connection, the file adds nothing except a second copy that drifts.
          </p>
        </Section>

        {/* ── try it ────────────────────────────────────────────────────── */}
        <Section title="Click through all three" n="3">
          <div className="space-y-2.5">
            <Try href="/workflows" label="Option A · Native" note="Workflows tab → Build → the builder opens in our shell." />
            <Try href="/workflows/embedded" label="Option C · Embedded" note="Same builder, iframed and themed. Save syncs instantly — no import step." />
            <Try href="/assets" label="Option B · Launch out" note="Workshop → Open Workflow Builder. New tab, dark, no Twynity nav. Save there, then come back and see the import prompt." />
          </div>
          <p className="mt-4 text-[12.5px] leading-[1.55] text-gray-4">
            All three run the same component — only the frame differs, so the comparison is
            about the frame and not about three different mocks. Anything you save lands in{" "}
            <Link href="/talk/sara" className="font-semibold text-violet">the studio</Link>;
            type <span className="font-sans font-semibold text-gray-2">/</span> to run it.
          </p>
        </Section>
      </div>
    </div>
  );
}

/* ── bits ─────────────────────────────────────────────────────────────── */

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-11">
      <div className="mb-4 flex items-baseline gap-2.5">
        <span className="font-heading text-[13px] font-bold text-violet">{n}</span>
        <h2 className="font-heading text-[21px] font-bold tracking-[-0.45px] text-dark">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Opt({ tag, title, sub, href, badge, tone, pros, cons, accent }: {
  tag: string; title: string; sub: string; href: string; badge: string;
  tone: string; pros: string[]; cons: string[]; accent?: boolean;
}) {
  return (
    <article className={`flex flex-col rounded-card border-[1.5px] bg-white p-5 ${tone}`}>
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-5">{tag}</span>
      <h3 className="mt-0.5 font-heading text-[20px] font-bold tracking-[-0.45px] text-dark">{title}</h3>
      <span className={`mt-2 inline-flex w-fit rounded-full px-2.5 py-1 text-[10.5px] font-bold ${accent ? "bg-violet text-white" : "bg-bg-input text-gray-4"}`}>
        {badge}
      </span>
      <p className="mt-2.5 text-[13px] leading-[1.5] text-gray-3">{sub}</p>
      <div className="mt-3.5 flex-1 space-y-1.5">
        {pros.map((p) => (
          <div key={p} className="flex items-start gap-2 text-[12.5px] leading-[1.45] text-gray-2">
            <Check size={13} className="mt-0.5 shrink-0 text-mint-text" /> {p}
          </div>
        ))}
        {cons.map((c) => (
          <div key={c} className="flex items-start gap-2 text-[12.5px] leading-[1.45] text-gray-4">
            <Minus size={13} className="mt-0.5 shrink-0 text-gray-5" /> {c}
          </div>
        ))}
      </div>
      <Link href={href} className={`mt-4 inline-flex items-center justify-center gap-2 rounded-btn px-4 py-2.5 text-[13px] font-bold ${accent ? "bg-violet text-white hover:bg-violet-h" : "border border-border bg-white text-gray-2 hover:border-violet hover:text-violet"}`}>
        Open {title} <ArrowRight size={14} />
      </Link>
    </article>
  );
}

function Eviq({ title, body, src }: { title: string; body: string; src: string }) {
  return (
    <div className="rounded-card border border-border bg-white p-4">
      <h3 className="font-heading text-[13.5px] font-bold tracking-[-0.2px] text-dark">{title}</h3>
      <p className="mt-1.5 text-[12.5px] leading-[1.5] text-gray-3">{body}</p>
      <span className="mt-2 inline-block font-sans text-[11px] text-gray-5">{src}</span>
    </div>
  );
}

function Transport({ rank, icon, title, tone, points }: {
  rank: string; icon: React.ReactNode; title: string; tone: string;
  points: { ok: boolean; t: string }[];
}) {
  return (
    <div className={`rounded-card border-[1.5px] p-4 ${tone}`}>
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-white text-gray-2">{icon}</span>
        <div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-gray-5">{rank}</div>
          <h3 className="font-heading text-[14px] font-bold tracking-[-0.2px] text-dark">{title}</h3>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {points.map((p) => (
          <div key={p.t} className="flex items-start gap-2 text-[12px] leading-[1.45] text-gray-2">
            {p.ok
              ? <Check size={13} className="mt-0.5 shrink-0 text-mint-text" />
              : <X size={13} className="mt-0.5 shrink-0 text-error" />}
            {p.t}
          </div>
        ))}
      </div>
    </div>
  );
}

function Try({ href, label, note }: { href: string; label: string; note: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-card border border-border bg-white p-4 transition-colors hover:border-violet-mid">
      <Layers size={17} className="shrink-0 text-violet" />
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-[14px] font-bold text-dark">{label}</span>
        <span className="block text-[12.5px] leading-[1.45] text-gray-4">{note}</span>
      </span>
      <ExternalLink size={15} className="shrink-0 text-gray-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
