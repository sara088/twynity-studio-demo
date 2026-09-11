"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Crown, Check, Wallet, SendHorizontal, Loader2, Bell, Columns2, Sparkles, FileText, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountMenu } from "@/features/shared/components/AccountMenu";
import { getTeam, onTeamsChanged } from "../lib/teams";
import { getRosterTwyn, type RosterTwyn } from "../data/roster";
import { COLLAB } from "../data/config";
import { useTeamChat, WALLET_TOTAL, type TeamMsg, type RunStatus } from "../hooks/useTeamChat";
import type { Team, Collaboration } from "../types";

type Panel = "canvas" | "wallet";

export function TeamChatView({ teamId }: { teamId: string }) {
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    const load = () => setTeam(getTeam(teamId) ?? null);
    load();
    return onTeamsChanged(load);
  }, [teamId]);

  if (!team) {
    return (
      <div className="grid h-full place-items-center text-[13px] text-gray-4">Team not found.</div>
    );
  }
  return <Chat team={team} />;
}

function Chat({ team }: { team: Team }) {
  const members = team.memberIds
    .map(getRosterTwyn)
    .filter((m): m is RosterTwyn => !!m);
  const lead = team.leadId ? getRosterTwyn(team.leadId) ?? null : null;
  const cfg = COLLAB[team.collaboration];
  const CollabIcon = cfg.icon;

  const { messages, typing, usage, busy, walletUsed, status, send, approve } = useTeamChat(team, members, lead);
  const memberOf = (id: string) => members.find((m) => m.id === id) ?? null;

  // Studio-style right panel — Canvas (the magic canvas) and Wallet, mutually
  // exclusive, width-driven like the studio's Equip/Canvas.
  const [panel, setPanel] = useState<Panel | null>("canvas");
  const toggle = (p: Panel) => setPanel((cur) => (cur === p ? null : p));

  // Default addressee: a team with a lead → you talk to the lead; if you're the
  // lead → you talk to everyone. Override per message by @mentioning a teammate.
  const defaultTarget = team.leadModel === "persona" && lead ? lead.id : "all";

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div className="flex h-full flex-col">
      {/* Row 1 — the studio top nav, verbatim: back pill + notifications + profile. */}
      <header className="flex h-[58px] shrink-0 items-center gap-3 border-b border-border bg-white px-4 lg:px-6">
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
        >
          <ArrowLeft size={13} /> All teams
        </Link>
        <div className="flex-1" />
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-[9px] border border-border text-gray-3 transition-colors hover:border-violet hover:text-violet"
        >
          <Bell size={15} />
          <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-violet px-1 text-[9px] font-bold text-white">
            5
          </span>
        </Link>
        <div className="hidden lg:block">
          <AccountMenu />
        </div>
      </header>

      {/* Content — one white artboard on the gray canvas (the studio concept):
          the identity/toolbar header, the thread, and the composer all live inside
          it, with the Canvas/Wallet as a second artboard beside it. */}
      <div className="flex min-h-0 flex-1">
        {/* Chat artboard */}
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border border-border bg-white">
            {/* Header — team identity + collaboration mode + Canvas/Wallet toggles */}
            <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
              <div className="flex -space-x-2.5">
                {members.slice(0, 4).map((m) => (
                  <span key={m.id} className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-white">
                    <Image src={m.portrait} alt={m.name} fill sizes="36px" className="object-cover" style={{ objectPosition: "center 20%" }} />
                  </span>
                ))}
              </div>
              <div className="min-w-0">
                <h1 className="truncate font-heading text-[16px] font-bold leading-tight tracking-[-0.3px] text-dark">
                  {team.name}
                </h1>
                <p className="truncate text-[12px] text-gray-4">
                  {members.length} members · {team.leadModel === "user" ? "You lead" : `${lead?.name ?? "A persona"} leads`}
                </p>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-1.5">
                <span className="hidden items-center gap-1.5 rounded-chip bg-violet-light px-2.5 py-1 text-[11.5px] font-bold text-violet sm:inline-flex">
                  <CollabIcon size={12} /> {cfg.label}
                </span>
                {/* Magic canvas — same place/behaviour as the studio's Canvas toggle. */}
                <button
                  type="button"
                  aria-label={panel === "canvas" ? "Close canvas" : "Open canvas"}
                  aria-pressed={panel === "canvas"}
                  title="Canvas — watch the team work"
                  onClick={() => toggle("canvas")}
                  className={cn(
                    "hidden h-9 items-center gap-1.5 rounded-[9px] border px-3 text-[12.5px] font-semibold transition-colors lg:inline-flex",
                    panel === "canvas" ? "border-violet bg-violet text-white" : "border-border text-gray-3 hover:border-violet hover:text-violet",
                  )}
                >
                  <Columns2 size={14} /> Canvas
                </button>
                {/* Wallet & usage — brings out the side panel. */}
                <button
                  type="button"
                  aria-label={panel === "wallet" ? "Close wallet" : "Open wallet"}
                  aria-pressed={panel === "wallet"}
                  title="Wallet & per-persona usage"
                  onClick={() => toggle("wallet")}
                  className={cn(
                    "hidden h-9 w-9 place-items-center rounded-[9px] border transition-colors lg:grid",
                    panel === "wallet" ? "border-violet bg-violet text-white" : "border-border text-gray-3 hover:border-violet hover:text-violet",
                  )}
                >
                  <Wallet size={15} />
                </button>
              </div>
            </div>

            {/* Thread */}
            <div ref={scrollRef} className="scrollbar-thin min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((m) => (
                <MessageRow key={m.id} m={m} memberOf={memberOf} lead={lead} onApprove={approve} />
              ))}
              {typing.map((id) => {
                const t = memberOf(id);
                if (!t) return null;
                return <TypingRow key={`typing-${id}`} twyn={t} />;
              })}
            </div>

            {/* Composer */}
            <Composer
              members={members}
              lead={lead}
              busy={busy}
              defaultTarget={defaultTarget}
              onSend={send}
            />
          </div>
        </div>

        {/* Canvas / Wallet artboard — width-driven push, matching the studio. */}
        <div
          className={cn(
            "hidden shrink-0 overflow-hidden transition-[width] duration-[350ms] ease-soft [will-change:width] lg:block",
            panel ? "lg:w-[436px]" : "lg:w-0",
          )}
        >
          <div className="h-full w-[436px] py-4 pr-4 transition-opacity duration-[220ms] [transition-delay:80ms]">
            {panel === "canvas" && (
              <TeamCanvas members={members} lead={lead} status={status} busy={busy} collaboration={team.collaboration} />
            )}
            {panel === "wallet" && (
              <TeamWalletPanel members={members} lead={lead} usage={usage} walletUsed={walletUsed} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Magic canvas — the live team run board (people-level).            */
/* ------------------------------------------------------------------ */

// What each role is "doing" — the sub-label on its run row.
const ROLE_ACTION: Record<string, string> = {
  "Data Analyst": "Crunching the numbers",
  Copywriter: "Drafting the copy",
  "Growth Lead": "Mapping the growth angle",
  "Strategy Consultant": "Framing the strategy",
  Researcher: "Gathering the research",
  "Sales Rep": "Shaping the pitch",
  Engineer: "Scoping the build",
  "Graduate Executive": "Coordinating the team",
  "Product Designer": "Sketching the UX",
};
const actionFor = (m: RosterTwyn) => ROLE_ACTION[m.role] ?? "On their part";

function TeamCanvas({
  members,
  lead,
  status,
  busy,
  collaboration,
}: {
  members: RosterTwyn[];
  lead: RosterTwyn | null;
  status: Record<string, RunStatus>;
  busy: boolean;
  collaboration: Collaboration;
}) {
  const cfg = COLLAB[collaboration];
  const CollabIcon = cfg.icon;
  const total = members.length;
  const doneCount = members.filter((m) => status[m.id] === "done").length;
  const hasRun = Object.keys(status).length > 0;
  const allDone = hasRun && doneCount === total && !busy;
  const pct = total ? (doneCount / total) * 100 : 0;
  // Lead first when a persona leads.
  const ordered = lead ? [lead, ...members.filter((m) => m.id !== lead.id)] : members;
  const gatePassed = ordered.slice(1).some((x) => status[x.id]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[18px] border border-border bg-white">
      {/* Panel header */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-violet-light text-violet">
          <Sparkles size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold leading-tight text-dark">Team canvas</div>
          <div className="truncate text-[11px] text-gray-4">What each teammate is doing</div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]",
            busy ? "bg-violet-light text-violet" : allDone ? "bg-mint text-mint-text" : "bg-bg-input text-gray-4",
          )}
        >
          {busy && <Loader2 size={10} className="animate-spin" />}
          {busy ? "Running" : allDone ? "Done" : "Idle"}
        </span>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4">
        {/* Run console — progress + mode (mirrors the studio run header). */}
        <div className="mb-3.5 rounded-[13px] border border-violet-mid/60 bg-dark/[0.03] p-3.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-heading text-[12.5px] font-bold text-violet">
              <CollabIcon size={13} /> {allDone ? "Run complete" : busy ? "Team working" : "Team run"}
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-gray-4 ring-1 ring-border">
                {cfg.label}
              </span>
            </span>
            <span className="font-sans text-[11.5px] font-semibold tabular-nums text-gray-4">
              {doneCount}/{total}
            </span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white">
            <div
              className={cn("h-full rounded-full transition-all duration-500", allDone ? "bg-mint-text" : "bg-violet")}
              style={{ width: `${hasRun ? pct : 0}%` }}
            />
          </div>
          <p className="mt-2.5 text-[10.5px] font-semibold leading-snug text-gray-4">{cfg.hint}</p>
        </div>

        {/* Member run rows */}
        <ol className="space-y-1.5">
          {ordered.map((m, i) => {
            const st = status[m.id];
            const isLead = lead?.id === m.id;
            const showGate = collaboration === "conditional" && i === 0 && ordered.length > 1;
            return (
              <li key={m.id}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-[11px] px-2.5 py-2.5 transition-colors",
                    st === "working" && "bg-white ring-1 ring-violet-mid",
                    !st && "opacity-45",
                  )}
                >
                  <span className="relative h-8 w-8 shrink-0">
                    <Image src={m.portrait} alt={m.name} width={32} height={32} className="h-8 w-8 rounded-full object-cover object-top" />
                    {st === "done" && (
                      <span className="absolute -bottom-0.5 -right-0.5 grid h-[15px] w-[15px] place-items-center rounded-full bg-mint text-mint-text ring-2 ring-white">
                        <Check size={9} strokeWidth={3} />
                      </span>
                    )}
                    {st === "working" && (
                      <span className="absolute -bottom-0.5 -right-0.5 grid h-[15px] w-[15px] place-items-center rounded-full bg-violet text-white ring-2 ring-white">
                        <Loader2 size={9} className="animate-spin" />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 truncate text-[12.5px] font-semibold text-dark">
                      {m.name}
                      {isLead && <Crown size={11} className="shrink-0 text-amber-text" />}
                    </div>
                    <div className="truncate text-[11px] text-gray-4">{actionFor(m)}</div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      st === "done" ? "bg-mint text-mint-text" : st === "working" ? "bg-violet-light text-violet" : "bg-bg-input text-gray-4",
                    )}
                  >
                    {st === "done" ? "Done" : st === "working" ? "Working" : "Queued"}
                  </span>
                </div>

                {showGate && (
                  <div
                    className={cn(
                      "mt-1.5 flex items-center gap-2 rounded-[11px] border border-dashed px-2.5 py-2 text-[11px] font-semibold",
                      gatePassed ? "border-mint-text/40 text-mint-text" : "border-amber-text/40 bg-amber/25 text-amber-text",
                    )}
                  >
                    <ShieldCheck size={13} /> {gatePassed ? "Gate cleared" : "Waiting on your approval"}
                  </div>
                )}
              </li>
            );
          })}

          {allDone && (
            <li className="rounded-[12px] border border-violet-mid bg-white p-3 shadow-[0_2px_12px_rgba(108,92,231,0.12)]">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-violet-light text-violet">
                  <FileText size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-heading text-[13px] font-bold text-dark">Team result</div>
                  <div className="truncate text-[11px] text-gray-4">Delivered in the chat</div>
                </div>
                <span className="shrink-0 rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-mint-text">Ready</span>
              </div>
            </li>
          )}
        </ol>

        {!hasRun && (
          <p className="mt-3 text-center text-[11.5px] leading-[1.5] text-gray-4">
            Assign a task in the chat and watch the team work here.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Wallet & usage panel (Story 4) — toggled from the toolbar.        */
/* ------------------------------------------------------------------ */

function TeamWalletPanel({
  members,
  lead,
  usage,
  walletUsed,
}: {
  members: RosterTwyn[];
  lead: RosterTwyn | null;
  usage: Record<string, number>;
  walletUsed: number;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[18px] border border-border bg-white">
      <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-violet-light text-violet">
          <Wallet size={15} />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-bold leading-tight text-dark">Central wallet</div>
          <div className="text-[11px] text-gray-4">One shared balance</div>
        </div>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4">
        <div className="rounded-card border border-border bg-bg-content p-3.5">
          <div className="flex items-baseline gap-1">
            <span className="font-sans text-[24px] font-bold tabular-nums leading-none text-dark">
              {(WALLET_TOTAL - walletUsed).toLocaleString()}
            </span>
            <span className="text-[11px] text-gray-4">/ {WALLET_TOTAL} credits left</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-input">
            <div
              className="h-full rounded-full bg-violet transition-[width] duration-500"
              style={{ width: `${Math.max(0, 100 - (walletUsed / WALLET_TOTAL) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[10.5px] leading-[1.45] text-gray-4">
            Team interactions bill here; usage is tracked per persona below.
          </p>
        </div>

        <p className="mb-2 mt-4 px-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-gray-5">
          Per-persona usage
        </p>
        <ul className="space-y-1">
          {members.map((m) => {
            const used = usage[m.id] ?? 0;
            const isLead = lead?.id === m.id;
            return (
              <li key={m.id} className="flex items-center gap-2.5 rounded-[11px] px-1.5 py-1.5">
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                  <Image src={m.portrait} alt={m.name} fill sizes="32px" className="object-cover" style={{ objectPosition: "center 20%" }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1">
                    <span className="truncate text-[12px] font-semibold text-dark">{m.name}</span>
                    {isLead && <Crown size={11} className="shrink-0 text-amber-text" />}
                  </span>
                  <span className="mt-0.5 block h-1 overflow-hidden rounded-full bg-bg-input">
                    <span className="block h-full rounded-full bg-violet-mid transition-[width] duration-500" style={{ width: `${Math.min(100, (used / 130) * 100)}%` }} />
                  </span>
                </span>
                <span className="font-sans text-[11px] font-semibold tabular-nums text-gray-3">{used}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function MessageRow({
  m,
  memberOf,
  lead,
  onApprove,
}: {
  m: TeamMsg;
  memberOf: (id: string) => RosterTwyn | null;
  lead: RosterTwyn | null;
  onApprove: () => void;
}) {
  // System line — centered, subtle.
  if (m.senderId === "system" && m.kind === "text") {
    return (
      <div className="flex justify-center">
        <span className="rounded-chip bg-bg-input px-3 py-1 text-[11.5px] font-medium text-gray-4">{m.content}</span>
      </div>
    );
  }

  // Approval gate (conditional mode).
  if (m.kind === "approval") {
    return (
      <div className="flex justify-center">
        <div className="flex w-full max-w-[420px] items-center gap-3 rounded-[14px] border border-amber-text/25 bg-amber/40 px-3.5 py-3">
          <span className="min-w-0 flex-1 text-[12.5px] leading-[1.45] text-amber-text">
            {m.awaiting ? (
              <>Gate — approve to continue to <b>{m.gateFor}</b>.</>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold"><Check size={13} /> Approved — {m.gateFor} continued.</span>
            )}
          </span>
          {m.awaiting && (
            <button
              type="button"
              onClick={onApprove}
              className="shrink-0 rounded-btn bg-violet px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-violet-h"
            >
              Approve
            </button>
          )}
        </div>
      </div>
    );
  }

  // User bubble — right, violet (mirrors the studio). Shows who it was addressed to.
  if (m.senderId === "user") {
    const toName = m.to && m.to !== "all" ? memberOf(m.to)?.name.split(" ").slice(-1)[0] : null;
    return (
      <div className="flex flex-col items-end gap-1">
        {m.to && (
          <span className="flex items-center gap-1 pr-1 text-[10.5px] font-semibold text-gray-4">
            To {toName ?? "the team"}
          </span>
        )}
        <div className="inline-block max-w-[85%] rounded-[14px] rounded-tr-[4px] bg-violet px-4 py-3 text-[13.5px] leading-[1.55] text-white break-words">
          {m.content.split(/(@\w+)/g).map((p, i) =>
            p.startsWith("@") ? (
              <span key={i} className="font-semibold underline decoration-white/40 underline-offset-2">{p}</span>
            ) : (
              p
            ),
          )}
        </div>
      </div>
    );
  }

  const twyn = memberOf(m.senderId);
  if (!twyn) return null;

  // Persona-lead internal "team working" strip.
  if (m.kind === "work") {
    const total = m.stepsTotal ?? 0;
    const done = m.steps?.length ?? 0;
    const working = done < total;
    return (
      <div className="flex gap-2.5">
        <Avatar twyn={twyn} />
        <div className="min-w-0 flex-1">
          <SenderLabel twyn={twyn} lead={lead} />
          <div className="mt-1 max-w-[460px] overflow-hidden rounded-[14px] rounded-tl-[4px] border border-border bg-white shadow-[0_1px_2px_rgba(15,15,30,0.04)]">
            <div className="flex items-center gap-2 border-b border-border px-3.5 py-2.5">
              <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full", working ? "bg-violet-light text-violet" : "bg-mint text-mint-text")}>
                {working ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2.6} />}
              </span>
              <span className="text-[12px] font-bold text-dark">{working ? "Team working…" : "Team finished"}</span>
              <span className="ml-auto rounded-chip bg-bg-input px-1.5 py-0.5 font-sans text-[10.5px] font-bold tabular-nums text-gray-4">
                {done}/{total}
              </span>
            </div>
            <ul className="p-1.5">
              {m.steps?.map((s) => {
                const w = memberOf(s.memberId);
                if (!w) return null;
                return (
                  <li key={s.memberId} className="flex items-center gap-2.5 rounded-[10px] px-2 py-1.5">
                    <span className="relative h-[22px] w-[22px] shrink-0 overflow-hidden rounded-full">
                      <Image src={w.portrait} alt="" fill sizes="22px" className="object-cover" style={{ objectPosition: "center 20%" }} />
                    </span>
                    <span className="min-w-0 flex-1 text-[12.5px] leading-tight text-gray-2">
                      <b className="font-semibold text-dark">{w.name.split(" ").slice(-1)[0]}</b> {s.line}
                    </span>
                    <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-mint text-mint-text">
                      <Check size={11} strokeWidth={2.8} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Member text bubble — left, avatar + name (multi-persona attribution).
  return (
    <div className="flex gap-2.5">
      <Avatar twyn={twyn} />
      <div className="min-w-0">
        <SenderLabel twyn={twyn} lead={lead} />
        <div className="mt-1 inline-block max-w-[85%] rounded-[14px] rounded-tl-[4px] bg-white px-4 py-3 text-[13.5px] leading-[1.55] text-dark break-words">
          {m.content}
        </div>
      </div>
    </div>
  );
}

function Avatar({ twyn }: { twyn: RosterTwyn }) {
  return (
    <span className="relative mt-5 h-8 w-8 shrink-0 overflow-hidden rounded-full">
      <Image src={twyn.portrait} alt={twyn.name} fill sizes="32px" className="object-cover" style={{ objectPosition: "center 20%" }} />
    </span>
  );
}

function SenderLabel({ twyn, lead }: { twyn: RosterTwyn; lead: RosterTwyn | null }) {
  return (
    <span className="flex items-center gap-1 px-1 text-[11.5px] font-semibold text-gray-3">
      {twyn.name}
      {lead?.id === twyn.id && (
        <span className="inline-flex items-center gap-0.5 text-amber-text"><Crown size={10} /> Lead</span>
      )}
      <span className="font-normal text-gray-5">· {twyn.role}</span>
    </span>
  );
}

function TypingRow({ twyn }: { twyn: RosterTwyn }) {
  return (
    <div className="flex gap-2.5">
      <Avatar twyn={twyn} />
      <div>
        <SenderLabel twyn={twyn} lead={null} />
        <div className="mt-1 inline-flex items-center gap-1 rounded-[14px] rounded-tl-[4px] bg-white px-4 py-3.5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet animate-typing-dot" />
          <span className="h-1.5 w-1.5 rounded-full bg-violet animate-typing-dot [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-violet animate-typing-dot [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// Mention token = the last word of the name (Sara, Priya, Rey…).
const mentionToken = (m: RosterTwyn) => m.name.split(" ").slice(-1)[0];

function Composer({
  members,
  lead,
  busy,
  defaultTarget,
  onSend,
}: {
  members: RosterTwyn[];
  lead: RosterTwyn | null;
  busy: boolean;
  defaultTarget: string;
  onSend: (text: string, target: string) => void;
}) {
  const [text, setText] = useState("");
  // Active @mention being typed: the query + where it sits in the text.
  const [mention, setMention] = useState<{ query: string; start: number; end: number } | null>(null);
  const [hi, setHi] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const matches =
    mention === null
      ? []
      : members.filter((m) => {
          const q = mention.query.toLowerCase();
          return !q || mentionToken(m).toLowerCase().startsWith(q) || m.name.toLowerCase().includes(q);
        });

  // The default addressee, unless the text @mentions a specific teammate.
  const resolveTarget = () => {
    const toks = [...text.matchAll(/@(\w+)/g)].map((x) => x[1].toLowerCase());
    const hit = members.find((m) => toks.includes(mentionToken(m).toLowerCase()));
    return hit ? hit.id : defaultTarget;
  };

  const submit = () => {
    if (!text.trim() || busy) return;
    onSend(text, resolveTarget());
    setText("");
    setMention(null);
  };

  const syncMention = (val: string, caret: number) => {
    const upto = val.slice(0, caret);
    const m = upto.match(/(?:^|\s)@(\w*)$/);
    if (m) {
      setMention({ query: m[1], start: caret - m[1].length - 1, end: caret });
      setHi(0);
    } else {
      setMention(null);
    }
  };

  const pick = (m: RosterTwyn) => {
    if (!mention) return;
    const before = text.slice(0, mention.start);
    const after = text.slice(mention.end);
    const ins = `@${mentionToken(m)} `;
    setText(before + ins + after);
    setMention(null);
    requestAnimationFrame(() => {
      const el = taRef.current;
      if (el) {
        el.focus();
        const pos = (before + ins).length;
        el.setSelectionRange(pos, pos);
      }
    });
  };

  const placeholder = busy
    ? "Team is working…"
    : defaultTarget === "all"
      ? "Ask the team…   @ to reach one teammate"
      : `Message ${lead ? mentionToken(lead) : "the lead"}…   @ to reach a teammate`;

  return (
    <div className="relative shrink-0 border-t border-border p-3">
      {/* @mention autocomplete — opens above the input as you type @. */}
      {mention && matches.length > 0 && (
        <div className="absolute bottom-[calc(100%-6px)] left-3 z-20 w-[264px] overflow-hidden rounded-[14px] border border-border bg-white p-1 shadow-[0_16px_48px_rgba(15,15,30,0.16)]">
          {matches.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                pick(m);
              }}
              onMouseEnter={() => setHi(i)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left transition-colors",
                i === hi ? "bg-violet-light/60" : "hover:bg-bg-input",
              )}
            >
              <Image src={m.portrait} alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover object-top" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1">
                  <b className="truncate text-[12.5px] font-semibold text-dark">{m.name}</b>
                  {lead?.id === m.id && <Crown size={10} className="shrink-0 text-amber-text" />}
                </span>
                <span className="block truncate text-[11px] text-gray-4">
                  {lead?.id === m.id ? "Lead — coordinates the team" : m.role}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          "flex items-end gap-2 rounded-[18px] border bg-white p-2 pl-4 transition-colors",
          busy ? "border-border" : "border-border focus-within:border-violet",
        )}
      >
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            syncMention(e.target.value, e.target.selectionStart ?? e.target.value.length);
          }}
          onKeyDown={(e) => {
            if (mention && matches.length) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHi((h) => (h + 1) % matches.length);
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHi((h) => (h - 1 + matches.length) % matches.length);
                return;
              }
              if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                pick(matches[hi]);
                return;
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setMention(null);
                return;
              }
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          disabled={busy}
          placeholder={placeholder}
          className="max-h-[120px] min-h-[24px] flex-1 resize-none self-center bg-transparent py-1.5 text-[13.5px] leading-[1.5] text-dark outline-none placeholder:text-gray-5 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy || !text.trim()}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet text-white transition-[background,opacity] hover:bg-violet-h disabled:opacity-40"
          aria-label="Send"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
        </button>
      </div>
    </div>
  );
}
