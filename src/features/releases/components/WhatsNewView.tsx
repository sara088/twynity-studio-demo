import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Mic,
  Video,
  Check,
  Gauge,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, type Highlight, type HighlightVisual, type Release } from "../data/releases";

// Curated, marketing-quality page for a featured release: a hero, then
// alternating highlight sections (copy + a token-built product mock), then a
// small "Also in this update" grid and a link to the full changelog.
export function WhatsNewView({ release }: { release: Release }) {
  // The smaller items go in the grid; the big themes are the highlights above.
  const also = release.changes.filter((c) => c.type !== "new").slice(0, 3);

  return (
    <>
      {/* Hero */}
      <header className="mx-auto max-w-[760px] pt-4 text-center">
        <div className="font-sans text-[13px] font-medium tracking-[0.02em] text-gray-4">
          {release.label}
        </div>
        <h1 className="mt-3 font-heading text-[40px] font-bold leading-[1.05] tracking-[-1px] text-dark sm:text-[56px]">
          {release.title}
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.6] text-gray-3">
          {release.summary}
        </p>
      </header>

      {/* Highlights */}
      <div className="mt-24 space-y-24 sm:mt-32 sm:space-y-32">
        {release.highlights.map((h, i) => (
          <HighlightSection key={h.heading} highlight={h} flip={i % 2 === 1} />
        ))}
      </div>

      {/* Also in this update */}
      {also.length > 0 && (
        <section className="mt-28 border-t border-border pt-12">
          <h2 className="font-heading text-[22px] font-bold tracking-[-0.4px] text-dark">
            Also in this update.
          </h2>
          <div className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-3">
            {also.map((c) => (
              <div key={c.text} className="border-t border-border pt-5 sm:border-t-0 sm:pt-0">
                <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-5">
                  {c.type === "improved" ? "Improved" : c.type === "fixed" ? "Fixed" : "New"}
                </div>
                <p className="text-[13.5px] leading-[1.55] text-gray-3">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Try-it CTA — the release page's next step. */}
      <section className="mt-24 rounded-card border border-border bg-white/70 px-8 py-12 text-center">
        <h2 className="font-heading text-[26px] font-bold tracking-[-0.5px] text-dark">
          Ready to try it?
        </h2>
        <p className="mx-auto mt-3 max-w-[400px] text-[14.5px] leading-[1.6] text-gray-3">
          Start free for 15 days — your twyn talks in your voice from day one.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-flex items-center gap-1.5 rounded-btn bg-violet px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-violet-h"
        >
          Create your twyn <ArrowRight size={15} strokeWidth={2.5} />
        </Link>
      </section>

      {/* Footer line */}
      <div className="mt-16 flex items-center justify-between border-t border-border pt-6 text-[13px] text-gray-4">
        <span className="font-sans">{formatDate(release.date)}</span>
        <Link
          href={`/changelog#${release.slug}`}
          className="inline-flex items-center gap-1 font-semibold text-violet hover:text-violet-h"
        >
          Full changelog <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    </>
  );
}

function HighlightSection({ highlight, flip }: { highlight: Highlight; flip: boolean }) {
  return (
    <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div className={cn(flip && "lg:order-2")}>
        <h2 className="font-heading text-[26px] font-bold leading-[1.15] tracking-[-0.5px] text-dark sm:text-[30px]">
          {highlight.heading}
        </h2>
        <p className="mt-4 max-w-[440px] text-[15px] leading-[1.6] text-gray-3">{highlight.body}</p>
      </div>
      <div className={cn(flip && "lg:order-1")}>
        <HighlightVisualCard visual={highlight.visual} />
      </div>
    </section>
  );
}

// ─── Token-built product mocks (no image assets) ────────────────────────────

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-white p-6 shadow-[0_12px_40px_rgba(15,15,30,0.06)]">
      {children}
    </div>
  );
}

function HighlightVisualCard({ visual }: { visual: HighlightVisual }) {
  switch (visual) {
    case "modes":
      return (
        <Frame>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-5">Start a twyn</div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex flex-1 items-center overflow-hidden rounded-btn bg-violet">
              {[MessageSquare, Mic, Video].map((Icon, i) => (
                <div key={i} className="flex flex-1 items-center justify-center py-3 text-white">
                  <Icon size={17} strokeWidth={2} />
                </div>
              ))}
            </div>
            <div className="rounded-btn border border-border px-4 py-3 text-[12.5px] font-semibold text-gray-3">Edit</div>
          </div>
          <div className="mt-3 flex justify-between text-[11px] font-medium text-gray-4">
            <span>Chat</span>
            <span>Voice</span>
            <span>Video</span>
          </div>
        </Frame>
      );
    case "upgrade":
    case "capture":
      return (
        <Frame>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-5">Make it your own</div>
          <ul className="mt-4 space-y-2.5">
            {["Consent clip", "Training video"].map((s) => (
              <li key={s} className="flex items-center gap-3 rounded-input border border-border bg-bg-input/40 px-3.5 py-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-mint text-mint-text">
                  <Check size={13} strokeWidth={2.6} />
                </span>
                <span className="text-[13px] font-semibold text-dark">{s}</span>
                <span className="ml-auto text-[11px] font-medium text-gray-4">Ready</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-2 text-[12px] font-semibold text-gray-4">
            <span className="rounded-full bg-violet-light px-2.5 py-1 text-violet">Choose a plan</span>
            <ArrowRight size={13} />
            <span className="rounded-full bg-dark px-2.5 py-1 text-white">Stripe</span>
          </div>
        </Frame>
      );
    case "limits":
      return (
        <Frame>
          <div className="rounded-[10px] border-[1.5px] border-error/35 bg-bg-input/40 px-4 py-3.5">
            <div className="font-heading text-[9.5px] font-bold uppercase tracking-[0.14em] text-gray-5">
              Credits · this month
            </div>
            <div className="mt-1 font-sans text-[20px] font-bold leading-none tabular-nums text-dark">
              100<span className="font-medium text-gray-4">/100</span>
            </div>
            <div className="mt-2.5 h-[6px] overflow-hidden rounded-full bg-border">
              <div className="h-full w-full rounded-full bg-error" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 font-semibold text-error">
                <Gauge size={12} /> Out of credits
              </span>
              <span className="font-bold text-violet">Upgrade</span>
            </div>
          </div>
        </Frame>
      );
    case "plans":
      return (
        <Frame>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { name: "Basic", icon: null },
              { name: "Standard", icon: null, on: true },
              { name: "Pro", icon: null },
              { name: "Enterprise", icon: Building2 },
            ].map((p) => (
              <div
                key={p.name}
                className={cn(
                  "rounded-input border-[1.5px] px-3 py-3",
                  p.on ? "border-violet bg-violet-light/30" : "border-border",
                )}
              >
                <div className="flex items-center gap-1.5">
                  {p.icon && <p.icon size={13} className="text-gray-4" />}
                  <span className="text-[13px] font-bold text-dark">{p.name}</span>
                </div>
                <div className="mt-2 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={cn("h-1 w-full rounded-full", p.on ? "bg-violet/40" : "bg-border")} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-gray-4">
            <ShieldCheck size={13} className="text-gray-4" /> Teams & Enterprise available
          </div>
        </Frame>
      );
  }
}
