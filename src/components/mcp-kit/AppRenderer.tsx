"use client";

// ─────────────────────────────────────────────────────────────────────────
// AppRenderer — draws an MCP app from its descriptor, not from code.
//
// It knows block types (board, figures, fields, criteria, notice, draft). It
// knows nothing about deals, leads, gates or sales — point a descriptor at
// Azure work items and the same board draws sprint work.
//
// Interaction is split the way the MCP Apps spec splits it:
//   • view-only state (which field the board groups by) is handled here;
//   • anything that changes real data leaves as an *intent* for the host.
// So this file performs no mutations and imports no store.
// ─────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { AlertCircle, ArrowUp, Check, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  ActionSpec, AppDescriptor, Block, CardSpec, FieldSpec, FigureSpec, Intent,
} from "@/features/talk/data/mcp-apps";

type Data = Record<string, unknown>;
type Row = Record<string, unknown>;
type Emit = (intent: Intent) => void;

// ── Binding resolution ──────────────────────────────────────────────────
function readPath(path: string, source: Data | Row): unknown {
  return path
    .replace(/^\$\./, "")
    .split(".")
    .reduce<unknown>(
      (acc, key) => (acc && typeof acc === "object" ? (acc as Data)[key] : undefined),
      source
    );
}

function resolve(binding: string | undefined, data: Data, row?: Row): string {
  if (!binding) return "";
  if (binding.startsWith("$.")) {
    const v = readPath(binding, data);
    return v == null ? "" : String(v);
  }
  return binding.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const v = readPath(key, row ?? data) ?? readPath(key, data);
    return v == null ? "" : String(v);
  });
}

/**
 * Fill an intent's bindings against the current data before it leaves.
 * Both "open" and "tool" carry a `deal`, so both need resolving — passing
 * "$.topFlagId" through as a literal silently opens the wrong record.
 */
function bindIntent(intent: Intent, data: Data, value?: string): Intent {
  if (intent.kind === "rebind") return intent;
  const deal = intent.deal ? resolve(intent.deal, data) || undefined : undefined;
  if (intent.kind === "open") return { ...intent, deal };
  return {
    ...intent,
    deal,
    value: value ?? (intent.value ? resolve(intent.value, data) : undefined),
  };
}

const money = (n: number) =>
  n >= 1000 && n % 1000 === 0 && n < 1_000_000
    ? `$${(n / 1000).toLocaleString("en-US")}K`
    : `$${n.toLocaleString("en-US")}`;

function format(value: unknown, kind?: string): string | null {
  if (value == null || value === "") return null;
  if (kind === "currency.usd" && typeof value === "number") return money(value);
  return String(value);
}

const truthy = (data: Data, key?: string) => (key ? !!readPath(key, data) : true);

// ── Shared controls ─────────────────────────────────────────────────────
function Button({
  spec, data, emit, size = "md",
}: {
  spec: ActionSpec;
  data: Data;
  emit: Emit;
  size?: "sm" | "md";
}) {
  const disabled = spec.enabledWhen ? !truthy(data, spec.enabledWhen) : false;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => spec.do && emit(bindIntent(spec.do, data))}
      className={cn(
        "rounded-full border font-semibold transition-colors",
        size === "sm" ? "px-3 py-1.5 text-[11.5px]" : "px-4 py-2 text-[12.5px]",
        spec.primary
          ? "border-violet bg-violet text-white hover:bg-violet-h"
          : "border-border-default bg-white text-gray-2 hover:bg-bg-input hover:text-dark",
        disabled && "cursor-not-allowed opacity-45 hover:bg-violet"
      )}
    >
      {resolve(spec.label, data)}
    </button>
  );
}

