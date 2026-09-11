"use client";

import { useCallback, useRef, useState } from "react";
import type { AttachmentMeta, ChatArtifact, ChatMessage, ToolIcon } from "../types";

// How long a dropped document "indexes" before flipping to Ready (prototype —
// real indexing is backend).
const INDEX_MS = 1500;

const INTRO_TEMPLATE = (firstName: string) =>
  `Hi ${firstName} — I'm your twyn. I can summarize docs, draft replies, schedule meetings, run quick research, and run your equipped workflows — try "run my morning brief" to watch one on the Canvas. Pick a quick start below, or tell me what you're working on.`;

const REPLIES: Array<{ match: RegExp; reply: string }> = [
  {
    // A long, richly-formatted answer — headings, nested lists, inline code — to
    // exercise the chat's markdown rendering. Ask e.g. "why use environment
    // variables instead of hard-coding?".
    match: /environment variable|env var|hard.?cod|\.env|why.*variable/i,
    reply: `## Why use environment variables instead of hard-coding?

Typical reasons **we** do it this way:

**Different values per environment**
- Dev, staging, production all use different:
  - DB URLs
  - API endpoints
  - Secrets
- Code stays the same; only env vars change.

**Security**
- Don't commit secrets (API keys, passwords) to Git.
- Keep them in:
  - \`.env\` (ignored by git)
  - Secret managers (AWS Secrets Manager, Vault, etc.)
  - CI/CD or platform config

**Flexibility**
- Change behaviour without redeploying code.
- Toggle features per environment.

### How "fixed" fits into this
- Some values are effectively fixed (e.g. \`APP_NAME\`, \`DEFAULT_LOCALE\`).
- We still keep them as env vars if they differ per deployment (e.g. white-label apps), or when Ops wants control without code changes.

Otherwise, we just hard-code them as constants in code.`,
  },
  {
    match: /summari[sz]e|summary|doc/i,
    reply:
      "Drop the doc into chat and I'll send back a 1-page brief with the load-bearing claims and citations.",
  },
  {
    match: /email|draft|outreach|reply/i,
    reply:
      "I'll write three drafts at different tones — direct, warm, and concise. Approve one or tell me what to tweak.",
  },
  {
    match: /schedule|timezone|meet|calendar/i,
    reply:
      "Share who's involved (or paste names) and I'll find 3 slots that respect everyone's working hours.",
  },
  {
    match: /research|investigate|find/i,
    reply:
      "Give me the question — I'll come back with 5 credible sources, the consensus, and where they disagree.",
  },
];

function findReply(text: string) {
  for (const r of REPLIES) if (r.match.test(text)) return r.reply;
  return "Give me a bit more context — what are you actually trying to ship?";
}

// Some intents make the twyn reach for tools — those runs stream into the chat
// as a subtle activity log before the reply lands (story 6).
const TOOLS: Array<{ match: RegExp; steps: Array<{ label: string; icon: ToolIcon }> }> = [
  {
    match: /research|investigate|find/i,
    steps: [
      { label: "Searching the web", icon: "search" },
      { label: "Reading 5 sources", icon: "doc" },
    ],
  },
  {
    match: /schedule|timezone|meet|calendar/i,
    steps: [
      { label: "Checking your calendar", icon: "calendar" },
      { label: "Finding overlapping slots", icon: "clock" },
    ],
  },
  {
    match: /email|draft|outreach|reply/i,
    steps: [{ label: "Pulling the latest thread", icon: "mail" }],
  },
];

function toolsFor(text: string) {
  for (const t of TOOLS) if (t.match.test(text)) return t.steps;
  return [];
}

// Research turns produce a Canvas artifact — a competitor-pricing brief the
// twyn compiles from its sources. It surfaces as an inline card in the thread
// that expands into the Canvas (Claude-style). Other intents don't build one.
const PRICING_ARTIFACT: ChatArtifact = {
  id: "competitor-pricing",
  title: "Competitor Pricing",
  subtitle: "Research brief · 3 sources",
  kind: "document",
};

function artifactFor(text: string): ChatArtifact | undefined {
  return /research|investigate|find|pricing|competitor/i.test(text)
    ? PRICING_ARTIFACT
    : undefined;
}

// Running an *equipped workflow* is different from a one-off research turn: it
// produces a run the user watches on the Canvas (the run board), which in turn
// produces the morning brief. Triggered by "run my morning brief", "catch me up",
// or just "run the workflow".
export const WORKFLOW_RUN_ARTIFACT: ChatArtifact = {
  id: "morning-brief-run",
  title: "Morning Brief",
  subtitle: "Example run · 6 steps",
  kind: "workflow",
  workflowId: "wf-morning-brief",
};

