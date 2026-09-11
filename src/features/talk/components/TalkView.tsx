"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Blocks,
  Clock,
  Columns2,
  PanelRightClose,
  Plus,
  Upload,
  UserRoundPen,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import type { Twyn } from "@/features/my-twyns/types";
import { SARA } from "@/features/shared/data/personas";
import {
  useTypingChat,
  WORKFLOW_RUN_ARTIFACT,
  WORKFLOW_RUN_REPLY,
} from "../hooks/useTypingChat";
import { VideoPanel, type TalkMode } from "./VideoPanel";
import { useAvatarStatus } from "@/features/shared/hooks/useAvatarStatus";
import { startAvatarProcessing } from "@/features/shared/lib/avatar";
import { VideoCaptureDialog } from "@/features/onboarding/components/VideoCaptureDialog";
import { StageToggle } from "./StageToggle";
import { CanvasPanel } from "./CanvasPanel";
import { McpAppPanel, type AppFrame } from "./McpAppPanel";
import { getApp, matchApp, type AppDescriptor, type Intent } from "../data/mcp-apps";
import {
  assignLeadOwner, createLead, getCrm, logActivity, moveDeal, resetCrm,
} from "../lib/crm-store";
import { ChatThread } from "./ChatThread";
import { ChatInput } from "./ChatInput";
import { LimitNotice } from "./LimitNotice";
import { DevStatePanel } from "./DevStatePanel";
import { useLimit } from "@/features/shared/hooks/useLimit";
import { useTier } from "@/features/shared/hooks/useTier";
import { UpgradePlansModal } from "./UpgradePlansModal";
import { TwynVideosDialog, type VideoKind } from "@/features/onboarding/components/TwynVideosDialog";
import { getChosenAvatar, hasOwnFootage, onAvatarChoiceChanged } from "@/features/shared/lib/avatarChoice";
import { ConversationHistory } from "./ConversationHistory";
import { AccountMenu } from "@/features/shared/components/AccountMenu";
import { TalkTour, type TourStep } from "./TalkTour";
import { ConnectDialog, type Provider } from "./ConnectDialog";
import {
  WorkshopPanel,
  WORKSHOP_DND_TYPE,
} from "./WorkshopPanel";
import { WorkflowDetailsDialog, type Schedule } from "./WorkflowDetailsDialog";
import { EquippedBar } from "./EquippedBar";
import {
  DEFAULT_EQUIPPED,
  buildOwnedCatalog,
  getWorkflow,
  slashFor,
  TAB_MAX,
  type WorkshopItem,
  type WorkshopTab,
} from "../data/workshop";
import {
  getPurchases,
  onPurchasesChanged,
  type PurchasedItem,
} from "@/features/shared/lib/purchases";
import {
  builtCatalog,
  onBuiltWorkflowsChanged,
} from "@/features/workflows/lib/built";
import { describeFiles } from "../lib/attachments";
import type { AttachmentMeta, ChatArtifact } from "../types";
import { cn } from "@/lib/utils";

// Run layout work before paint on the client (no flash), fall back to useEffect
// on the server so SSR doesn't warn.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Onboarding tour — fires on landing in the studio, every visit (no localStorage).
const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to your studio",
    body: "Talk to your twyn live on the left, or by text on the right. Open the Equip panel to connect tools, add skills, and load knowledge — let's take a quick look.",
    cta: "Take the tour",
    placement: "center",
    hideCount: true,
  },
  {
    title: "Open the Equip panel",
    body: "This is where you equip your twyn — connect tools, add skills, and load knowledge anytime.",
    cta: "Open Equip",
    target: '[data-tour="workshop"]',
    placement: "bottom",
  },
  {
    title: "Connect Gmail",
    body: "Let Sara read your inbox and draft replies in your voice — securely. You approve every send.",
    cta: "Connect Gmail",
    target: '[data-tour="ic-gmail"]',
    placement: "left",
  },
  {
    title: "Connect Microsoft Azure",
    body: "Connect to your work calendar, docs, and Teams. Sara can schedule, summarize, and search across them.",
    cta: "Connect Azure",
    target: '[data-tour="ic-azure"]',
    placement: "left",
  },
  {
    title: "Equip your twyn in real time",
    body: "Skills, interconnectors and knowledge all live here. Drag any item into the chat to equip it, or just hit Add — your slots show below the chat.",
    cta: "Now watch me work",
    target: '[data-tour="tabs"]',
    placement: "left",
  },
  // --- Workflow chapter: chains straight on from connecting tools, and is NOT
  // numbered — it's one continuous narrated run, not a wizard. The twyn runs a
  // real, solo (tool-level) job and you watch; the only thing you touch is the
  // approval. The two `auto` beats are advanced by the run itself.
  {
    title: "This is a workflow",
    body: "Tools connected — now let me use them. Here's your Morning Brief: I scan your inbox and calendar and surface what needs you. I'll run it as an example on sample data.",
    cta: "Run it",
    target: '[data-tour="wf-row"]',
    placement: "left",
    hideCount: true,
  },
  {
    title: "Watch me work",
    body: "I'm running it now — each row is a real step across your tools. Green's done, violet's live. No node canvas, no setup.",
    cta: "Running…",
    target: '[data-tour="wf-run"]',
    placement: "left",
    auto: true,
    hideCount: true,
  },
  {
    title: "You're always in control",
    body: "Before I send those replies for you, I stop and ask. Nothing leaves without your say-so — go ahead and approve them.",
    cta: "Approve",
    target: '[data-tour="wf-approve"]',
    placement: "left",
    hideCount: true,
  },
  {
    title: "Done — while you watched",
    body: "That whole job just ran itself. The brief's ready here in the Canvas. Add more anytime from the Workflows tab — or soon, just do something once and I'll save it.",
    cta: "Got it",
    target: '[data-tour="wf-run"]',
    placement: "left",
    hideCount: true,
  },
];

export type StartMode = "chat" | "voice" | "video";

