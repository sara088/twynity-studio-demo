"use client";

import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { useState, type MouseEvent } from "react";
import type { CommunityTwyn } from "../data/mock-data";
import { TwynDetailModal } from "./TwynDetailModal";

export function CommunityTwynCard({ twyn }: { twyn: CommunityTwyn }) {
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);

  const onSaveClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSaved((s) => !s);
  };

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="w-[210px] shrink-0 cursor-pointer overflow-hidden rounded-[13px] border-[1.5px] border-border bg-white text-left transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(0,0,0,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
      >
        <div className="relative h-[182px] overflow-hidden bg-input-bg">
          <Image
            src={twyn.portrait}
            alt={twyn.name}
            fill
            sizes="210px"
            className="object-cover object-top"
          />
          <button
            type="button"
            onClick={onSaveClick}
            className="absolute right-[9px] top-[9px] grid h-[29px] w-[29px] place-items-center rounded-full border border-[rgba(220,220,236,0.6)] bg-white/90 text-gray-3 backdrop-blur hover:text-violet"
            aria-label={saved ? "Remove from shortlist" : "Save"}
          >
            <Heart
              size={14}
              className={saved ? "fill-violet text-violet" : ""}
            />
          </button>
        </div>
        <div className="px-3 pb-[13px] pt-[11px]">
          <div className="mb-[3px] flex items-center gap-1.5">
            <span className="min-w-0 truncate text-[12.5px] font-bold text-dark">
              {twyn.name}
            </span>
            <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-violet">
              <Star size={9} className="fill-violet text-violet" />
              {twyn.rating}
            </span>
          </div>
          <p className="mb-2 text-[10.5px] leading-[1.5] text-gray-4">
            {twyn.description}
          </p>
          <div className="mb-[9px] flex flex-wrap gap-1">
            {twyn.tags.map((t) => (
              <span
                key={t}
                className="rounded-[5px] border border-border bg-input-bg px-[7px] py-0.5 text-[9.5px] font-semibold text-gray-3"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="text-[13px] font-extrabold text-dark">
            {twyn.pricePerHour !== undefined ? (
              <>
                ${twyn.pricePerHour}
                <span className="text-[11px] font-medium text-gray-4">
                  {" "}
                  /hr
                </span>
              </>
            ) : (
              <span className="text-[12.5px]">{twyn.priceMonthly}</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {twyn.mcps.map((m) => (
              <span
                key={m}
                className="rounded-[3px] bg-input-bg px-1 py-0.5 text-[8.5px] font-semibold text-gray-4"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </article>

      <TwynDetailModal twyn={twyn} open={open} onOpenChange={setOpen} />
    </>
  );
}
