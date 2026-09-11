"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Archive, ArrowLeft, Check, RotateCcw, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CapacityMeter } from "@/features/top-up/components/CapacityMeter";
import { KIND_ORDER, pluralize, type Asset, type AssetKind } from "@/features/top-up/lib/downgrade";
import { useTier } from "@/features/shared/hooks/useTier";
import { useArchive } from "../hooks/useArchive";
import {
  archivedAssets,
  deleteIds,
  headroomFor,
  knowledgeOwnedBy,
  reasonLabel,
  restoreFits,
  restoreIds,
  suggestRestore,
  type ArchiveEntry,
} from "../lib/archive";

/**
 * My Archive — the other half of the capacity model.
 *
 * Make Room and this page are one interaction in two directions: over the cap,
 * pick what leaves; under it, pick what comes back. Same meters, same grouped
 * lists, same language. The only real difference is timing — a downgrade
 * schedules for the period end, restoring applies now, because it crosses no
 * billing boundary and shouldn't wait for a date.
 *
 * Restore mode (`?restore=1`) is arrived at from an upgrade or reactivation and
 * pre-selects a suggestion. Browse mode is the default: what's here, why, and
 * the only path in the product that deletes anything.
 */
export function ArchiveView() {
  const router = useRouter();
  const { tier } = useTier();
  const { entries, ids: archivedIds } = useArchive();
  const restoreMode = useSearchParams().get("restore") === "1";

  const items = useMemo(() => archivedAssets(archivedIds), [archivedIds]);
  const byId = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<Asset | null>(null);

  // Seed the suggestion once the store has synced. Adjusting state during
  // render against a `last` key rather than in an effect — the lint rules here
  // forbid a synchronous setState in an effect body.
  const seedKey = restoreMode ? `${tier.id}:${entries.map((e) => e.id).join(",")}` : "";
  const [lastSeed, setLastSeed] = useState<string | null>(null);
  if (seedKey && lastSeed !== seedKey) {
    setLastSeed(seedKey);
    setSelected(suggestRestore(tier.id, archivedIds));
  }

  const headroom = headroomFor(tier, archivedIds, selected);
  const fits = restoreFits(tier, archivedIds, selected);

  /**
   * Toggling a twyn takes its knowledge packs along, so the meters tell the
   * truth — a restored twyn whose packs stayed archived can't read them.
   */
  const toggle = (asset: Asset) => {
    const group = [asset.id, ...(asset.kind === "twyn" ? knowledgeOwnedBy(asset.id) : [])].filter(
      (id) => archivedIds.has(id),
    );
    setSelected((prev) => {
      const next = new Set(prev);
      const turningOn = !prev.has(asset.id);
      for (const id of group) {
        if (turningOn) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const restoreSelected = () => {
    if (!fits || selected.size === 0) return;
    const n = selected.size;
    restoreIds([...selected]);
    setSelected(new Set());
    setLastSeed(null);
    toast.success(`${pluralize(n, "item")} restored`, {
      description: "They count against your plan again and are ready to use.",
    });
  };

  /** Browse mode: one row at a time, only when there's room for it. */
  const restoreOne = (asset: Asset) => {
    const group = new Set(
      [asset.id, ...(asset.kind === "twyn" ? knowledgeOwnedBy(asset.id) : [])].filter((id) =>
        archivedIds.has(id),
      ),
    );
    if (!restoreFits(tier, archivedIds, group)) return;
    restoreIds([...group]);
    toast.success(`${asset.name} restored`);
  };

  const doDelete = (asset: Asset) => {
    deleteIds([asset.id]);
    setConfirmDelete(null);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(asset.id);
      return next;
    });
    toast.success(`${asset.name} deleted`, { description: "This one couldn't be undone." });
  };

  return (
    <div className="mx-auto max-w-[860px] pb-6">
      <Link
        href={restoreMode ? "/plans" : "/account"}
        className="mb-6 inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-2 hover:border-violet hover:text-violet"
      >
        <ArrowLeft size={13} /> {restoreMode ? "Back to plans" : "Back"}
      </Link>

      <header className="mb-6">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-[-0.6px] text-dark">
          {restoreMode ? `Bring things back on ${tier.name}` : "My Archive"}
        </h1>
        <p className="mt-2 text-pretty text-[13.5px] leading-relaxed text-gray-3">
          {restoreMode ? (
            // One interpolated string rather than {expr} + text: React's SSR
            // separator between the two nodes swallows the space between them.
            `${tier.name} has room for more than you're running. Choose what comes back — anything you leave stays archived and safe.`
          ) : (
            <>
              Things you archived, or that a plan change set aside. They keep their data, stop
              counting against your plan, and come back when there&apos;s room.
            </>
          )}
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <section className="mb-7 grid gap-3 sm:grid-cols-3" aria-label="Room on your plan">
            {headroom.map((b) => (
              <CapacityMeter key={b.kind} budget={b} />
            ))}
          </section>

          {KIND_ORDER.map((kind) => {
            const group = items.filter((a) => a.kind === kind);
            if (group.length === 0) return null;
            return (
              <ArchiveGroup
                key={kind}
                kind={kind}
                items={group}
                entryFor={(id) => byId.get(id)}
                restoreMode={restoreMode}
                selected={selected}
                canRestore={(a) =>
                  restoreFits(
                    tier,
                    archivedIds,
                    new Set(
                      [a.id, ...(a.kind === "twyn" ? knowledgeOwnedBy(a.id) : [])].filter((id) =>
                        archivedIds.has(id),
                      ),
                    ),
                  )
                }
                tierName={tier.name}
                onToggle={toggle}
                onRestore={restoreOne}
                onDelete={setConfirmDelete}
              />
            );
          })}

          {restoreMode && (
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-border pt-5">
              <p className="min-w-0 flex-1 text-[13px] leading-snug" aria-live="polite">
                {selected.size === 0 ? (
                  <span className="text-gray-3">
                    Nothing selected. Everything stays archived until you choose.
                  </span>
                ) : fits ? (
                  <span className="flex items-start gap-1.5 text-gray-2">
                    <Check size={15} className="mt-px shrink-0 text-mint-text" strokeWidth={2.5} />
                    <span>
                      <span className="font-semibold">{pluralize(selected.size, "item")}</span> will
                      be restored now.
                    </span>
                  </span>
                ) : (
                  <span className="flex items-start gap-1.5 font-semibold text-amber-text">
                    <TriangleAlert size={15} className="mt-px shrink-0" />
                    <span>{`That's more than ${tier.name} holds — deselect something.`}</span>
                  </span>
                )}
              </p>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="md" onClick={() => router.push("/plans")}>
                  Not now
                </Button>
                <Button size="md" onClick={restoreSelected} disabled={!fits || selected.size === 0}>
                  Restore {selected.size > 0 ? selected.size : ""}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <DeleteConfirm asset={confirmDelete} onCancel={() => setConfirmDelete(null)} onConfirm={doDelete} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-card border border-border bg-white px-6 py-14 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-bg-input text-gray-4">
        <Archive size={24} strokeWidth={1.8} />
      </span>
      <h2 className="mt-5 font-heading text-[17px] font-bold tracking-[-0.3px] text-dark">
        Nothing archived
      </h2>
      <p className="mx-auto mt-2 max-w-[44ch] text-[13px] leading-relaxed text-gray-4">
        Things you archive — or that a plan change sets aside — wait here. They keep their data
        and never expire.
      </p>
    </div>
  );
}

function ArchiveGroup({
  kind,
  items,
  entryFor,
  restoreMode,
  selected,
  canRestore,
  tierName,
  onToggle,
  onRestore,
  onDelete,
}: {
  kind: AssetKind;
  items: Asset[];
  entryFor: (id: string) => ArchiveEntry | undefined;
  restoreMode: boolean;
  selected: Set<string>;
  canRestore: (a: Asset) => boolean;
  tierName: string;
  onToggle: (a: Asset) => void;
  onRestore: (a: Asset) => void;
  onDelete: (a: Asset) => void;
}) {
  const label = { twyn: "Twyns", knowledge: "Knowledge packs", workflow: "Workflows" }[kind];
  const picked = items.filter((i) => selected.has(i.id)).length;

  return (
    <section className="mb-6" aria-labelledby={`arc-${kind}`}>
      <div className="mb-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h2 id={`arc-${kind}`} className="font-heading text-[15px] font-bold tracking-[-0.2px] text-dark">
          {label}
        </h2>
        <span className="text-[12px] text-gray-4">
          {restoreMode ? `bringing back ${picked} of ${items.length}` : pluralize(items.length, "item")}
        </span>
      </div>

      <ul className="overflow-hidden rounded-[14px] border border-border bg-white">
        {items.map((a) => {
          const entry = entryFor(a.id);
          const isPicked = selected.has(a.id);
          const roomFor = canRestore(a);
          return (
            <li
              key={a.id}
              className={`flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 ${
                restoreMode && isPicked ? "bg-violet-light/60" : ""
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-dark">{a.name}</span>
                <span className="mt-0.5 block truncate text-[12px] text-gray-4">
                  {a.meta}
                  {entry && <> · {reasonLabel(entry)}</>}
                </span>
              </span>

              {restoreMode ? (
                <label className="flex shrink-0 cursor-pointer items-center gap-2.5">
                  <span className={`text-[12px] font-semibold ${isPicked ? "text-violet" : "text-gray-4"}`}>
                    {isPicked ? "Restoring" : "Keep archived"}
                  </span>
                  <input
                    type="checkbox"
                    checked={isPicked}
                    onChange={() => onToggle(a)}
                    aria-label={`Restore ${a.name}`}
                    className="h-[18px] w-[18px] shrink-0 accent-violet"
                  />
                </label>
              ) : (
                <span className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRestore(a)}
                    disabled={!roomFor}
                    title={roomFor ? undefined : `No room on ${tierName} — upgrade, or archive something else.`}
                  >
                    <RotateCcw size={13} /> Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(a)}
                    aria-label={`Delete ${a.name} permanently`}
                    className="text-gray-4 hover:bg-error/10 hover:text-error"
                  >
                    <Trash2 size={14} />
                  </Button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * The only deletion in the whole plan lifecycle, so it says plainly what goes.
 * A twyn takes its knowledge with it — archived packs can't outlive their owner.
 */
function DeleteConfirm({
  asset,
  onCancel,
  onConfirm,
}: {
  asset: Asset | null;
  onCancel: () => void;
  onConfirm: (a: Asset) => void;
}) {
  if (!asset) return null;
  const packs = asset.kind === "twyn" ? knowledgeOwnedBy(asset.id) : [];

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-[420px] gap-0 p-0">
        <DialogHeader className="space-y-1 border-b border-border p-5">
          <DialogTitle className="font-heading text-[17px] font-semibold tracking-[-0.3px] text-dark">
            Delete {asset.name}?
          </DialogTitle>
          <DialogDescription className="text-[12.5px] leading-relaxed text-gray-4">
            This is permanent. Archiving keeps your data — deleting doesn&apos;t.
            {packs.length > 0 && (
              <>
                {" "}
                Its {pluralize(packs.length, "knowledge pack")} will be deleted too.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 p-4">
          <Button variant="outline" size="md" onClick={onCancel}>
            Keep it
          </Button>
          <Button variant="destructive" size="md" onClick={() => onConfirm(asset)}>
            Delete permanently
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
