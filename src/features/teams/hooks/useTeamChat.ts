"use client";

import { useEffect, useRef, useState } from "react";
import type { Team } from "../types";
import type { RosterTwyn } from "../data/roster";

// A scripted, prototype team-chat engine (single-file, no backend) — mirrors the
// studio's useTypingChat but multi-persona. It plays out the two lead models and
// the three collaboration modes, attributes every reply to its persona, and ticks
// per-persona usage against one shared wallet.

export type TeamMsgKind = "text" | "work" | "approval";

export interface WorkStep {
  memberId: string;
  line: string;
}

export interface TeamMsg {
  id: string;
  /** "user", "system", or a member id. */
  senderId: string;
  content: string;
  kind: TeamMsgKind;
  /** For kind "work" (persona-lead internal activity) — revealed progressively. */
  steps?: WorkStep[];
  stepsTotal?: number;
  /** For kind "approval" — true while waiting on the user to clear the gate. */
  awaiting?: boolean;
  gateFor?: string; // name of the persona waiting behind the gate
  /** For a user message — who it was addressed to ("all" or a member id). */
  to?: string;
}

export const WALLET_TOTAL = 500;

export type RunStatus = "queued" | "working" | "done";

// Role-flavored replies so the scripted run reads like real work, not lorem.
const ROLE_REPLY: Record<string, string> = {
  "Data Analyst": "Pulled the latest numbers — conversion's up 12% week-over-week, churn's flat. Charts are in the doc.",
  Copywriter: "Drafted three subject lines and a punchy intro. Tone's confident, not salesy — pick whichever fits.",
  "Growth Lead": "From a growth angle I'd lead with the referral loop — it's the highest-ROI play for this segment.",
  "Strategy Consultant": "Strategically, phase it: validate with a small cohort first, then commit to the full rollout.",
  Researcher: "Found three solid sources plus two competitor moves worth flagging. Summary's in the notes.",
  "Sales Rep": "Here's the pitch framing and the two objections we'll hit — with rebuttals ready for each.",
  Engineer: "Feasible. Rough plan: API stub today, wire the integration tomorrow. No blockers I can see.",
  "Graduate Executive": "On it — I'll pull the pieces together and keep everyone aligned on the goal.",
  "Product Designer": "Quick UX read: drop the second step, that's where people fall off. I'll mock the leaner flow.",
};

// Short past-tense fragment for the persona-lead internal "team working" strip.
const ROLE_DID: Record<string, string> = {
  "Data Analyst": "crunched the numbers",
  Copywriter: "drafted the copy",
  "Growth Lead": "mapped the growth angle",
  "Strategy Consultant": "framed the strategy",
  Researcher: "gathered the research",
  "Sales Rep": "shaped the pitch",
  Engineer: "scoped the build",
  "Graduate Executive": "aligned the team",
  "Product Designer": "sketched the UX",
};

const lastName = (n: string) => n.split(" ").slice(-1)[0];
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function replyFor(m: RosterTwyn, task: string, prevName?: string): string {
  const base = ROLE_REPLY[m.role] ?? `Here's my part on "${task}".`;
  return prevName ? `Building on ${lastName(prevName)}'s work — ${lowerFirst(base)}` : base;
}
const didFor = (m: RosterTwyn) => ROLE_DID[m.role] ?? "handled their part";

function seedUsage(members: RosterTwyn[]): Record<string, number> {
  const u: Record<string, number> = {};
  members.forEach((m, i) => {
    u[m.id] = 34 + ((m.id.charCodeAt(0) + i * 37) % 70);
  });
  return u;
}

