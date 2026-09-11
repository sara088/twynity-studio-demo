"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Info, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CapacityMeter } from "./CapacityMeter";
import { TIERS, clearTierPreview, type TierId } from "@/features/shared/lib/tier";
import { activeAssets } from "@/features/archive/lib/archive";
import {
  budgetsFor,
  KIND_ORDER,
  overAmount,
  overLabel,
  PERIOD_END_LABEL,
  pluralize,
  resolveSelection,
  scheduleDowngrade,
  selectionSatisfies,
  type Asset,
  type AssetKind,
  type Budget,
  type Decision,
} from "../lib/downgrade";

// Scenario 2 + 3: the downgrade is paused here until the workspace fits.
//
// A downgrade can breach several categories at once (twyns by count, knowledge
// by storage, workflows by count), so each gets its own budget and ALL must be
// satisfied before the switch can be scheduled. We open with a suggested
// selection so the user has something to accept rather than a blank form.
export function DowngradeSelection({ to }: { to: TierId }) {
  const router = useRouter();
  const target = TIERS[to];
  // Active assets only — budgeting the raw catalog would count already
  // archived items against the cap a second time.
  const assets = useMemo(() => activeAssets(), []);

  // Only what the user has explicitly chosen lives in state; everything else is
  // derived, so the system can rebalance around their choices.
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [done, setDone] = useState(false);

  const { archived, auto } = resolveSelection(assets, target, decisions);
  const budgets = budgetsFor(assets, target, archived);
  const fits = selectionSatisfies(assets, target, archived);
  const archivedCount = archived.size;

  const decide = (id: string, d: Decision) => setDecisions((prev) => ({ ...prev, [id]: d }));

  const submit = () => {
    if (!fits) return;
    scheduleDowngrade(to, [...archived]);
    // The ?tier= preview would otherwise keep overriding the stored plan on the
    // way back, so the scheduled switch would look like it came from nowhere.
    clearTierPreview();
    setDone(true);
  };

  if (done) {
    return (
      <Confirmation
        target={target.name}
        archivedCount={archivedCount}
        onDone={() => router.push("/plans")}
      />
    );
  }

  return (
    // pb clears the sticky action bar so the last row is never hidden behind it.
    <div className="mx-auto max-w-[860px] pb-6">
      <Link
        href="/plans"
        className="mb-6 inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-2 hover:border-violet hover:text-violet"
      >
        <ArrowLeft size={13} /> Back to plans
      </Link>

      <header className="mb-6">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-[-0.6px] text-dark">
          Make room for {target.name}
        </h1>
        {/* Full width, matching the panel below — a narrower measure here read
            as a mistake beside it, and stranded the last word on its own line. */}
        <p className="mt-2 text-pretty text-[13.5px] leading-relaxed text-gray-3">
          {target.name} holds less than your current plan, so choose what stays active. Your plan
          changes on <span className="font-semibold text-gray-2">{PERIOD_END_LABEL}</span>; nothing
          is archived before then.
        </p>
      </header>

      <div className="mb-6 flex items-start gap-2.5 rounded-[14px] border border-border bg-violet-light px-4 py-3">
        <Info size={15} className="mt-0.5 shrink-0 text-violet" />
        <p className="text-[12.5px] leading-relaxed text-gray-2">
          We&apos;ve picked the oldest items to archive — marked{" "}
          <span className="rounded-chip bg-white px-1.5 text-[10.5px] font-semibold text-gray-3">
            auto
          </span>
          . Keep any of them and something else is archived in its place. Archiving keeps your data:
          archived items stop counting against your plan and come back if you move up again —
          nothing is deleted.
        </p>
      </div>

      {/* Budget meters — one per category, all must be green */}
      <section className="mb-7 grid gap-3 sm:grid-cols-3" aria-label="Capacity">
        {budgets.map((b) => (
          <CapacityMeter key={b.kind} budget={b} />
        ))}
      </section>

      {/* Asset lists — last group gets clearance for the sticky bar below */}
      {KIND_ORDER.map((kind) => {
        const items = assets.filter((a) => a.kind === kind);
        if (items.length === 0) return null;
        const budget = budgets.find((b) => b.kind === kind)!;
        return (
          <AssetGroup
            key={kind}
            kind={kind}
            budget={budget}
            items={items}
            archived={archived}
            auto={auto}
            onDecide={decide}
          />
        );
      })}

      {/* Sits at the end of the page, in flow. This is a review-then-confirm
          step — you're meant to read down the lists and act at the bottom, and
          a floating bar over the content only got in the way of that. */}
      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-border pt-5">
        <p className="min-w-0 flex-1 text-[13px] leading-snug" aria-live="polite">
          {fits ? (
            <span className="flex items-start gap-1.5 text-gray-2">
              <Check size={15} className="mt-px shrink-0 text-mint-text" strokeWidth={2.5} />
              <span>
                {archivedCount > 0 ? (
                  <>
                    Everything fits {target.name}.{" "}
                    <span className="font-semibold">{pluralize(archivedCount, "item")}</span> will be
                    archived on {PERIOD_END_LABEL}.
                  </>
                ) : (
                  <>Everything fits {target.name}. Nothing will be archived.</>
                )}
              </span>
            </span>
          ) : (
            <span className="flex items-start gap-1.5 font-semibold text-amber-text">
              <TriangleAlert size={15} className="mt-px shrink-0" />
              <span>Archive {overSummary(budgets)} to continue.</span>
            </span>
          )}
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="md" onClick={() => router.push("/plans")}>
            Cancel
          </Button>
          <Button size="md" onClick={submit} disabled={!fits}>
            Schedule downgrade
          </Button>
        </div>
      </div>
    </div>
  );
}

