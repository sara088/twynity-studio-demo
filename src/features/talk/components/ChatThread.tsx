"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Loader2,
  Mail,
  Maximize2,
  Search,
  Workflow,
  Wrench,
} from "lucide-react";
import type {
  ChatArtifact,
  ChatAttachment,
  ChatMessage,
  ToolIcon,
  ToolStep,
} from "../types";
import type { Twyn } from "@/features/my-twyns/types";
import { cn } from "@/lib/utils";

// Render inline **bold** spans — the only markdown the twyn emits.
// Inline formatting inside a line: **bold** and `code`.
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**"))
      return (
        <strong key={i} className="font-semibold">
          {seg.slice(2, -2)}
        </strong>
      );
    if (seg.startsWith("`") && seg.endsWith("`"))
      return (
        <code key={i} className="rounded-[5px] bg-black/[0.06] px-1 py-0.5 font-mono text-[0.85em]">
          {seg.slice(1, -1)}
        </code>
      );
    return seg;
  });
}

// Lightweight markdown for chat messages — headings, lists (nested via indent),
// paragraphs, inline code + bold. Headings deliberately use the BODY font (not
// Syne) at a modest size with tight leading, so long answers read as chat, not
// as a marketing page, and don't balloon in height.
function renderRich(text: string) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let items: { indent: number; text: string }[] = [];
  let k = 0;

  const flushPara = () => {
    if (!para.length) return;
    blocks.push(
      <p key={k++} className="mt-2 leading-[1.55] first:mt-0">
        {renderInline(para.join(" "))}
      </p>,
    );
    para = [];
  };
  const flushList = () => {
    if (!items.length) return;
    blocks.push(
      <ul key={k++} className="mt-2 space-y-1 first:mt-0">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 leading-[1.5]" style={{ marginLeft: it.indent * 16 }}>
            <span className="mt-[8px] h-[3px] w-[3px] shrink-0 rounded-full bg-current opacity-60" />
            <span className="min-w-0">{renderInline(it.text)}</span>
          </li>
        ))}
      </ul>,
    );
    items = [];
  };

  for (const raw of lines) {
    if (!raw.trim()) {
      flushPara();
      flushList();
      continue;
    }
    const h = raw.match(/^\s*(#{1,3})\s+(.*)$/);
    if (h) {
      flushPara();
      flushList();
      const lvl = h[1].length;
      const size = lvl === 1 ? "text-[15.5px]" : lvl === 2 ? "text-[14.5px]" : "text-[13.5px]";
      blocks.push(
        <div key={k++} className={cn("mb-0.5 mt-3.5 font-bold leading-[1.3] first:mt-0", size)}>
          {renderInline(h[2])}
        </div>,
      );
      continue;
    }
    const li = raw.match(/^(\s*)[-*]\s+(.*)$/);
    if (li) {
      flushPara();
      const indent = Math.min(3, Math.floor(li[1].replace(/\t/g, "  ").length / 2));
      items.push({ indent, text: li[2] });
      continue;
    }
    flushList();
    para.push(raw.trim());
  }
  flushPara();
  flushList();
  return blocks;
}

// In-thread document chip — shows the dropped/attached file with its
// indexing → ready affordance (story 10·4).
function AttachmentCard({ attachment }: { attachment: ChatAttachment }) {
  const ready = attachment.status === "ready";
  return (
    <div className="flex w-[260px] max-w-full items-center gap-3 rounded-[14px] border border-border bg-white px-3.5 py-3">
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-[9px] transition-colors",
          ready ? "bg-mint text-mint-text" : "bg-violet-light text-violet"
        )}
      >
        <FileText size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold text-dark">{attachment.name}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px]">
          {ready ? (
            <span className="inline-flex items-center gap-1 font-semibold text-mint-text">
              <Check size={12} strokeWidth={2.5} /> Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-violet">
              <Loader2 size={12} className="animate-spin" /> Indexing…
            </span>
          )}
          <span className="text-gray-4">· {attachment.sizeLabel}</span>
        </div>
      </div>
    </div>
  );
}

// Inline Canvas artifact — the "canvas inside the chat" card. Compact preview
// of what the twyn produced; click to expand it into the side Canvas (desktop)
// or fullscreen (mobile). When the Canvas is already showing this artifact the
// card reads as active. (Claude-style artifact pill.)
function ArtifactCard({
  artifact,
  active,
  onOpen,
}: {
  artifact: ChatArtifact;
  active: boolean;
  onOpen: (a: ChatArtifact) => void;
}) {
  const isWorkflow = artifact.kind === "workflow";
  const Icon = isWorkflow ? Workflow : FileText;
  return (
    <button
      type="button"
      onClick={() => onOpen(artifact)}
      aria-pressed={active}
      title={active ? "Showing in Canvas" : isWorkflow ? "Watch the run in Canvas" : "Open in Canvas"}
      className={cn(
        // Canvas is desktop-only, so the expand-to-Canvas card is hidden on
        // mobile (chat + equip only there).
        "group mt-2 hidden w-full max-w-[340px] items-center gap-3 rounded-[12px] border bg-white px-3 py-2.5 text-left transition-colors lg:flex",
        active ? "border-violet/70" : "border-border hover:border-violet/50"
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-[9px] transition-colors",
          active
            ? "bg-violet-light text-violet"
            : "bg-bg-input text-gray-3 group-hover:bg-violet-light group-hover:text-violet"
        )}
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-dark">{artifact.title}</span>
        <span className="mt-0.5 block truncate text-[11.5px] text-gray-4">{artifact.subtitle}</span>
      </span>
      <Maximize2
        size={14}
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-violet" : "text-gray-5 group-hover:text-violet"
        )}
      />
    </button>
  );
}

