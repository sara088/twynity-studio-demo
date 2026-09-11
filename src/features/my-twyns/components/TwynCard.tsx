"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MessageSquare, Mic, Video, UserRoundPen, Share2, RotateCcw, TriangleAlert, SquareArrowRightEnter, Archive } from "lucide-react";
import { toast } from "sonner";
import { ShareTwynModal } from "./ShareTwynModal";
import { DeployTwynModal } from "./DeployTwynModal";
import { useAvatarStatus } from "@/features/shared/hooks/useAvatarStatus";
import { AVATAR_ETA_LABEL, startAvatarProcessing } from "@/features/shared/lib/avatar";
import { VideoCaptureDialog } from "@/features/onboarding/components/VideoCaptureDialog";
import { archiveIds, knowledgeOwnedBy } from "@/features/archive/lib/archive";
import type { Twyn } from "../types";

export function TwynCard({ twyn }: { twyn: Twyn }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [redoOpen, setRedoOpen] = useState(false);
  const firstName = twyn.name.split(" ").slice(-1)[0];
  const avatar = useAvatarStatus(twyn.id, twyn.name);

  // Archiving by choice, independent of any plan change — how someone at their
  // cap makes room without downgrading or deleting. Knowledge packs go with the
  // twyn; nothing that can't be read should keep eating the allowance.
  const archive = () => {
    const packs = knowledgeOwnedBy(twyn.id).length;
    archiveIds([twyn.id], "manual");
    toast.success(`${twyn.name} archived`, {
      description: packs
        ? `Freed a twyn slot and ${packs} knowledge pack${packs === 1 ? "" : "s"}. Restore any time from My Archive.`
        : "Freed a twyn slot. Restore any time from My Archive.",
    });
  };

  return (
    <article className="flex flex-col rounded-card border border-border bg-white p-3 transition-[border-color,box-shadow] duration-150 hover:border-violet/40 hover:shadow-[0_8px_28px_rgba(15,15,30,0.06)]">
      {/* Portrait — shorter than square to keep the card compact. Nested radius:
          card 20px − p-3 (12px) = 8px keeps its corners concentric with the card. */}
      <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-[8px] bg-violet-mid">
        <Image
          src={twyn.portrait}
          alt={twyn.name}
          fill
          sizes="(min-width: 720px) 33vw, 100vw"
          className="object-cover"
          style={{ objectPosition: "center 20%" }}
        />
        {/* Avatar still training — show progress over the portrait. */}
        {avatar.state === "processing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-dark/60 px-4 text-center backdrop-blur-[2px]">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/85">
              <span className="h-2 w-2 rounded-full bg-violet animate-status-pulse" />
              Building avatar
            </span>
            <div className="h-[5px] w-3/4 max-w-[160px] overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-violet transition-[width] duration-500 ease-soft"
                style={{ width: `${Math.round(avatar.progress * 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-white/70">Ready in {AVATAR_ETA_LABEL}</span>
          </div>
        )}

        {/* Avatar failed a quality check — short reason + redo. */}
        {avatar.state === "failed" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-dark/65 px-4 text-center backdrop-blur-[2px]">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-error text-white">
              <TriangleAlert size={17} />
            </span>
            <span className="text-[12.5px] font-bold text-white">Avatar couldn&apos;t process</span>
            <span className="text-[11px] leading-[1.4] text-white/70">{avatar.reason}</span>
            <button
              type="button"
              onClick={() => setRedoOpen(true)}
              className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-full bg-violet px-3.5 text-[12px] font-bold text-white transition-colors hover:bg-violet-h"
            >
              <RotateCcw size={13} /> Redo video
            </button>
          </div>
        )}

        {/* Online status — a lightweight, useful at-a-glance signal (replaces the
            passive capability/tool counts). */}
        {avatar.state !== "processing" && avatar.state !== "failed" && (
          <span className="absolute bottom-2 right-2 h-[14px] w-[14px] rounded-full border-[2.5px] border-white bg-success" />
        )}
      </div>

      {/* Name + role */}
      <h3 className="mb-1 font-heading text-[18px] font-semibold leading-[1.05] tracking-[-0.4px] text-dark">
        {twyn.name}
      </h3>
      <p className="mb-4 text-[13px] text-gray-3">{twyn.role}</p>

      {/* Actions — one primary (talk, chat-led with voice/video alternates) and
          one grouped secondary rail (edit · share · deploy). */}
      <div className="mt-auto space-y-2">
        <div className="flex items-center overflow-hidden rounded-btn bg-violet text-white">
          <Link
            href={`/talk/${twyn.id}?start=chat`}
            className="flex h-[40px] min-w-0 flex-1 items-center justify-center gap-2 text-[13px] font-semibold transition-colors hover:bg-violet-h"
          >
            <MessageSquare size={15} strokeWidth={2} />
            <span className="truncate">Chat with {firstName}</span>
          </Link>
          <span className="h-5 w-px shrink-0 bg-white/25" />
          <Link
            href={`/talk/${twyn.id}?start=voice`}
            aria-label={`Voice call with ${firstName}`}
            title={`Voice call with ${firstName}`}
            className="grid h-[40px] w-[40px] shrink-0 place-items-center transition-colors hover:bg-violet-h"
          >
            <Mic size={16} strokeWidth={2} />
          </Link>
          <span className="h-5 w-px shrink-0 bg-white/25" />
          <Link
            href={`/talk/${twyn.id}?start=video`}
            aria-label={`Video call with ${firstName}`}
            title={`Video call with ${firstName}`}
            className="grid h-[40px] w-[40px] shrink-0 place-items-center transition-colors hover:bg-violet-h"
          >
            <Video size={16} strokeWidth={2} />
          </Link>
        </div>

        <div className="flex gap-1.5">
          <Link
            href={`/my-twyns/${twyn.id}`}
            className="inline-flex h-[34px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-btn border border-border bg-white text-[12.5px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
          >
            <UserRoundPen size={14} strokeWidth={2} /> Edit
          </Link>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex h-[34px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-btn border border-border bg-white text-[12.5px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
          >
            <Share2 size={14} /> Share
          </button>
          <button
            type="button"
            onClick={() => setDeployOpen(true)}
            title="Deploy to a live Teams, Zoom, or Meet call"
            className="inline-flex h-[34px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-btn border border-border bg-white text-[12.5px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
          >
            <SquareArrowRightEnter size={14} />
            Deploy
          </button>
          <button
            type="button"
            onClick={archive}
            aria-label={`Archive ${twyn.name}`}
            title="Archive — keeps the data, frees the slot"
            className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-btn border border-border bg-white text-gray-4 transition-colors hover:border-violet hover:text-violet"
          >
            <Archive size={14} />
          </button>
        </div>
      </div>

      <ShareTwynModal open={shareOpen} onOpenChange={setShareOpen} twyn={twyn} />
      <DeployTwynModal open={deployOpen} onOpenChange={setDeployOpen} twyn={twyn} />
      <VideoCaptureDialog
        open={redoOpen}
        onOpenChange={setRedoOpen}
        onCapture={() => startAvatarProcessing(twyn.id)}
      />
    </article>
  );
}

