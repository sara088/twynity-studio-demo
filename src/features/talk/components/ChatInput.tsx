"use client";

import { FileText, Paperclip, Mic, Send, X, Workflow, CornerDownLeft } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { DOC_ACCEPT } from "../lib/attachments";
import type { AttachmentMeta } from "../types";
import { cn } from "@/lib/utils";

export type SlashCommand = {
  id: string;
  name: string;
  slash: string;
  phrase: string;
  hint: string;
};

const QUICK_PROMPTS = [
  "Summarize a doc",
  "Draft an email",
  "Schedule across timezones",
  "Quick research",
];

export function ChatInput({
  onSend,
  onAttach,
  attachments,
  onRemoveAttachment,
  twynName,
  showQuickStart = true,
  disabled = false,
  disabledHint,
  commands = [],
  onRunCommand,
}: {
  onSend: (text: string) => void;
  onAttach: (files: FileList) => void;
  attachments: AttachmentMeta[];
  onRemoveAttachment: (index: number) => void;
  twynName: string;
  showQuickStart?: boolean;
  /** Account limit hit (out of credits / trial over) — block input. */
  disabled?: boolean;
  /** Placeholder shown while disabled, explaining why + the way forward. */
  disabledHint?: string;
  /** Equipped workflows, surfaced in the "/" command menu. */
  commands?: SlashCommand[];
  onRunCommand?: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [menuIdx, setMenuIdx] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSend = !disabled && (draft.trim().length > 0 || attachments.length > 0);

  // "/" opens a command menu of equipped workflows. Filter by what's typed after
  // the slash (matching the slash or the name).
  const q = draft.slice(1).toLowerCase();
  const slashOpen = !disabled && draft.startsWith("/") && commands.length > 0;
  const filtered = slashOpen
    ? commands.filter((c) => c.slash.slice(1).startsWith(q) || c.name.toLowerCase().includes(q))
    : [];

  function runCmd(id: string) {
    onRunCommand?.(id);
    setDraft("");
    setMenuIdx(0);
    if (taRef.current) taRef.current.style.height = "auto";
  }

  function submit() {
    if (!canSend) return;
    onSend(draft); // parent attaches `attachments` and clears them
    setDraft("");
    if (taRef.current) taRef.current.style.height = "auto";
  }

  function autoGrow() {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Command menu takes over the arrows / Enter while it's open.
    if (slashOpen && filtered.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMenuIdx((i) => (i + 1) % filtered.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMenuIdx((i) => (i - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        runCmd(filtered[Math.min(menuIdx, filtered.length - 1)].id);
        return;
      }
      if (e.key === "Escape") {
        setDraft("");
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-border bg-white px-5 py-3.5">
      {/* Composer aligned to the conversation column (same max-width). */}
      <div className="mx-auto w-full max-w-[768px]">
      {showQuickStart && !disabled && (
        <div className="scrollbar-none -mx-5 mb-3 flex gap-2 overflow-x-auto px-5 @[520px]:mx-0 @[520px]:flex-wrap @[520px]:overflow-visible @[520px]:px-0">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onSend(p)}
              className="shrink-0 whitespace-nowrap rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold text-gray-2 transition-colors hover:border-violet hover:bg-violet-light hover:text-violet"
            >
              {p}
            </button>
          ))}
        </div>
      )}
      {slashOpen && filtered.length > 0 && (
        <div className="mb-2 overflow-hidden rounded-[16px] border border-border bg-white shadow-[0_16px_44px_rgba(15,15,30,0.16)]">
          <div className="flex items-center justify-between px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-gray-4">
            <span>Run a workflow</span>
            <span className="flex items-center gap-1 text-gray-5">
              <CornerDownLeft size={11} /> to run
            </span>
          </div>
          {filtered.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onMouseEnter={() => setMenuIdx(i)}
              onClick={() => runCmd(c.id)}
              className={cn(
                "flex w-full items-center gap-3 border-t border-border/60 px-3.5 py-2.5 text-left transition-colors",
                i === menuIdx ? "bg-violet-light/60" : "hover:bg-input-bg/50"
              )}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-violet-light text-violet">
                <Workflow size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-heading text-[13px] font-bold text-dark">{c.name}</span>
                <span className="block truncate text-[11.5px] text-gray-4">{c.hint}</span>
              </span>
              <span className="shrink-0 rounded-full bg-bg-input px-2 py-0.5 font-sans text-[11px] font-semibold text-violet">
                {c.slash}
              </span>
            </button>
          ))}
        </div>
      )}
      <div className={`rounded-[26px] border-[1.5px] border-border bg-white px-3 py-2 transition-colors focus-within:border-violet ${disabled ? "pointer-events-none opacity-55" : ""}`}>
        {/* Pending document attachments — sent together with the message. */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1 pb-2 pt-1">
            {attachments.map((a, i) => (
              <span
                key={i}
                className="inline-flex max-w-[220px] items-center gap-2 rounded-[10px] border border-border bg-bg-input py-1.5 pl-2 pr-1.5"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[7px] bg-violet-light text-violet">
                  <FileText size={14} />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block truncate text-[12px] font-bold text-dark">{a.name}</span>
                  <span className="block text-[10.5px] text-gray-4">{a.sizeLabel}</span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${a.name}`}
                  onClick={() => onRemoveAttachment(i)}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-gray-4 transition-colors hover:bg-border hover:text-dark"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end gap-1.5">
        <textarea
          ref={taRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setMenuIdx(0);
            autoGrow();
          }}
          onKeyDown={onKey}
          disabled={disabled}
          placeholder={
            disabled
              ? disabledHint ?? "You've reached your limit — upgrade to continue"
              : commands.length > 0
                ? `Message ${twynName} — or / to run a workflow`
                : `Message ${twynName}…`
          }
          rows={1}
          className="max-h-[140px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[13.5px] text-dark outline-none placeholder:text-gray-5"
        />
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={DOC_ACCEPT}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onAttach(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          aria-label="Attach a document"
          title="Attach a document (PDF, text, CSV)"
          onClick={() => fileRef.current?.click()}
          className="grid h-8 w-8 place-items-center rounded-full text-gray-4 hover:bg-input-bg hover:text-dark"
        >
          <Paperclip size={14} />
        </button>
        <button
          type="button"
          aria-label="Voice input"
          className="grid h-8 w-8 place-items-center rounded-full text-gray-4 hover:bg-input-bg hover:text-dark"
        >
          <Mic size={14} />
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send"
          className="grid h-9 w-9 place-items-center rounded-full bg-violet text-white transition-opacity disabled:opacity-40 hover:bg-violet-h"
        >
          <Send size={14} />
        </button>
        </div>
      </div>
      </div>
    </div>
  );
}
