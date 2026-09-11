"use client";

import Image from "next/image";
import { ArrowRight, Star, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import type { CommunityTwyn } from "../data/mock-data";

export function TwynDetailModal({
  twyn,
  open,
  onOpenChange,
}: {
  twyn: CommunityTwyn;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const refusals = twyn.refusals ?? [];
  const capabilities = twyn.capabilities ?? [];
  const reviews = twyn.reviews ?? [];
  const worksWith = twyn.worksWith ?? [];
  const pairings = twyn.pairings ?? [];
  const skillTags = twyn.tags.filter((tag) => !tag.startsWith("+"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-dark/45 backdrop-blur-[4px]"
        className="flex max-h-[88vh] w-[840px] max-w-[calc(100vw-40px)] gap-0 overflow-hidden rounded-[20px] border-0 bg-white p-0 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:max-w-none"
      >
        <VisuallyHidden.Root>
          <DialogTitle>{twyn.name}</DialogTitle>
          <DialogDescription>{twyn.description}</DialogDescription>
        </VisuallyHidden.Root>

        <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-input-bg">
          <div className="relative h-[268px] shrink-0 overflow-hidden">
            <Image
              src={twyn.portrait}
              alt={twyn.name}
              fill
              sizes="256px"
              className="object-cover object-top"
            />
          </div>

          <div className="flex flex-1 flex-col px-[18px] pb-2.5 pt-4">
            <div className="mb-[5px] flex items-start justify-between gap-2">
              <h2 className="font-heading text-[15px] font-semibold leading-[1.3] tracking-[-0.3px] text-dark">
                {twyn.name}
              </h2>
              <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-violet">
                <Star size={11} className="fill-violet text-violet" />
                {twyn.rating}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11.5px] text-gray-4">
              {twyn.hires !== undefined && (
                <>
                  <span className="font-semibold">{twyn.hires} hires</span>
                  <span className="text-gray-6">·</span>
                </>
              )}
              <span className="inline-flex items-center gap-1 font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Available now
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-[9px] border-t border-border px-[18px] pb-[18px] pt-[13px]">
            <div className="font-inter text-[24px] font-bold leading-none tracking-[-0.6px] text-dark">
              {twyn.pricePerHour !== undefined ? (
                <>
                  ${twyn.pricePerHour}
                  <span className="text-[12px] font-medium tracking-normal text-gray-4">
                    {" "}
                    /hr
                  </span>
                </>
              ) : (
                <span className="text-[18px] leading-tight">
                  {twyn.priceMonthly}
                </span>
              )}
            </div>
            <button
              type="button"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-violet text-[14px] font-bold text-white transition-colors duration-150 hover:bg-violet-hover"
            >
              Hire This Twyn <ArrowRight size={15} />
            </button>
          </div>
        </aside>

        <section className="relative flex-1 overflow-y-auto bg-white px-6 pb-7 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 grid h-[30px] w-[30px] place-items-center rounded-[12px] border border-border bg-white text-gray-3 hover:border-violet hover:text-violet"
          >
            <X size={14} />
          </button>

          <p className="mb-5 mt-[38px] text-[14px] leading-[1.65] text-gray-3">
            {twyn.description}
          </p>

          {twyn.humanRoleLabel && (
            <Section label="Real human behind">
              <div className="flex items-center gap-3 rounded-[10px] border border-mint-text/30 bg-mint/40 px-3 py-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet font-heading text-[11.5px] font-bold text-white">
                  {twyn.humanInitials ?? "?"}
                </span>
                <div className="min-w-0">
                  <div className="font-heading text-[12.5px] font-semibold tracking-[-0.2px] text-dark">
                    {twyn.humanRoleLabel}
                  </div>
                  {twyn.humanAvailability && (
                    <div className="mt-0.5 text-[11px] text-mint-text">
                      {twyn.humanAvailability}
                    </div>
                  )}
                </div>
              </div>
            </Section>
          )}

          {refusals.length > 0 && (
            <Section label="Refusals - binding at runtime">
              <div className="space-y-2">
                {refusals.map((refusal) => (
                  <div
                    key={refusal}
                    className="flex items-center gap-2 rounded-[8px] border border-error/20 bg-error/[0.04] px-3 py-2"
                  >
                    <X
                      size={13}
                      strokeWidth={2.5}
                      className="shrink-0 text-error"
                    />
                    <span className="text-[12px] text-dark">{refusal}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {capabilities.length > 0 && (
            <Section label="Capabilities">
              <ul className="flex list-none flex-col gap-[5px] p-0">
                {capabilities.map((capability) => (
                  <li
                    key={capability}
                    className="flex items-start gap-2 text-[12.5px] leading-[1.5] text-dark"
                  >
                    <span className="mt-1.5 h-[5px] w-[5px] shrink-0 rounded-full bg-violet" />
                    <span>{capability}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {skillTags.length > 0 && (
            <Section label="Skills & tools">
              <div className="flex flex-wrap gap-[5px]">
                {skillTags.map((skill) => (
                  <Chip key={skill}>{skill}</Chip>
                ))}
              </div>
            </Section>
          )}

          {twyn.mcps.length > 0 && (
            <Section label="MCP integrations">
              <div className="flex flex-wrap gap-[5px]">
                {twyn.mcps.map((mcp) => (
                  <Chip key={mcp} tone="violet">
                    {mcp}
                  </Chip>
                ))}
              </div>
            </Section>
          )}

          {worksWith.length > 0 && (
            <Section label="Works best with">
              <div className="flex flex-wrap gap-[5px]">
                {worksWith.map((item) => (
                  <Chip key={item} tone="mint">
                    {item}
                  </Chip>
                ))}
              </div>
            </Section>
          )}

          {reviews.length > 0 && (
            <Section label="Reviews">
              <div>
                {reviews.map((review) => (
                  <article
                    key={review.reviewer}
                    className="border-b border-border py-[11px] last:border-b-0"
                  >
                    <header className="mb-[5px] flex items-center justify-between">
                      <span className="text-[12.5px] font-bold text-dark">
                        {review.reviewer}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className="fill-amber-text text-amber-text"
                          />
                        ))}
                      </span>
                    </header>
                    <p className="text-[12px] leading-[1.6] text-gray-3">
                      {review.text}
                    </p>
                  </article>
                ))}
              </div>
            </Section>
          )}

          {pairings.length > 0 && (
            <Section label="Recommended team pairings">
              <div className="flex flex-wrap gap-2.5">
                {pairings.map((pairing) => (
                  <article
                    key={pairing.name}
                    className="flex w-[calc(50%_-_5px)] cursor-pointer items-center gap-2.5 rounded-[10px] border border-border bg-white px-3 py-2.5 transition-[border-color,background] duration-150 hover:border-violet-mid hover:bg-violet-light"
                  >
                    {pairing.portrait ? (
                      <Image
                        src={pairing.portrait}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 shrink-0 rounded-[10px] bg-input-bg object-cover object-top"
                      />
                    ) : (
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-input-bg font-heading text-[11px] font-bold text-violet">
                        {pairing.initials ??
                          pairing.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="mb-0.5 font-heading text-[12px] font-semibold tracking-[-0.2px] text-dark">
                        {pairing.name}
                      </div>
                      <div className="text-[11px] leading-[1.4] text-gray-4">
                        {pairing.description}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Section>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-[18px] last:mb-0">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-5">
        {label}
      </div>
      {children}
    </section>
  );
}

function Chip({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "violet" | "mint";
}) {
  const className =
    tone === "violet"
      ? "border-violet-mid bg-violet-light text-violet"
      : tone === "mint"
        ? "border-[#BBF7D0] bg-[#F0FFF4] text-mint-text"
        : "border-border bg-input-bg text-gray-2";

  return (
    <span
      className={`inline-flex h-[25px] items-center rounded-[6px] border px-[9px] text-[11px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}