const TOOL_ICON: Record<ToolIcon, typeof Search> = {
  search: Search,
  doc: FileText,
  calendar: Calendar,
  clock: Clock,
  mail: Mail,
};

// Subtle, collapsible tool-execution log shown inside the twyn's turn (story 6).
// Auto-expands while the tools run (so you watch them stream), then collapses to
// a quiet "Used N tools" summary you can re-open — Claude/ChatGPT style.
function ToolActivity({ steps }: { steps: ToolStep[] }) {
  const running = steps.some((s) => s.status === "running");
  const [open, setOpen] = useState(running);
  useEffect(() => {
    if (!running) setOpen(false);
  }, [running]);

  return (
    <div className="mb-1.5 text-[12px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 font-medium text-gray-4 transition-colors hover:bg-bg-input hover:text-gray-2"
      >
        {running ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Wrench className="h-3 w-3" />
        )}
        <span>
          {running ? "Working…" : `Used ${steps.length} ${steps.length === 1 ? "tool" : "tools"}`}
        </span>
        {!running && (
          <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
        )}
      </button>
      {open && (
        <ul className="ml-2 mt-1 space-y-1.5 border-l border-border pl-3">
          {steps.map((s) => {
            const Icon = TOOL_ICON[s.icon];
            const done = s.status === "done";
            return (
              <li key={s.id} className="flex items-center gap-2 text-gray-4">
                <Icon className="h-3 w-3 shrink-0 text-gray-5" />
                <span className={cn(done && "text-gray-3")}>{s.label}</span>
                {done ? (
                  <Check className="h-3 w-3 shrink-0 text-mint-text" strokeWidth={2.5} />
                ) : (
                  <Loader2 className="h-3 w-3 shrink-0 animate-spin text-gray-5" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ChatThread({
  messages,
  typing,
  twyn,
  onOpenArtifact,
  activeArtifactId,
}: {
  messages: ChatMessage[];
  typing: boolean;
  twyn: Twyn;
  onOpenArtifact: (a: ChatArtifact) => void;
  activeArtifactId: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-thin flex-1 overflow-y-auto bg-white px-7 py-6"
    >
      {/* Conversation capped + centered for readability (ChatGPT-style); only
          caps when the chat pane is wider than the column. */}
      <div className="mx-auto w-full max-w-[768px] space-y-5">
      {messages.map((m) =>
        m.role === "twyn" ? (
          <div key={m.id} className="flex items-start gap-3">
            <Image
              src={twyn.portrait}
              alt={twyn.name}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-full bg-violet-mid object-cover object-top"
            />
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="truncate font-heading text-[13px] font-bold text-dark">
                  {twyn.name}
                </span>
                <span className="shrink-0 text-[11px] text-gray-4">just now</span>
              </div>
              {m.tools && m.tools.length > 0 && <ToolActivity steps={m.tools} />}
              {m.content && (
                <div className="inline-block max-w-full rounded-[14px] rounded-tl-[4px] bg-white px-4 py-3 text-[13.5px] leading-[1.55] text-dark break-words @[420px]:max-w-[85%]">
                  {renderRich(m.content)}
                </div>
              )}
              {m.artifact && (
                <ArtifactCard
                  artifact={m.artifact}
                  active={activeArtifactId === m.artifact.id}
                  onOpen={onOpenArtifact}
                />
              )}
            </div>
          </div>
        ) : (
          <div key={m.id} className="flex justify-end">
            <div className="flex max-w-full flex-col items-end gap-2 @[420px]:max-w-[85%]">
              {m.attachments?.map((a, i) => (
                <AttachmentCard key={i} attachment={a} />
              ))}
              {m.content && (
                <div className="inline-block max-w-full rounded-[14px] rounded-tr-[4px] bg-violet px-4 py-3 text-[13.5px] leading-[1.55] text-white break-words">
                  {renderRich(m.content)}
                </div>
              )}
            </div>
          </div>
        )
      )}
      {typing && (
        <div className="flex items-start gap-3">
          <Image
            src={twyn.portrait}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full bg-violet-mid object-cover object-top"
          />
          <div className="inline-flex items-center gap-1.5 rounded-[14px] rounded-tl-[4px] bg-white px-4 py-3">
            <span
              className="h-1.5 w-1.5 rounded-full bg-violet animate-typing-dot"
              style={{ animationDelay: "0s" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-violet animate-typing-dot"
              style={{ animationDelay: "0.15s" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-violet animate-typing-dot"
              style={{ animationDelay: "0.3s" }}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