export function TalkView({ twyn, initialMode }: { twyn: Twyn; initialMode?: StartMode }) {
  // The twyn greets the signed-in user (Sara), not itself.
  const { messages, typing, send, pushTwyn, pushUser, reset } = useTypingChat(
    SARA.name.split(" ")[0]
  );
  // A card can request a "pure" start: chat = text only; voice / video = the
  // live stage full-screen, with chat closed (one tap on "Show chat" brings it
  // back). No param (e.g. onboarding) keeps the default split view.
  const [chatOpen, setChatOpen] = useState(initialMode !== "voice" && initialMode !== "video");
  // Free trial avatars are a still image (no Tavus animation).
  const { tier: currentTier, hasCustom } = useTier();
  // Avatar image the user picked in onboarding (stock replica or captured still);
  // falls back to the seed portrait. `ownFootage` = we already hold the user's
  // video, so the upgrade can process it without asking for a clip again.
  const [avatarImage, setAvatarImage] = useState(twyn.portrait);
  const [ownFootage, setOwnFootage] = useState(false);
  useEffect(() => {
    const load = () => {
      setAvatarImage(getChosenAvatar(twyn.id) ?? twyn.portrait);
      // Dev preview: ?face=own|stock forces the free-tier avatar source (own
      // upload → static "Make it move"; stock → moving "Make it your own"),
      // otherwise use the real onboarding choice.
      const face = new URLSearchParams(window.location.search).get("face");
      setOwnFootage(face === "own" ? true : face === "stock" ? false : hasOwnFootage(twyn.id));
    };
    load();
    return onAvatarChoiceChanged(load);
  }, [twyn.id, twyn.portrait]);
  // Account limit reached — blocks the composer and shows a notice in the chat.
  // Shared with the sidebar/nav so a blocked account looks blocked everywhere.
  const limit = useLimit();
  // A subscription-over state reads as a trial ending (free tier) or a paid plan
  // lapsing (any paid tier) — a trial is just a form of subscription.
  const subPlan: "trial" | "paid" = currentTier.id === "free-trial" ? "trial" : "paid";
  // Entry mode. Default (no param, e.g. from onboarding) is untouched: avatar
  // stage. A twyn card can request a specific start — chat (text only), voice
  // (audio stage), or video (avatar stage) — via ?start=.
  const [mode, setMode] = useState<TalkMode>(initialMode === "voice" ? "audio" : "avatar");
  // Avatar training state. While processing, the avatar screen shows progress and
  // the studio defaults to voice (audio works right away).
  const realAvatar = useAvatarStatus(twyn.id, twyn.name);
  // Dev preview: show the "avatar is being built / failed" view without invoking
  // real processing. Forced by ?avatar=processing and ?avatar=failed, and by
  // ?tier=basic|paid — so devs can load the Basic studio and immediately see what
  // an upgrade looks like while the avatar trains, or see the failed-quality
  // screen. These previews work on ANY tier (VideoPanel honours `avatarForced`).
  const [forcedState, setForcedState] = useState<"processing" | "failed" | "ready" | null>(null);
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const tier = sp.get("tier");
    const a = sp.get("avatar");
    // Explicit ?avatar= wins; otherwise Basic defaults to a just-built avatar
    // that's still training (the post-upgrade view).
    if (a === "failed") setForcedState("failed");
    else if (a === "ready") setForcedState("ready");
    else if (a === "processing" || tier === "basic" || tier === "paid") setForcedState("processing");
  }, []);
  const forcedAvatar = forcedState !== null;
  const avatar =
    forcedState === "processing"
      ? { state: "processing" as const, progress: 0.4, reason: undefined }
      : forcedState === "failed"
        ? {
            state: "failed" as const,
            progress: 1,
            reason: "The video was too dark — find brighter, even lighting and redo.",
          }
        : forcedState === "ready"
          ? { state: "ready" as const, progress: 1, reason: undefined }
          : realAvatar;
  // When a start mode is explicitly chosen from a card, respect it — don't let
  // the "avatar not ready → default to voice" fallback override the choice.
  const didDefaultAudio = useRef(!!initialMode);
  // Re-record dialog, opened from the failed-avatar screen.
  const [redoOpen, setRedoOpen] = useState(false);
  // In-studio upgrade ("Make it move" / "Make it your own" on a free avatar).
  // Two steps, same as onboarding: capture the two videos (consent + training),
  // then pick a plan and hand off to Stripe Checkout in a new tab. The tier flips
  // on Stripe's return (devs), so nothing here mutates the tier.
  const [upgradeStage, setUpgradeStage] = useState<"videos" | "plans" | null>(null);
  // The two clips for the upgrade. Own-footage users ("Make it move") already
  // recorded these in onboarding, so both start ready (with the avatar still as
  // the training poster); stock users ("Make it your own") start empty.
  const [consentDone, setConsentDone] = useState(false);
  const [trainingDone, setTrainingDone] = useState(false);
  const [trainingPoster, setTrainingPoster] = useState<string | null>(null);
  const openUpgrade = () => {
    setConsentDone(ownFootage);
    setTrainingDone(ownFootage);
    setTrainingPoster(ownFootage ? avatarImage : null);
    setUpgradeStage("videos");
  };
  const setVideo = (kind: VideoKind, done: boolean, poster?: string | null) => {
    if (kind === "consent") setConsentDone(done);
    else {
      setTrainingDone(done);
      if (poster !== undefined) setTrainingPoster(poster);
    }
  };
  const [historyOpen, setHistoryOpen] = useState(false);
  const [workshopOpen, setWorkshopOpen] = useState(false);
  const [canvasOpen, setCanvasOpen] = useState(false);
  // Which artifact the Canvas is showing — a document brief, or a workflow run
  // (which opens the Canvas to its live run board).
  const [canvasArtifact, setCanvasArtifact] = useState<ChatArtifact | null>(null);
  // Canvas navigation for MCP apps. A stack, not history: drilling from the
  // board into a deal's gate pushes, Back pops. Opening an app from the chat
  // (a trigger phrase, or an inline card) starts a fresh stack.
  const [appStack, setAppStack] = useState<AppFrame[]>([]);
  // Whether a live stage (avatar OR audio) is active. Studio opens straight into
  // the avatar (the signature experience). Ending it drops back to text chat;
  // from chat you can restart in Avatar OR Audio (audio never routes through the
  // paid avatar).
  const [inCall, setInCall] = useState(initialMode !== "chat");
  // The Canvas is only available once the twyn has produced an artifact — it
  // surfaces inline in the thread first (Claude-style), and the Canvas opens
  // from there. Derived so the toggle enables the moment a card appears.
  // Workflows built in the Twynity Workflow Builder (or imported through it) —
  // merged into the owned catalog so they equip, run, and resolve in the slot
  // bar. Authoring happens on the Workflows/Workshop surface, not the studio, so
  // there's no add action here — we just read the store and stay in sync.
  const [imported, setImported] = useState<WorkshopItem[]>([]);
  useEffect(() => {
    const sync = () => setImported(builtCatalog());
    sync();
    return onBuiltWorkflowsChanged(sync);
  }, []);
  // User-set trigger phrases (workflowId → phrase). "Teach your twyn a word": say
  // the phrase, or its /slash, and the workflow runs. Overrides the default.
  const [triggers, setTriggers] = useState<Record<string, string>>({});
  // Per-workflow schedule (run automatically at a time of day) + which workflow's
  // details panel is open.
  const [schedules, setSchedules] = useState<Record<string, Schedule>>({});
  const [detailsItem, setDetailsItem] = useState<WorkshopItem | null>(null);
  const DEFAULT_SCHEDULE: Schedule = { enabled: false, time: "08:00", freq: "weekdays" };
  const hasCanvas = useMemo(() => messages.some((m) => !!m.artifact), [messages]);
  // The artifact the Canvas shows: whatever the user last expanded, else the first
  // one produced. A workflow artifact opens the Canvas to its live run board.
  const firstArtifact = useMemo(
    () => messages.find((m) => m.artifact)?.artifact ?? null,
    [messages]
  );
  const shownArtifact = canvasArtifact ?? firstArtifact;
  const shownWorkflowDef =
    shownArtifact?.kind === "workflow"
      ? getWorkflow(shownArtifact.workflowId) ??
        imported.find((i) => i.id === shownArtifact.workflowId)?.workflow
      : undefined;
  const canvasWorkflow =
    shownArtifact && shownWorkflowDef
      ? { name: shownArtifact.title, def: shownWorkflowDef }
      : undefined;
  // An "app" artifact opens the Canvas to an MCP app, drawn from its descriptor.

  // Quick-start chips are starter suggestions — hide them once the chat begins.
  const [hasSent, setHasSent] = useState(false);
  const [workshopTab, setWorkshopTab] = useState<WorkshopTab>("interconnectors");
  const [equipped, setEquipped] = useState<string[]>(DEFAULT_EQUIPPED);
  // The chat is a drop zone for two things: Workshop items (equip) and real
  // documents (attach to the next message). Track which is being dragged so the
  // target state reads correctly.
  const [dragKind, setDragKind] = useState<"equip" | "file" | null>(null);
  // Documents staged in the composer, sent together with the next message.
  const [pendingFiles, setPendingFiles] = useState<AttachmentMeta[]>([]);
  // Everything this twyn owns: free defaults + built + marketplace purchases.
  const [purchases, setPurchases] = useState<PurchasedItem[]>([]);
  useEffect(() => {
    const load = () => setPurchases(getPurchases(twyn.id));
    load();
    return onPurchasesChanged(load);
  }, [twyn.id]);
  // On landing, if a CUSTOM avatar isn't ready yet (processing or failed), open
  // in voice — the avatar screen isn't live. Free trials always have a live
  // (static) avatar stage, so they never auto-switch — and a stale processing
  // record from a prior upgrade must not bump a free user off the avatar. One-
  // time so the user can still click Avatar to watch progress or redo a failure.
  useEffect(() => {
    // ?avatar=processing|failed is a dev preview — keep it on the avatar view
    // rather than auto-switching to voice.
    if (!didDefaultAudio.current && !forcedAvatar && hasCustom && avatar.state !== "ready") {
      didDefaultAudio.current = true;
      setMode("audio");
    }
  }, [avatar.state, forcedAvatar, hasCustom]);
  const ownedCatalog = useMemo(
    () => [...buildOwnedCatalog(purchases), ...imported],
    [purchases, imported]
  );
  const getOwned = (id: string) => ownedCatalog.find((i) => i.id === id);
  // Tour: -1 = inactive, 0..2 = active step. `connect` opens the OAuth modal
  // (and pauses the tour overlay while it's open).
  const [tourStep, setTourStep] = useState(-1);
  const [connect, setConnect] = useState<Provider | null>(null);
  // Interconnectors are added by default; `connected` tracks OAuth status.
  const [connected, setConnected] = useState<Set<string>>(new Set());
  // After the tour is skipped, a pulsing dot lingers on the workshop icon.
  const [showTourDot, setShowTourDot] = useState(false);
  // True while the workshop slides open between the welcome and the first
  // spotlight step — holds a continuous dim so the spotlight lands settled.
  const [tourOpening, setTourOpening] = useState(false);
  const tourTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const videoColRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const canvasColRef = useRef<HTMLDivElement>(null);
  const canvasHandleRef = useRef<HTMLDivElement>(null);

  const equippedSet = new Set(equipped);

  // Restore / clear the persisted video width when the chat opens/closes. Runs
  // before paint (layout effect) so the stage never flashes at an un-sized width
  // when it (re)mounts — e.g. switching from chat back to avatar/audio.
  useIsoLayoutEffect(() => {
    const panel = videoColRef.current;
    if (!panel) return;
    // Fixed width whenever chat or canvas sits beside the stage; cleared (fills)
    // only when the stage is full-screen.
    if (chatOpen || canvasOpen) {
      const saved = parseInt(localStorage.getItem("twynity_video_w2") || "", 10);
      panel.style.width = `${saved && saved >= 260 ? saved : 432}px`;
    } else {
      panel.style.width = "";
    }
  }, [chatOpen, workshopOpen, canvasOpen, inCall]);

  // Drag-to-resize the video↔chat divider. Bypass React during the drag —
  // write panel.style.width directly on every move (no setState, no width
  // transition), persist to localStorage on drag end. (See page-05 spec.)
  useEffect(() => {
    const handle = handleRef.current;
    const panel = videoColRef.current;
    if (!handle || !panel) return;
    const MIN = 260;
    const MAX_PCT = 0.75;

    function startDrag(clientX: number) {
      const startX = clientX;
      const startW = panel!.getBoundingClientRect().width;
      const rowW = panel!.parentElement!.getBoundingClientRect().width;
      const maxW = Math.max(MIN + 100, rowW * MAX_PCT);
      handle!.classList.add("is-active");
      document.body.classList.add("is-resizing");

      const onMove = (x: number) => {
        const w = Math.min(maxW, Math.max(MIN, startW + (x - startX)));
        panel!.style.width = `${w}px`;
      };
      const mm = (e: MouseEvent) => onMove(e.clientX);
      const tm = (e: TouchEvent) => {
        if (e.touches[0]) {
          onMove(e.touches[0].clientX);
          e.preventDefault();
        }
      };
      const stop = () => {
        handle!.classList.remove("is-active");
        document.body.classList.remove("is-resizing");
        document.removeEventListener("mousemove", mm);
        document.removeEventListener("mouseup", stop);
        document.removeEventListener("touchmove", tm);
        document.removeEventListener("touchend", stop);
        localStorage.setItem("twynity_video_w2", String(parseInt(panel!.style.width, 10)));
      };
      document.addEventListener("mousemove", mm);
      document.addEventListener("mouseup", stop);
      document.addEventListener("touchmove", tm, { passive: false });
      document.addEventListener("touchend", stop);
    }

    const md = (e: MouseEvent) => {
      e.preventDefault();
      startDrag(e.clientX);
    };
    const ts = (e: TouchEvent) => {
      if (e.touches[0]) startDrag(e.touches[0].clientX);
    };
    handle.addEventListener("mousedown", md);
    handle.addEventListener("touchstart", ts, { passive: true });
    return () => {
      handle.removeEventListener("mousedown", md);
      handle.removeEventListener("touchstart", ts);
    };
  }, [chatOpen, workshopOpen, canvasOpen, inCall]);

  // Restore the persisted canvas width (a CSS var on the panel) before paint, so
  // it opens at the user's size with no flash. Mobile ignores the var (w-full).
  useIsoLayoutEffect(() => {
    const panel = canvasColRef.current;
    if (!panel || !canvasOpen) return;
    const saved = parseInt(localStorage.getItem("twynity_canvas_w") || "", 10);
    panel.style.setProperty("--canvas-w", `${saved && saved >= 360 ? saved : 620}px`);
  }, [canvasOpen]);

  // Drag-to-resize the chat↔canvas divider (canvas is on the right, so dragging
  // left widens it). Same bypass-React approach as the video handle.
  useEffect(() => {
    const handle = canvasHandleRef.current;
    const panel = canvasColRef.current;
    if (!handle || !panel) return;
    const MIN = 360;
    const MAX_PCT = 0.7;

    function startDrag(clientX: number) {
      const startX = clientX;
      const startW = panel!.getBoundingClientRect().width;
      const rowW = panel!.parentElement!.getBoundingClientRect().width;
      const maxW = Math.max(MIN + 100, rowW * MAX_PCT);
      let lastW = startW;
      handle!.classList.add("is-active");
      document.body.classList.add("is-resizing");

      const onMove = (x: number) => {
        lastW = Math.min(maxW, Math.max(MIN, startW - (x - startX)));
        panel!.style.setProperty("--canvas-w", `${lastW}px`);
      };
      const mm = (e: MouseEvent) => onMove(e.clientX);
      const tm = (e: TouchEvent) => {
        if (e.touches[0]) {
          onMove(e.touches[0].clientX);
          e.preventDefault();
        }
      };
      const stop = () => {
        handle!.classList.remove("is-active");
        document.body.classList.remove("is-resizing");
        document.removeEventListener("mousemove", mm);
        document.removeEventListener("mouseup", stop);
        document.removeEventListener("touchmove", tm);
        document.removeEventListener("touchend", stop);
        localStorage.setItem("twynity_canvas_w", String(Math.round(lastW)));
      };
      document.addEventListener("mousemove", mm);
      document.addEventListener("mouseup", stop);
      document.addEventListener("touchmove", tm, { passive: false });
      document.addEventListener("touchend", stop);
    }

    const md = (e: MouseEvent) => {
      e.preventDefault();
      startDrag(e.clientX);
    };
    const ts = (e: TouchEvent) => {
      if (e.touches[0]) startDrag(e.touches[0].clientX);
    };
    handle.addEventListener("mousedown", md);
    handle.addEventListener("touchstart", ts, { passive: true });
    return () => {
      handle.removeEventListener("mousedown", md);
      handle.removeEventListener("touchstart", ts);
    };
  }, [canvasOpen]);

  const equip = (item: WorkshopItem) => {
    if (equippedSet.has(item.id)) return;
    const inTab = equipped.filter((id) => getOwned(id)?.tab === item.tab).length;
    if (inTab >= TAB_MAX[item.tab]) return;
    setEquipped((e) => [...e, item.id]);
    pushTwyn(
      `Got it — I've equipped **${item.name}**. I can use it right away.`
    );
  };

  const unequip = (id: string) => {
    setEquipped((e) => e.filter((x) => x !== id));
  };

  const handleAdd = (item: WorkshopItem) => equip(item);
  const handleRemove = (item: WorkshopItem) => unequip(item.id);

  // Run an equipped workflow from the Equip panel — opens its live run in the
  // Canvas. The Canvas renders the right panel for the workflow's source fidelity
  // (live board / polled board / status card).
  const handleRunWorkflow = (item: WorkshopItem) => {
    if (!item.workflow) return;
    pushTwyn(`Running **${item.name}**${item.workflow.demo ? " — an example on sample data" : ""}. Watch it on the Canvas →`);
    openArtifact({
      id: `${item.id}-run`,
      title: item.name,
      subtitle: "Workflow run",
      kind: "workflow",
      workflowId: item.id,
    });
  };

  // Run an MCP app from a trigger phrase. The twyn answers in the thread and the
  // app surfaces as an inline card; the Canvas opens from there. Nothing about
  // the app is hardcoded here — the descriptor carries the reply and the blocks.
  const openApp = (app: AppDescriptor, params?: Record<string, string>) => {
    // The reply is part of the descriptor and may interpolate live data, so the
    // twyn's wording reflects the pipeline as it stands right now.
    const data = app.data(getCrm(), params);
    const fill = (t: string) =>
      t.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => String(data[k] ?? ""));
    pushTwyn(fill(app.reply));
    openArtifact({
      id: `${app.id}-${params?.deal ?? "view"}`,
      title: fill(app.title),
      subtitle: fill(app.subtitle ?? "App"),
      kind: "app",
      appId: app.id,
      appParams: params,
    });
  };

  // Drill into another app from inside one — pushes onto the trail. Opening the
  // same app for a different record replaces the top frame instead of stacking
  // near-identical entries.
  const navigateToApp = (frame: AppFrame) => {
    setAppStack((s) => {
      if (s.length === 0) return [frame];
      const top = s[s.length - 1];
      return top.appId === frame.appId
        ? [...s.slice(0, -1), frame]
        : [...s, frame];
    });
    setWorkshopOpen(false);
    setChatOpen(true);
    setCanvasOpen(true);
  };
  const goBackInCanvas = () =>
    setAppStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const goToCrumb = (index: number) =>
    setAppStack((s) => s.slice(0, index + 1));

  // Every control inside an MCP app sends one of these. The renderer performs
  // nothing itself — this is the only place an app's action changes real data,
  // which is what keeps the four apps consistent with one another.
  const handleAppIntent = (intent: Intent) => {
    if (intent.kind === "open") {
      // Navigation, not a new turn — drilling into a card shouldn't post a
      // message to the thread every time.
      if (getApp(intent.app)) {
        navigateToApp({
          appId: intent.app,
          params: intent.deal ? { deal: intent.deal } : undefined,
        });
      }
      return;
    }
    if (intent.kind !== "tool") return;
    const deal = intent.deal;
    switch (intent.op) {
      case "move": {
        if (!deal || !intent.value) break;
        const before = getCrm().deals.find((d) => d.id === deal);
        const to = moveDeal(deal, intent.value as never);
        if (to && before)
          pushTwyn(
            `Moved **${before.company}** to ${to.label} — ${to.meaning}. Logged it against the deal.`
          );
        break;
      }
      case "logCall": {
        if (!deal) break;
        const d = getCrm().deals.find((x) => x.id === deal);
        logActivity(deal, "call", "Called and spoke — logged from the studio.");
        if (d) pushTwyn(`Logged a call against **${d.company}**. Clock's reset.`);
        break;
      }
      case "logMeeting": {
        if (!deal) break;
        const d = getCrm().deals.find((x) => x.id === deal);
        logActivity(deal, "meeting", "Meeting held — logged from the studio.");
        if (d) pushTwyn(`Logged a meeting against **${d.company}**.`);
        break;
      }
      case "assignOwner":
        if (intent.value) assignLeadOwner(intent.value);
        break;
      case "createLead": {
        const made = createLead();
        if (made) pushTwyn(`Added **${made.company}** to the board in Called.`);
        break;
      }
      case "reset":
        resetCrm();
        pushTwyn("Demo reset — back to six deals, Bob's still gone quiet.");
        break;
    }
  };

  // Interconnector connect/disconnect (OAuth). Connecting opens the modal.
  const handleConnect = (item: WorkshopItem) => {
    if (item.logo) setConnect(item.logo);
  };
  const handleDisconnect = (item: WorkshopItem) => {
    setConnected((s) => {
      const n = new Set(s);
      n.delete(item.id);
      return n;
    });
  };

  // --- Onboarding tour ---------------------------------------------------
  // Step 0 is a centered welcome; steps 1-3 spotlight Gmail, Azure, the tabs.
  const startTour = () => {
    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    setShowTourDot(false);
    setTourOpening(false);
    setConnect(null);
    setWorkshopTab("interconnectors");
    // Welcome shows the studio itself (chat + avatar) — workshop stays closed.
    setWorkshopOpen(false);
    setTourStep(0);
  };
  // Ending the tour slides the workshop closed — back to the studio (avatar +
  // chat). Skipping/dismissing leaves the nudge dot; completing it doesn't.
  const endTour = (nudge: boolean) => {
    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    // The guided run is only an example (sample data) — close it when the tour
    // ends so the user lands back in a clean studio, not on a fake result.
    if (canvasOpen && shownWorkflowDef?.demo) {
      setCanvasArtifact(null);
      setCanvasOpen(false);
      setChatOpen(true);
    }
    setTourStep(-1);
    setTourOpening(false);
    setWorkshopOpen(false);
    setShowTourDot(nudge);
  };
  const advanceTour = () =>
    setTourStep((s) => (s >= TOUR_STEPS.length - 1 ? -1 : s + 1));
  // Open the workshop, hold a continuous dim while it slides, then reveal the
  // first in-workshop step (Connect Gmail) already-settled — no chasing.
  const openWorkshopForTour = () => {
    setShowTourDot(false);
    setWorkshopOpen(true);
    setTourStep(-1);
    setTourOpening(true);
    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    tourTimerRef.current = setTimeout(() => {
      setTourOpening(false);
      setTourStep(2);
    }, 300);
  };
  // Open the Equip panel already switched to the Workflows tab, then land on the
  // given step — used to enter (and to bail back into) the workflow chapter, so
  // its spotlight targets (the tab, the row, the add CTA) exist when shown.
  const openEquipWorkflowsForTour = (step: number) => {
    setShowTourDot(false);
    setCanvasOpen(false);
    setWorkshopOpen(true);
    setWorkshopTab("workflows");
    setTourStep(-1);
    setTourOpening(true);
    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    tourTimerRef.current = setTimeout(() => {
      setTourOpening(false);
      setTourStep(step);
    }, 320);
  };
  // Kick off the guided run: the twyn announces it and the Canvas opens to the
  // live run board (which auto-plays). Advances to the "watch" beat.
  const startGuidedRun = () => {
    pushTwyn(WORKFLOW_RUN_REPLY);
    openArtifact(WORKFLOW_RUN_ARTIFACT);
    advanceTour();
  };
  // The run drives the two `auto` beats: reaching its approval gate advances the
  // "watch" beat → "you're in control"; finishing advances → "done". Functional
  // updates keep these stable and race-free.
  const handleRunAwaitingApproval = useCallback(
    () => setTourStep((s) => (s === 6 ? s + 1 : s)), // "watch me work" → "you're in control"
    []
  );
  // The run board hands us its approve fn; the tour's own "Approve" CTA calls it
  // (the real button sits under the tour backdrop, so it can't be clicked).
  const runApproveRef = useRef<(() => void) | null>(null);
  const registerRunApprove = useCallback((fn: () => void) => {
    runApproveRef.current = fn;
  }, []);
  const tourPrimary = () => {
    if (tourStep === 0) {
      advanceTour(); // welcome → "Open your workshop" cue (panel still closed)
    } else if (tourStep === 1) {
      openWorkshopForTour(); // "Open workshop" → reveal the in-workshop steps
    } else if (tourStep === 2) setConnect("gmail");
    else if (tourStep === 3) setConnect("azure");
    else if (tourStep === 4) openEquipWorkflowsForTour(5); // tools done → workflows
    else if (tourStep === 5) startGuidedRun(); // "Run it" → watch it play (→6)
    else if (tourStep === 7) {
      runApproveRef.current?.(); // "Approve" → clear the gate, run finishes
      advanceTour(); // → "Done"
    } else endTour(false); // step 8 "Got it" → done. 6 (watch) is `auto`.
  };
  // Skip: welcome exits the whole tour (leaving the nudge dot). Skipping into the
  // workflow chapter re-opens Equip on the Workflows tab so its spotlight exists;
  // once inside the run, Skip just exits (there's nothing to skip to — the run is
  // the payoff).
  const skipTour = () => {
    if (tourStep <= 0) endTour(true);
    else if (tourStep === 1) openWorkshopForTour();
    else if (tourStep === 4) openEquipWorkflowsForTour(5);
    else if (tourStep >= 5) endTour(false);
    else advanceTour(); // 2, 3
  };
  // Clicking the workshop icon: if the nudge dot is showing (the tour was
  // skipped), resume at the in-workshop steps; otherwise just toggle the panel.
  const toggleWorkshop = () => {
    if (showTourDot) openWorkshopForTour();
    else setWorkshopOpen((o) => {
      const next = !o;
      if (next) setCanvasOpen(false); // equip & canvas share the right work area
      return next;
    });
  };
  // The Canvas (workspace) shows what the twyn is producing alongside the chat.
  // It's mutually exclusive with the Equip panel (both are right-side surfaces).
  const toggleCanvas = () => {
    if (!hasCanvas) return; // nothing to show yet
    setCanvasOpen((o) => {
      const next = !o;
      if (next) {
        setWorkshopOpen(false);
        // Keep whatever's on the left: if a stage is live (avatar/audio) it stays
        // beside the canvas; otherwise chat sits on the left.
        setChatOpen(!inCall);
      } else {
        setChatOpen(true); // back to the default view
      }
      return next;
    });
  };
  const closeCanvas = () => {
    setCanvasOpen(false);
    setChatOpen(true);
  };
  // Expand an inline artifact card into the Canvas. On desktop it opens beside
  // the chat (so you keep reading the thread); on mobile the Canvas pane fills
  // the screen (there's no room for a side-by-side surface).
  const openArtifact = (a: ChatArtifact) => {
    setCanvasArtifact(a);
    // Opening from the thread is always a fresh trail — you asked for this app,
    // you didn't drill into it. A non-app artifact leaves app navigation behind.
    setAppStack(
      a.kind === "app" && a.appId ? [{ appId: a.appId, params: a.appParams }] : []
    );
    setWorkshopOpen(false);
    setChatOpen(true);
    setCanvasOpen(true);
  };
  // End the live call → text chat only (stay in the studio). Start a call →
  // bring the avatar/audio stage back.
  const endCall = () => {
    setInCall(false);
    setChatOpen(true);
  };
  // The single Avatar/Audio control (the StageToggle pill) calls this. If the
  // stage is already on screen it's a plain mode switch (no layout change — so
  // switching avatar↔audio in full-screen doesn't pop chat back). If the stage
  // isn't visible, this reveals it in the chosen mode: keep chat beside it on
  // desktop, give it the full pane on mobile or beside the Canvas. Avatar renders
  // video (costs money); Audio is the cheaper voice-only service — each is picked
  // explicitly so Audio never routes through the paid avatar.
  const pickStage = (target: TalkMode) => {
    const stageVisible = inCall && !workshopOpen && !(canvasOpen && chatOpen);
    if (stageVisible) {
      setMode(target);
      return;
    }
    setMode(target);
    setInCall(true);
    setWorkshopOpen(false);
    const desktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches;
    // Beside the Canvas (or on mobile) the stage replaces chat; otherwise chat
    // stays alongside it.
    setChatOpen(desktop && !canvasOpen);
  };

  // Fire the tour on landing in the studio (every visit, no localStorage gating).
  // Suppressed by ?tour=off (dev/demo — the tour gets tiresome on repeat visits).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tour");
    // Demo build: the tour is opt-in. It fires on every visit in the product and
    // takes over the screen, which is wrong when someone is walking a client
    // through this. ?tour=on still runs it; ?tour=workflows still jumps ahead.
    if (t !== "on" && t !== "workflows") return;
    // Dev/demo: ?tour=workflows jumps straight to the workflow chapter (skips the
    // connect-tools steps + their OAuth), so the guided run is quick to show.
    if (t === "workflows") {
      tourTimerRef.current = setTimeout(() => openEquipWorkflowsForTour(5), 300);
    } else {
      tourTimerRef.current = setTimeout(() => startTour(), 300);
    }
    return () => {
      if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stage dropped/picked documents in the composer (don't send yet).
  const addFiles = (files: FileList) => {
    setPendingFiles((p) => [...p, ...describeFiles(files)]);
  };
  const removeFile = (index: number) =>
    setPendingFiles((p) => p.filter((_, i) => i !== index));
  // Equipped workflows are invocable by trigger: a /slash (from the name) or a
  // natural phrase (default or user-set). This powers both the "/" command menu in
  // the composer and plain natural-language invocation.
  const equippedWorkflows = ownedCatalog.filter(
    (i) => i.tab === "workflows" && !!i.workflow && equippedSet.has(i.id)
  );
  const phraseFor = (item: WorkshopItem) =>
    (triggers[item.id] ?? item.workflow?.trigger ?? item.name).toLowerCase();
  const workflowCommands = equippedWorkflows.map((i) => ({
    id: i.id,
    name: i.name,
    slash: slashFor(i.name),
    phrase: phraseFor(i),
    hint: i.description,
  }));
  // Does a typed message invoke a workflow? Exact /slash or phrase, or a natural
  // "run …" wrapper, or the phrase clearly appearing in the message.
  const matchWorkflowTrigger = (text: string): WorkshopItem | null => {
    const t = text.trim().toLowerCase().replace(/[?.!]+$/, "");
    for (const i of equippedWorkflows) {
      const slash = slashFor(i.name);
      const phrase = phraseFor(i);
      if (
        t === slash ||
        t === phrase ||
        t === `run ${phrase}` ||
        t === `run my ${phrase}` ||
        (phrase.length >= 5 && t.includes(phrase))
      )
        return i;
    }
    return null;
  };
  const runWorkflowById = (id: string) => {
    const item = equippedWorkflows.find((i) => i.id === id);
    if (item) handleRunWorkflow(item);
  };

  // Send the message together with any staged documents, then clear them. A
  // message that matches a workflow trigger runs it instead of a normal turn.
  const handleSend = (text: string) => {
    const app = matchApp(text);
    if (app) {
      pushUser(text);
      setPendingFiles([]);
      setHasSent(true);
      openApp(app);
      return;
    }
    const wf = matchWorkflowTrigger(text);
    if (wf) {
      pushUser(text);
      setPendingFiles([]);
      setHasSent(true);
      handleRunWorkflow(wf);
      return;
    }
    send(text, pendingFiles);
    setPendingFiles([]);
    setHasSent(true); // starter chips give way to the conversation
    // If the turn produces an artifact it appears as an inline Canvas card in
    // the thread (Claude-style) — the user expands it into the side Canvas by
    // clicking the card, so we don't force the panel open here.
  };

  const onChatDragOver = (e: DragEvent<HTMLDivElement>) => {
    const types = Array.from(e.dataTransfer.types);
    const kind = types.includes("Files")
      ? "file"
      : types.includes(WORKSHOP_DND_TYPE)
        ? "equip"
        : null;
    if (!kind) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (dragKind !== kind) setDragKind(kind);
  };

  const onChatDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragKind(null);
  };

  const onChatDrop = (e: DragEvent<HTMLDivElement>) => {
    setDragKind(null);
    if (e.dataTransfer.files.length) {
      e.preventDefault();
      addFiles(e.dataTransfer.files);
      return;
    }
    const id = e.dataTransfer.getData(WORKSHOP_DND_TYPE);
    if (!id) return;
    const item = getOwned(id);
    if (item) equip(item);
  };

  // When Canvas is open it's a 2-pane: [left | Canvas], where the left is the
  // Avatar/Audio stage (full controls) OR Chat — swapped via the avatar's chat
  // button / the chat header's avatar button. No picture-in-picture.
  const showAvatarColumn = inCall && !workshopOpen && !(canvasOpen && chatOpen);

  return (
    <>
      <header className="flex h-[58px] shrink-0 items-center justify-between gap-3 border-b border-border bg-white px-6">
        <Link
          href="/my-twyns"
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-2 hover:border-violet hover:text-violet"
        >
          <ArrowLeft size={13} /> All twyns
        </Link>
        {/* Edit this twyn — words + the person+pen icon; moved out of the toolbar
            (freeing its space) to sit beside the back button. */}
        <Link
          href={`/my-twyns/${twyn.id}`}
          title={`Edit ${twyn.name} — personality, instructions & skills`}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-2 hover:border-violet hover:text-violet"
        >
          <UserRoundPen size={14} /> Edit twyn
        </Link>
        <div className="flex-1" />
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-[9px] border border-border text-gray-3 hover:border-violet hover:text-violet"
        >
          <Bell size={15} />
          <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-violet px-1 text-[9px] font-bold text-white">
            5
          </span>
        </Link>
        {/* Avatar menu is desktop-only — mobile uses the Account bottom-tab. */}
        <div className="hidden lg:block">
          <AccountMenu onTakeTour={startTour} />
        </div>
      </header>

      <div ref={splitRef} className="relative flex flex-1 overflow-hidden">
        {showAvatarColumn && (
          <div
            ref={videoColRef}
            className={cn(
              // The stage keeps a fixed (resizable) width whenever something sits
              // beside it — chat OR canvas — so it never reflows/jumps when the
              // canvas opens (the canvas fills the freed space instead). Only a
              // full-screen stage (nothing beside it) fills.
              chatOpen || canvasOpen ? "hidden p-4 pr-0 lg:block lg:shrink-0" : "flex-1 p-4",
            )}
          >
            <div className="relative h-full overflow-hidden rounded-[18px]">
              <VideoPanel
                twyn={twyn}
                mode={mode}
                onModeChange={setMode}
                chatOpen={chatOpen}
                onToggleChat={() => setChatOpen((o) => !o)}
                onEndCall={endCall}
                onSendMessage={handleSend}
                twynName={twyn.name}
                isFree={!hasCustom}
                avatarImage={avatarImage}
                avatarState={avatar.state}
                avatarForced={forcedAvatar}
                avatarProgress={avatar.progress}
                avatarReason={avatar.reason}
                onRedoAvatar={() => setRedoOpen(true)}
                onMakeItMove={openUpgrade}
                ownAvatar={ownFootage}
              />
            </div>
          </div>
        )}

        {showAvatarColumn && (chatOpen || canvasOpen) && (
          <div ref={handleRef} className="resize-handle hidden lg:block" role="separator" aria-orientation="vertical" aria-label="Resize the stage" />
        )}

        {chatOpen && (
          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col overflow-hidden p-4",
              showAvatarColumn && "pl-0",
              // Equip / Canvas take the full screen on mobile; chat hides behind them.
              // Drop the right padding so the canvas resize handle gutter is tight
              // (centered bar), matching the video↔chat handle.
              workshopOpen && "pr-0 hidden lg:flex",
              canvasOpen && "hidden lg:flex lg:pr-0"
            )}
          >
            <div
              onDragOver={onChatDragOver}
              onDragLeave={onChatDragLeave}
              onDrop={onChatDrop}
              className={cn(
                "@container relative flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[18px] border bg-white transition-colors",
                dragKind
                  ? "border-violet shadow-[0_0_0_3px_rgba(108,92,231,0.18)]"
                  : "border-border"
              )}
            >
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-white px-5 py-3.5">
                {historyOpen ? (
                  <button
                    type="button"
                    onClick={() => setHistoryOpen(false)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3.5 text-[12.5px] font-semibold text-gray-2 outline-none transition-colors hover:border-violet hover:text-violet focus-visible:ring-2 focus-visible:ring-violet/40"
                  >
                    <ArrowLeft size={13} /> Back to conversation
                  </button>
                ) : showAvatarColumn ? (
                  // The stage is beside chat → Avatar/Audio lives on the stage, so
                  // the chat toggle takes the header slot (it governs this panel).
                  <button
                    type="button"
                    onClick={() => setChatOpen(false)}
                    aria-label="Hide chat"
                    title="Hide chat"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3.5 text-[12.5px] font-semibold text-gray-2 outline-none transition-colors hover:border-violet hover:text-violet focus-visible:ring-2 focus-visible:ring-violet/40"
                  >
                    <PanelRightClose size={14} /> Hide chat
                  </button>
                ) : (
                  // No stage on screen (chat-only, or chat beside the Canvas) →
                  // Avatar/Audio falls back here to start / reveal a stage. Nothing
                  // is highlighted: this is a "pick to bring up a stage" control,
                  // not a status — chat is what's actually showing.
                  <StageToggle active={null} onPick={pickStage} avatarProcessing={avatar.state === "processing"} />
                )}
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    data-tour="workshop"
                    aria-label={workshopOpen ? "Close Equip panel" : "Open Equip panel"}
                    title="Equip — load tools, skills & knowledge"
                    aria-pressed={workshopOpen}
                    onClick={toggleWorkshop}
                    className={cn(
                      "relative inline-flex h-9 items-center gap-1.5 rounded-[9px] border px-2.5 text-[12.5px] font-semibold transition-colors @[480px]:px-3",
                      workshopOpen
                        ? "border-violet bg-violet text-white"
                        : "border-border text-gray-3 hover:border-violet hover:text-violet"
                    )}
                  >
                    <Blocks size={14} />
                    <span className="hidden @[480px]:inline">Equip</span>
                    {showTourDot && (
                      <span className="absolute -right-1 -top-1 grid place-items-center">
                        <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-violet/60" />
                        <span className="relative h-2.5 w-2.5 rounded-full bg-violet ring-2 ring-white" />
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={!hasCanvas}
                    aria-label={canvasOpen ? "Close canvas" : "Open canvas"}
                    title={
                      hasCanvas
                        ? "Canvas — see what your twyn is working on"
                        : "Canvas opens once your twyn has something to show"
                    }
                    aria-pressed={canvasOpen}
                    onClick={toggleCanvas}
                    className={cn(
                      // Canvas is a desktop-only surface — hidden on mobile, where
                      // we keep the studio to chat + equip.
                      "hidden h-9 items-center gap-1.5 rounded-[9px] border px-2.5 text-[12.5px] font-semibold transition-colors @[480px]:px-3 lg:inline-flex",
                      !hasCanvas
                        ? "cursor-not-allowed border-border text-gray-5 opacity-50"
                        : canvasOpen
                          ? "border-violet bg-violet text-white"
                          : "border-border text-gray-3 hover:border-violet hover:text-violet"
                    )}
                  >
                    <Columns2 size={14} />
                    <span className="hidden @[480px]:inline">Canvas</span>
                  </button>
                  <button
                    type="button"
                    aria-label={historyOpen ? "Close history" : "History"}
                    aria-pressed={historyOpen}
                    onClick={() => setHistoryOpen((o) => !o)}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-[9px] border transition-colors",
                      historyOpen
                        ? "border-violet bg-violet text-white"
                        : "border-border text-gray-3 hover:border-violet hover:text-violet"
                    )}
                  >
                    <Clock size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="New chat"
                    title="New chat"
                    onClick={() => {
                      reset();
                      setHasSent(false);
                      setHistoryOpen(false);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-[9px] border border-border text-gray-3 hover:border-violet hover:text-violet"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {historyOpen ? (
                <ConversationHistory
                  onSelect={() => setHistoryOpen(false)}
                />
              ) : (
                <>
                  <div className="relative flex flex-1 flex-col overflow-hidden">
                    <ChatThread
                      messages={messages}
                      typing={typing}
                      twyn={twyn}
                      onOpenArtifact={openArtifact}
                      activeArtifactId={canvasOpen ? (shownArtifact?.id ?? null) : null}
                    />
                    {dragKind && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-violet px-5 py-2 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(108,92,231,0.35)]">
                          {dragKind === "file" ? (
                            <>
                              <Upload size={14} /> Drop to attach a document
                            </>
                          ) : (
                            "Drop to equip"
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  {workshopOpen && (
                    <EquippedBar
                      tab={workshopTab}
                      equippedIds={equipped}
                      getItem={getOwned}
                      onRemove={unequip}
                    />
                  )}
                  {limit && <LimitNotice kind={limit} plan={subPlan} />}
                  <ChatInput
                    onSend={handleSend}
                    onAttach={addFiles}
                    attachments={pendingFiles}
                    onRemoveAttachment={removeFile}
                    twynName={twyn.name}
                    showQuickStart={!workshopOpen && !hasSent}
                    commands={workflowCommands}
                    onRunCommand={runWorkflowById}
                    disabled={!!limit}
                    disabledHint={
                      limit === "subscription"
                        ? subPlan === "paid"
                          ? "Your subscription has ended — reactivate to continue"
                          : "Your free trial has ended — choose a plan to continue"
                        : "You're out of credits — upgrade or top up to continue"
                    }
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Resize handle on the canvas's left edge — only beside chat (where the
            canvas owns a fixed width). Beside the stage, the stage's own handle
            (above) resizes the boundary. */}
        {canvasOpen && chatOpen && (
          <div
            ref={canvasHandleRef}
            className="resize-handle hidden lg:block"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize canvas"
          />
        )}

        {/* Canvas — the live workspace. Beside chat it's a fixed (resizable,
            --canvas-w) panel that slides open; beside the stage it simply fills
            the space the stage doesn't use, so the stage never reflows. */}
        <div
          ref={canvasColRef}
          className={cn(
            "canvas-pane overflow-hidden [will-change:width]",
            !canvasOpen && "w-0 shrink-0 transition-[width] duration-[350ms] ease-soft",
            canvasOpen && chatOpen && "w-full shrink-0 transition-[width] duration-[350ms] ease-soft lg:w-[var(--canvas-w)]",
            canvasOpen && !chatOpen && "min-w-0 flex-1",
          )}
        >
          <div
            className={cn(
              "h-full w-full p-4 transition-opacity duration-[220ms] [transition-delay:80ms] lg:pl-0",
              canvasOpen && chatOpen && "lg:w-[var(--canvas-w)]",
              canvasOpen ? "opacity-100" : "opacity-0",
            )}
          >
            {appStack.length > 0 ? (
              <McpAppPanel
                stack={appStack}
                onIntent={handleAppIntent}
                onBack={goBackInCanvas}
                onCrumb={goToCrumb}
                onClose={closeCanvas}
              />
            ) : (
              <CanvasPanel
                key={shownArtifact?.id ?? "canvas"}
                twynName={twyn.name}
                onClose={closeCanvas}
                workflow={canvasWorkflow}
                onRunAwaitingApproval={handleRunAwaitingApproval}
                onRegisterApprove={registerRunApprove}
              />
            )}
          </div>
        </div>

        {/* Width-driven push (not a transform slide). Width animates over .35s
            ease-soft; content opacity fades .22s with an .08s delay. */}
        <div
          className={cn(
            "shrink-0 overflow-hidden transition-[width] duration-[350ms] ease-soft [will-change:width]",
            workshopOpen ? "w-full lg:w-[452px]" : "w-0",
          )}
        >
          <div
            className={cn(
              "h-full w-full p-4 transition-opacity duration-[220ms] [transition-delay:80ms] lg:w-[452px]",
              workshopOpen ? "opacity-100" : "opacity-0",
            )}
          >
            <WorkshopPanel
              catalog={ownedCatalog}
              equipped={equippedSet}
              connected={connected}
              tab={workshopTab}
              onTabChange={setWorkshopTab}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onRunWorkflow={handleRunWorkflow}
              getTrigger={(item) => ({ slash: slashFor(item.name), phrase: phraseFor(item) })}
              onOpenDetails={setDetailsItem}
              onClose={() => setWorkshopOpen(false)}
            />
          </div>
        </div>
      </div>

      <WorkflowDetailsDialog
        key={detailsItem?.id ?? "wf-details"}
        open={!!detailsItem}
        onClose={() => setDetailsItem(null)}
        item={detailsItem}
        slash={detailsItem ? slashFor(detailsItem.name) : ""}
        phrase={detailsItem ? phraseFor(detailsItem) : ""}
        onSetPhrase={(phrase) =>
          detailsItem &&
          setTriggers((t) => ({
            ...t,
            [detailsItem.id]: phrase || (detailsItem.workflow?.trigger ?? detailsItem.name),
          }))
        }
        schedule={
          (detailsItem && schedules[detailsItem.id]) || DEFAULT_SCHEDULE
        }
        onSetSchedule={(s) =>
          detailsItem && setSchedules((m) => ({ ...m, [detailsItem.id]: s }))
        }
        onRun={() => detailsItem && handleRunWorkflow(detailsItem)}
        onRemove={() => detailsItem && unequip(detailsItem.id)}
      />

      {/* Continuous dim while the workshop slides open between welcome → step 2. */}
      {tourOpening && (
        <div className="fixed inset-0 z-[90] bg-dark/55" aria-hidden />
      )}

      {/* Onboarding tour — overlay pauses while the connect modal is open. */}
      {tourStep >= 0 && !connect && (
        <TalkTour
          step={TOUR_STEPS[tourStep]}
          index={tourStep}
          total={TOUR_STEPS.length}
          countLabel={
            TOUR_STEPS[tourStep].hideCount
              ? ""
              : `Step ${
                  TOUR_STEPS.slice(0, tourStep + 1).filter((s) => !s.hideCount).length
                } of ${TOUR_STEPS.filter((s) => !s.hideCount).length}`
          }
          onSkip={skipTour}
          onPrimary={tourPrimary}
          onDismiss={() => endTour(true)}
        />
      )}

      {/* Secure OAuth connect modal (used by the workshop + the tour). */}
      <ConnectDialog
        provider={connect}
        onCancel={() => {
          setConnect(null);
          // During the tour, cancelling skips connecting → move to the next step.
          if (tourStep >= 0) advanceTour();
        }}
        onConnect={(p) => {
          const id = `tool-${p}`;
          setConnected((s) => new Set(s).add(id));
          pushTwyn(
            `Connected to **${getOwned(id)?.name ?? p}** — I can use it right away.`
          );
          setConnect(null);
          if (tourStep >= 0) advanceTour();
        }}
      />

      {/* Re-record after a failed avatar → kicks off processing again. */}
      <VideoCaptureDialog
        open={redoOpen}
        onOpenChange={setRedoOpen}
        onCapture={() => startAvatarProcessing(twyn.id)}
      />

      {/* In-studio upgrade, step 1 — the same two-video capture as onboarding
          (consent + training). Continue advances to the plan picker. */}
      <TwynVideosDialog
        open={upgradeStage === "videos"}
        onOpenChange={(o) => !o && setUpgradeStage(null)}
        consentDone={consentDone}
        trainingDone={trainingDone}
        trainingPoster={trainingPoster}
        onCaptured={(kind, poster) => setVideo(kind, true, kind === "training" ? poster ?? null : undefined)}
        onUpload={(kind) => setVideo(kind, true, kind === "training" ? null : undefined)}
        onRemove={(kind) => setVideo(kind, false, kind === "training" ? null : undefined)}
        onContinue={() => setUpgradeStage("plans")}
        continueLabel="Choose your plan"
      />

      {/* In-studio upgrade, step 2 — pick a plan, hand off to Stripe. */}
      <UpgradePlansModal
        open={upgradeStage === "plans"}
        onOpenChange={(o) => !o && setUpgradeStage(null)}
        onBack={() => setUpgradeStage("videos")}
      />

      {/* Prototype-only: flip between hard-to-reach states (tier, avatar
          training/failed, out of credits) for demos and dev. Not product UI. */}
      {/* Dev-only: the State panel forces tiers, limits and avatar states. A
          debugging aid, not something to leave on screen during a client call. */}
      {process.env.NODE_ENV !== "production" && <DevStatePanel />}
    </>
  );
}