function isWorkflowRun(text: string) {
  return (
    /(^|\s)(run|start|execute|kick off)\b.*(morning|brief|inbox|workflow)/i.test(text) ||
    /morning brief|catch me up/i.test(text)
  );
}

export const WORKFLOW_RUN_REPLY =
  "On it — here's an example **Morning Brief** on sample data, so you can see how a workflow runs. Watch it on the Canvas → I'll check with you before sending anything.";

function replyForFiles(files: AttachmentMeta[], text: string) {
  const label =
    files.length === 1 ? files[0].name : `${files.length} documents`;
  if (text) {
    return `Got it — I've read ${label} and I'll factor it into my answer. ${findReply(text)}`;
  }
  return `I've indexed ${label} — ask me anything about it and I'll answer straight from the document.`;
}

export function useTypingChat(firstName = "Sara") {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m1", role: "twyn", content: INTRO_TEMPLATE(firstName) },
  ]);
  const [typing, setTyping] = useState(false);
  const idRef = useRef(2);

  // Send a message — optionally with documents attached. Attached docs land in
  // the user's own bubble showing "Indexing…", flip to "Ready", then the twyn
  // confirms it can answer against them (real indexing is backend).
  const send = useCallback((text: string, files: AttachmentMeta[] = []) => {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;

    const userId = `m${idRef.current++}`;
    setMessages((m) => [
      ...m,
      {
        id: userId,
        role: "user",
        content: trimmed,
        attachments: files.length
          ? files.map((f) => ({ ...f, status: "indexing" as const }))
          : undefined,
      },
    ]);

    if (files.length === 0) {
      // Workflow run — the twyn kicks it off and points to the Canvas run board.
      if (isWorkflowRun(trimmed)) {
        setTyping(true);
        setTimeout(() => {
          setMessages((m) => [
            ...m,
            {
              id: `m${idRef.current++}`,
              role: "twyn",
              content: WORKFLOW_RUN_REPLY,
              artifact: WORKFLOW_RUN_ARTIFACT,
            },
          ]);
          setTyping(false);
        }, 900);
        return;
      }

      const reply = findReply(trimmed);
      const steps = toolsFor(trimmed);
      const artifact = artifactFor(trimmed);

      // No tools needed — straight typing → reply.
      if (steps.length === 0) {
        setTyping(true);
        setTimeout(() => {
          setMessages((m) => [
            ...m,
            { id: `m${idRef.current++}`, role: "twyn", content: reply, artifact },
          ]);
          setTyping(false);
        }, 900);
        return;
      }

      // Tools: brief think, then stream each tool (running → done), then the reply.
      setTyping(true);
      const msgId = `m${idRef.current++}`;
      setTimeout(() => {
        setTyping(false);
        setMessages((m) => [
          ...m,
          {
            id: msgId,
            role: "twyn",
            content: "",
            tools: steps.map((s, i) => ({
              id: `${msgId}-t${i}`,
              label: s.label,
              icon: s.icon,
              status: "running" as const,
            })),
          },
        ]);
        steps.forEach((_, i) => {
          setTimeout(() => {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === msgId && msg.tools
                  ? {
                      ...msg,
                      tools: msg.tools.map((t, ti) =>
                        ti === i ? { ...t, status: "done" as const } : t
                      ),
                    }
                  : msg
              )
            );
          }, 750 * (i + 1));
        });
        setTimeout(() => {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === msgId ? { ...msg, content: reply, artifact } : msg
            )
          );
        }, 750 * steps.length + 450);
      }, 600);
      return;
    }

    // Documents attached: index them, then reply.
    setTimeout(() => {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === userId && msg.attachments
            ? { ...msg, attachments: msg.attachments.map((a) => ({ ...a, status: "ready" as const })) }
            : msg
        )
      );
      setTyping(true);
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          { id: `m${idRef.current++}`, role: "twyn", content: replyForFiles(files, trimmed) },
        ]);
        setTyping(false);
      }, 900);
    }, INDEX_MS);
  }, []);

  const pushTwyn = useCallback((content: string) => {
    setMessages((m) => [
      ...m,
      { id: `m${idRef.current++}`, role: "twyn", content },
    ]);
  }, []);

  // Add a user bubble without generating a reply — used when the parent intercepts
  // a message (e.g. a workflow trigger) and drives the response itself.
  const pushUser = useCallback((content: string) => {
    setMessages((m) => [
      ...m,
      { id: `m${idRef.current++}`, role: "user", content },
    ]);
  }, []);

  // Start a fresh conversation — back to the opening greeting.
  const reset = useCallback(() => {
    setTyping(false);
    idRef.current = 2;
    setMessages([{ id: "m1", role: "twyn", content: INTRO_TEMPLATE(firstName) }]);
  }, [firstName]);

  return { messages, typing, send, pushTwyn, pushUser, reset };
}