export function useTeamChat(team: Team, members: RosterTwyn[], lead: RosterTwyn | null) {
  const workers = lead ? members.filter((m) => m.id !== lead.id) : members;

  const [messages, setMessages] = useState<TeamMsg[]>(() => [introMessage(team, lead, workers)]);
  const [typing, setTyping] = useState<string[]>([]);
  const [usage, setUsage] = useState<Record<string, number>>(() => seedUsage(members));
  const [busy, setBusy] = useState(false);
  // Live per-member run status for the magic canvas.
  const [status, setStatus] = useState<Record<string, RunStatus>>({});

  const idRef = useRef(2);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pending = useRef<{ task: string; actors: RosterTwyn[] } | null>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const nid = () => `tm-${idRef.current++}`;
  const at = (delay: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, delay));
  };
  const push = (m: TeamMsg) => setMessages((prev) => [...prev, m]);
  const say = (senderId: string, content: string) =>
    push({ id: nid(), senderId, content, kind: "text" });
  const tick = (id: string, amt: number) =>
    setUsage((u) => ({ ...u, [id]: (u[id] ?? 0) + amt }));
  const mark = (id: string, s: RunStatus) => setStatus((prev) => ({ ...prev, [id]: s }));
  const queueAll = (ids: string[]) =>
    setStatus(Object.fromEntries(ids.map((id) => [id, "queued" as RunStatus])));

  // ---- collaboration modes (you-lead) --------------------------------------

  function runParallel(task: string, actors: RosterTwyn[]) {
    setTyping(actors.map((a) => a.id));
    actors.forEach((a) => mark(a.id, "working"));
    actors.forEach((m, i) => {
      at(650 + i * 780, () => {
        setTyping((t) => t.filter((x) => x !== m.id));
        say(m.id, replyFor(m, task));
        tick(m.id, 4 + (i % 3));
        mark(m.id, "done");
      });
    });
    at(650 + actors.length * 780, () => setBusy(false));
  }

  function runChain(task: string, actors: RosterTwyn[], startAt = 400, done?: () => void) {
    let t = startAt;
    actors.forEach((m, i) => {
      at(t, () => {
        setTyping([m.id]);
        mark(m.id, "working");
      });
      const dur = 950 + (i % 2) * 300;
      at(t + dur, () => {
        setTyping([]);
        say(m.id, replyFor(m, task, i > 0 ? actors[i - 1].name : undefined));
        tick(m.id, 4 + i);
        mark(m.id, "done");
      });
      t += dur + 480;
    });
    at(t, () => (done ? done() : setBusy(false)));
  }

  function runConditional(task: string, actors: RosterTwyn[]) {
    const [first, ...rest] = actors;
    at(450, () => {
      setTyping([first.id]);
      mark(first.id, "working");
    });
    at(1450, () => {
      setTyping([]);
      say(first.id, replyFor(first, task));
      tick(first.id, 5);
      mark(first.id, "done");
      if (rest.length) {
        pending.current = { task, actors: rest };
        at(450, () =>
          push({
            id: nid(),
            senderId: "system",
            kind: "approval",
            content: "",
            awaiting: true,
            gateFor: rest[0].name,
          }),
        );
        // busy stays true — the gate holds the run until the user approves.
      } else {
        setBusy(false);
      }
    });
  }

  // ---- persona lead ---------------------------------------------------------

  function runPersonaLead(task: string) {
    if (!lead) return;
    at(450, () => {
      setTyping([lead.id]);
      mark(lead.id, "working");
    });
    const brief = task.length > 48 ? `${task.slice(0, 48)}…` : task;
    at(1300, () => {
      setTyping([]);
      say(lead.id, `On it — “${brief}”. I'll coordinate the team and bring you one clean result.`);
    });
    const workId = nid();
    at(1650, () =>
      push({ id: workId, senderId: lead.id, kind: "work", content: "", steps: [], stepsTotal: workers.length }),
    );
    workers.forEach((w, i) => {
      at(2100 + i * 850, () => mark(w.id, "working"));
      at(2300 + i * 850, () => {
        setMessages((ms) =>
          ms.map((m) =>
            m.id === workId ? { ...m, steps: [...(m.steps ?? []), { memberId: w.id, line: didFor(w) }] } : m,
          ),
        );
        tick(w.id, 3 + (i % 3));
        mark(w.id, "done");
      });
    });
    const end = 2300 + workers.length * 850;
    at(end + 250, () => setTyping([lead.id]));
    at(end + 1400, () => {
      setTyping([]);
      const credit = workers.map((w) => `${lastName(w.name)} ${didFor(w)}`).join(", ");
      say(lead.id, `Done. ${credit} — I pulled it into one brief for you. Want me to send it or refine anything?`);
      tick(lead.id, 6);
      mark(lead.id, "done");
      setBusy(false);
    });
  }

  // ---- public API -----------------------------------------------------------

  // Direct 1:1 — you address a single teammate; only they respond.
  function runDirect(task: string, m: RosterTwyn) {
    setStatus({ [m.id]: "working" });
    at(400, () => setTyping([m.id]));
    at(1400, () => {
      setTyping([]);
      say(m.id, replyFor(m, task));
      tick(m.id, 4);
      mark(m.id, "done");
      setBusy(false);
    });
  }

  // target: "all" (the whole team) or a member id (one teammate / the lead).
  function send(text: string, target: string = "all") {
    const task = text.trim();
    if (!task || busy) return;
    push({ id: nid(), senderId: "user", content: task, kind: "text", to: target });
    setBusy(true);

    // Addressed to one teammate.
    if (target !== "all") {
      const m = members.find((x) => x.id === target);
      if (!m) {
        setBusy(false);
        return;
      }
      // Talking to a persona lead → they coordinate the team behind the scenes.
      if (lead && target === lead.id && team.leadModel === "persona") {
        queueAll(members.map((x) => x.id));
        runPersonaLead(task);
      } else {
        runDirect(task, m);
      }
      return;
    }

    // Addressed to everyone.
    if (team.leadModel === "persona" && lead) {
      queueAll(members.map((m) => m.id));
      runPersonaLead(task);
      return;
    }
    const actors = members;
    queueAll(actors.map((m) => m.id));
    if (team.collaboration === "sequential") runChain(task, actors);
    else if (team.collaboration === "conditional") runConditional(task, actors);
    else runParallel(task, actors);
  }

  function approve() {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    setMessages((ms) => ms.map((m) => (m.kind === "approval" && m.awaiting ? { ...m, awaiting: false } : m)));
    runChain(p.task, p.actors, 500);
  }

  const walletUsed = Object.values(usage).reduce((a, b) => a + b, 0);

  return { messages, typing, usage, busy, walletUsed, status, send, approve };
}

function introMessage(team: Team, lead: RosterTwyn | null, workers: RosterTwyn[]): TeamMsg {
  if (team.leadModel === "persona" && lead) {
    return {
      id: "tm-1",
      senderId: lead.id,
      kind: "text",
      content: `Hi — I'm ${lead.name}, leading ${team.name}. Tell me what you need and I'll coordinate ${workers.length} teammate${workers.length === 1 ? "" : "s"} behind the scenes, then bring you the result.`,
    };
  }
  return {
    id: "tm-1",
    senderId: "system",
    kind: "text",
    content: `You're the lead of ${team.name}. Assign a task and the team jumps in — ${team.collaboration}.`,
  };
}