function overSummary(budgets: Budget[]): string {
  const parts = budgets.filter((b) => b.over > 0).map(overLabel);
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * The platform's own switch: on = the asset stays active, off = it's archived.
 * A switch already means active/inactive, so the state needs no extra chrome —
 * the word beside it is a plain label, deliberately not a pill, after a chip
 * that only looked pressable caused exactly that confusion.
 */
function KeepArchive({
  asset,
  archived,
  onDecide,
}: {
  asset: Asset;
  archived: boolean;
  onDecide: (id: string, d: Decision) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2.5">
      <span
        className={`w-[52px] text-right text-[12px] font-semibold ${
          archived ? "text-gray-4" : "text-gray-2"
        }`}
      >
        {archived ? "Archived" : "Active"}
      </span>
      <Switch
        checked={!archived}
        onCheckedChange={(on) => onDecide(asset.id, on ? "keep" : "archive")}
        aria-label={`Keep ${asset.name} active`}
      />
    </div>
  );
}

function AssetGroup({
  kind,
  budget,
  items,
  archived,
  auto,
  onDecide,
}: {
  kind: AssetKind;
  budget: Budget;
  items: Asset[];
  archived: Set<string>;
  auto: Set<string>;
  onDecide: (id: string, d: Decision) => void;
}) {
  const keptCount = items.filter((i) => !archived.has(i.id)).length;
  const isAuto = (id: string) => auto.has(id);

  return (
    <section className="mb-6" aria-labelledby={`h-${kind}`}>
      <div className="mb-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h2 id={`h-${kind}`} className="font-heading text-[15px] font-bold tracking-[-0.2px] text-dark">
          {budget.label}
        </h2>
        <span className="text-[12px] text-gray-4">
          keeping {keptCount} of {items.length}
        </span>
        {/* Tell them what to do, not just that something's wrong. */}
        {budget.over > 0 && (
          <span className="rounded-chip bg-amber px-2 py-0.5 text-[11px] font-bold text-amber-text">
            Archive {overAmount(budget)} more
          </span>
        )}
      </div>

      <ul className="overflow-hidden rounded-[14px] border border-border bg-white">
        {items.map((a) => {
          const isArchived = archived.has(a.id);
          return (
            <li
              key={a.id}
              className={`flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 ${
                isArchived ? "bg-bg-input/50" : ""
              }`}
            >
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-[13.5px] font-semibold ${
                    isArchived ? "text-gray-4 line-through" : "text-dark"
                  }`}
                >
                  {a.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-gray-4">
                  {a.meta}
                  {/* Explains a row the user didn't touch turning up crossed out. */}
                  {isAuto(a.id) && (
                    <span className="shrink-0 rounded-chip bg-bg-input px-1.5 text-[10.5px] font-semibold text-gray-4">
                      auto
                    </span>
                  )}
                </span>
              </span>

              <KeepArchive asset={a} archived={isArchived} onDecide={onDecide} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Confirmation({
  target,
  archivedCount,
  onDone,
}: {
  target: string;
  archivedCount: number;
  onDone: () => void;
}) {
  return (
    <div className="mx-auto max-w-[520px] pt-10 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mint text-mint-text">
        <Check size={26} strokeWidth={2.5} />
      </span>
      <h1 className="mt-5 font-heading text-[24px] font-bold tracking-[-0.5px] text-dark">
        Downgrade to {target} scheduled
      </h1>
      <p className="mx-auto mt-2.5 max-w-[46ch] text-[13.5px] leading-relaxed text-gray-3">
        Your plan changes on {PERIOD_END_LABEL}. Until then nothing changes — you keep every asset
        and your current plan&apos;s limits.
        {archivedCount > 0 && (
          <>
            {" "}
            On that date, {archivedCount} item{archivedCount === 1 ? "" : "s"} will be archived. You
            can restore {archivedCount === 1 ? "it" : "them"} any time by moving back up.
          </>
        )}
      </p>
      <Button className="mt-6" size="md" onClick={onDone}>
        Back to plans
      </Button>
    </div>
  );
}