// ── Blocks ──────────────────────────────────────────────────────────────
function Figures({ items, data }: { items: FigureSpec[]; data: Data }) {
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[12px] border border-border-default bg-border-default">
      {items.map((f) => {
        const raw = readPath(f.value, data);
        const warn = !!f.warnWhenSet && Number(raw) > 0;
        return (
          <div key={f.label} className="bg-white px-4 py-3">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-gray-4">
              {f.label}
            </div>
            <div
              className={cn(
                "mt-1 font-sans text-[22px] font-bold leading-tight tracking-[-0.02em] tabular-nums",
                warn ? "text-amber-text" : "text-dark"
              )}
            >
              {format(raw, f.format) ?? "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Notice({
  tone, text, actions, data, emit,
}: {
  tone: "good" | "warn";
  text: string;
  actions?: ActionSpec[];
  data: Data;
  emit: Emit;
}) {
  const warn = tone === "warn";
  const Icon = warn ? AlertCircle : Info;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[12px] px-4 py-3 text-[13px] leading-relaxed",
        warn ? "bg-amber text-amber-text" : "bg-violet-light text-violet-h"
      )}
    >
      <Icon size={15} className="mt-0.5 shrink-0" aria-hidden />
      <div>
        <span>{text}</span>
        {actions && actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((a) => (
              <Button key={a.label} spec={a} data={data} emit={emit} size="sm" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Draft({ label, body, meta }: { label: string; body: string; meta?: string }) {
  return (
    <div className="rounded-[12px] border border-violet-mid bg-violet-light p-4">
      <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-violet">
        {label}
      </div>
      <p className="text-[13.5px] leading-relaxed text-gray-2">{body}</p>
      {meta && <p className="mt-2 text-[11.5px] text-gray-4">{meta}</p>}
    </div>
  );
}

function Fields({
  label, tone, items, data, emit,
}: {
  label?: string;
  tone?: string;
  items: FieldSpec[];
  data: Data;
  emit: Emit;
}) {
  return (
    <div>
      {label && (
        <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-gray-4">
          {resolve(label, data)}
        </div>
      )}
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[12px] border border-border-default bg-border-default sm:grid-cols-2">
        {items.map((f) => {
          const value = resolve(f.value, data);
          const needsChoice = !!f.choose && !value;
          const options = (f.choose ? readPath(f.choose.from, data) : null) as
            | string[]
            | null;
          return (
            <div
              key={f.label}
              className={cn("px-4 py-3", needsChoice ? "bg-[#fffdf6]" : "bg-white")}
            >
              <label
                htmlFor={needsChoice ? `fld-${f.label}` : undefined}
                className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.04em] text-gray-4"
              >
                {f.label}
                {f.required && <span className="text-error">*</span>}
              </label>
              {needsChoice ? (
                <select
                  id={`fld-${f.label}`}
                  defaultValue=""
                  onChange={(e) =>
                    f.choose &&
                    e.target.value &&
                    emit(bindIntent(f.choose.op, data, e.target.value))
                  }
                  className="mt-1.5 w-full rounded-[10px] border border-border-default bg-bg-input px-3 py-2 text-[13px] text-gray-2 outline-none focus-visible:border-violet"
                >
                  <option value="" disabled>
                    {f.choose?.placeholder}
                  </option>
                  {(options ?? []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={cn("mt-1 text-[13.5px]", value ? "text-dark" : "text-gray-5")}>
                  {value || (f.optional ? "Not set — optional" : "—")}
                </div>
              )}
              {f.source && (
                <div
                  className={cn(
                    "mt-1 text-[11px]",
                    tone === "inferred" ? "text-amber-text" : "text-violet"
                  )}
                >
                  {resolve(f.source, data)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface Criterion {
  id: string;
  label: string;
  value?: string;
  state: "done" | "drafted" | "todo";
  source?: string;
  tag: string;
  humanOnly?: boolean;
}

function Criteria({
  label, rows, action, data, emit,
}: {
  label?: string;
  rows: Criterion[];
  action?: ActionSpec;
  data: Data;
  emit: Emit;
}) {
  return (
    <div>
      {label && (
        <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-gray-4">
          {resolve(label, data)}
        </div>
      )}
      <div className="flex flex-col gap-px overflow-hidden rounded-[12px] border border-border-default bg-border-default">
        {rows.map((c) => {
          const done = c.state === "done";
          return (
            <div
              key={c.id}
              className={cn(
                "flex items-start gap-3 px-4 py-3",
                done ? "bg-white" : "bg-[#fffdf6]"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full",
                  done ? "bg-mint text-mint-text" : "bg-amber text-amber-text"
                )}
              >
                {done ? (
                  <Check size={11} strokeWidth={3.5} aria-hidden />
                ) : (
                  <AlertCircle size={11} strokeWidth={3} aria-hidden />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-dark">{c.label}</span>
                {c.value && (
                  <span className="mt-0.5 block text-[13px] text-gray-3">{c.value}</span>
                )}
                {c.source && (
                  <span className="mt-1 block text-[11px] text-violet">{c.source}</span>
                )}
                {c.humanOnly && c.state === "todo" && action && (
                  <span className="mt-2 block">
                    <Button spec={action} data={data} emit={emit} size="sm" />
                  </span>
                )}
              </span>
              <span className="shrink-0 text-[11px] font-semibold text-gray-4">{c.tag}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Board ───────────────────────────────────────────────────────────────
// Group by a fixed-choice field, rank by a number, flag rows past a threshold.

function BoardCard({
  row, card, flagged, flagChip, data, onClick,
}: {
  row: Row;
  card: CardSpec;
  flagged: boolean;
  flagChip: string | null;
  data: Data;
  onClick?: () => void;
}) {
  const value = card.value ? format(row[card.value.field], card.value.format) : null;
  const body = (
    <>
      <span className="text-[12px] font-semibold leading-snug text-dark">
        {resolve(card.title, data, row)}
      </span>
      <span className="text-[11px] text-gray-4">{resolve(card.subtitle, data, row)}</span>
      <span
        className={cn(
          "font-sans tabular-nums",
          value
            ? "text-[15px] font-bold tracking-[-0.01em] text-dark"
            : "text-[12.5px] text-gray-5"
        )}
      >
        {value ?? card.value?.emptyLabel ?? "—"}
      </span>
      <span className="flex flex-wrap items-center gap-1.5">
        {(card.chips ?? []).map((chip, i) => (
          <span
            key={i}
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              i === 0 ? "bg-violet-mid text-violet-h" : "bg-bg-page text-gray-3"
            )}
          >
            {resolve(chip, data, row)}
          </span>
        ))}
        {flagChip && (
          <span className="rounded-full bg-amber px-1.5 py-0.5 text-[10px] font-semibold text-amber-text">
            {flagChip}
          </span>
        )}
      </span>
    </>
  );

  const shell = cn(
    "flex w-full flex-col gap-1.5 rounded-[12px] border p-3 text-left transition-colors",
    flagged ? "border-amber-text/40 bg-[#fffdf6]" : "border-border-default bg-white"
  );

  return onClick ? (
    <button type="button" onClick={onClick} className={cn(shell, "hover:border-violet")}>
      {body}
    </button>
  ) : (
    <div className={shell}>{body}</div>
  );
}

function Board({
  block, data, emit, groupBy,
}: {
  block: Extract<Block, { type: "board" }>;
  data: Data;
  emit: Emit;
  groupBy: string;
}) {
  const rows = (readPath(block.data, data) as Row[]) ?? [];
  const dir = block.rankBy.direction === "asc" ? 1 : -1;
  const columns = block.columnSets[groupBy] ?? block.columnSets[block.groupBy];

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-[11px] text-gray-4">
        <ArrowUp size={12} aria-hidden />
        Grouped by {groupBy} · ranked by {block.rankBy.field} · amber = past limit
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-2">
          {columns.map((col) => {
            const inCol = rows
              .filter((r) => r[groupBy] === col.value)
              .sort(
                (a, b) =>
                  dir *
                  (Number(a[block.rankBy.field] ?? 0) - Number(b[block.rankBy.field] ?? 0))
              );
            const sum = inCol.reduce((n, r) => n + Number(r[block.rankBy.field] ?? 0), 0);
            const hot = inCol.some(
              (r) =>
                block.flag &&
                Number(r[block.flag.field]) > Number(r[block.flag.overField])
            );
            return (
              <div key={col.value} className="flex w-[168px] flex-col gap-2">
                <div
                  className={cn(
                    "border-b-2 px-1 pb-2",
                    hot ? "border-amber-text" : "border-border-default"
                  )}
                >
                  <div className="text-[12px] font-bold leading-snug text-dark">
                    {col.label}
                  </div>
                  <div className="mt-0.5 font-sans text-[11px] tabular-nums text-gray-4">
                    {inCol.length} · {sum ? money(sum) : "—"} · {resolve(col.meta, data)}
                  </div>
                </div>
                <div className="flex min-h-[96px] flex-col gap-2">
                  {inCol.length === 0 ? (
                    <div className="rounded-[12px] border border-dashed border-border-default px-3 py-4 text-center text-[11px] text-gray-5">
                      {block.emptyLabel ?? "Empty"}
                    </div>
                  ) : (
                    inCol.map((row) => {
                      const flagged =
                        !!block.flag &&
                        Number(row[block.flag.field]) > Number(row[block.flag.overField]);
                      const click = block.onCardClick;
                      return (
                        <BoardCard
                          key={String(row.id)}
                          row={row}
                          card={block.card}
                          flagged={flagged}
                          flagChip={
                            flagged && block.flag
                              ? resolve(block.flag.chip, data, row)
                              : null
                          }
                          data={data}
                          onClick={
                            click
                              ? () =>
                                  emit(
                                    click.kind === "open"
                                      ? { ...click, deal: String(row.id) }
                                      : click
                                  )
                              : undefined
                          }
                        />
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── The walker ──────────────────────────────────────────────────────────
function BlockList({
  blocks, data, emit, groupBy,
}: {
  blocks: Block[];
  data: Data;
  emit: Emit;
  groupBy: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      {blocks
        .filter((b) => truthy(data, b.when))
        .map((block, i) => {
          switch (block.type) {
            case "figures":
              return <Figures key={i} items={block.items} data={data} />;
            case "board":
              return (
                <Board
                  key={i}
                  block={block}
                  data={data}
                  emit={emit}
                  groupBy={groupBy ?? block.groupBy}
                />
              );
            case "fields":
              return (
                <Fields key={i} label={block.label} tone={block.tone} items={block.items}
                  data={data} emit={emit} />
              );
            case "criteria":
              return (
                <Criteria
                  key={i}
                  label={block.label}
                  rows={(readPath(block.data, data) as Criterion[]) ?? []}
                  action={block.action}
                  data={data}
                  emit={emit}
                />
              );
            case "notice":
              return (
                <Notice key={i} tone={block.tone} text={resolve(block.text, data)}
                  actions={block.actions} data={data} emit={emit} />
              );
            case "draft":
              return (
                <Draft key={i} label={block.label} body={resolve(block.body, data)}
                  meta={resolve(block.meta, data)} />
              );
            default:
              return null;
          }
        })}
    </div>
  );
}

/**
 * The Canvas body for an app. Owns only view state (the board's grouping);
 * everything else is handed to the host as an intent.
 */
export function AppCanvas({
  app, data, onIntent,
}: {
  app: AppDescriptor;
  data: Data;
  onIntent: Emit;
}) {
  const [groupBy, setGroupBy] = useState<string | null>(null);

  const emit: Emit = (intent) => {
    if (intent.kind === "rebind") {
      setGroupBy((g) => (g === intent.groupBy ? null : intent.groupBy));
      return;
    }
    onIntent(intent);
  };

  const actions = (app.actions ?? []).filter((a) => truthy(data, a.when));

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <BlockList blocks={app.canvas} data={data} emit={emit} groupBy={groupBy} />
      {actions.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border-default pt-4">
          {app.footNote && (
            <span className="mr-auto text-[11.5px] text-gray-4">
              {resolve(app.footNote, data)}
            </span>
          )}
          {actions.map((a) => (
            <Button key={a.label} spec={a} data={data} emit={emit} />
          ))}
        </div>
      )}
    </div>
  );
}

/** The inline card body — a glance, no depth. */
export function AppInline({ app, data }: { app: AppDescriptor; data: Data }) {
  return <BlockList blocks={app.inline} data={data} emit={() => {}} groupBy={null} />;
}
