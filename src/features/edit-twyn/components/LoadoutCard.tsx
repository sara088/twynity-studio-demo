"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { CHIP_COLORS, type LucideIcon } from "../data/loadout";

export function LoadoutCard({
  title,
  count,
  countLabel,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  count: number;
  countLabel: string;
  addLabel: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[220px] flex-col gap-3 rounded-card border border-border bg-white p-[18px] pb-[14px]">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-heading text-[14px] font-semibold tracking-[-0.25px] text-dark">{title}</h3>
        <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-4">
          <span className="font-sans">{count}</span> {countLabel}
        </span>
      </div>
      <div className="flex min-h-[56px] flex-1 flex-wrap content-start gap-[7px]">{children}</div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-gray-6 bg-bg-input px-[14px] text-[13px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}

export function EquippedChip({ icon: Icon, label, kind }: { icon: LucideIcon; label: string; kind: string }) {
  return (
    <span className={`inline-flex h-[34px] items-center gap-2 rounded-chip border pl-[5px] pr-[13px] text-[13px] font-semibold ${CHIP_COLORS[kind]}`}>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/70">
        <Icon size={13} />
      </span>
      {label}
    </span>
  );
}

export function InterconnectorChip({ logo, label }: { logo: ReactNode; label: string }) {
  return (
    <span className={`inline-flex h-[34px] items-center gap-2 rounded-chip border px-[7px] pr-[13px] text-[13px] font-semibold ${CHIP_COLORS.interconnectors}`}>
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/80">{logo}</span> {label}
    </span>
  );
}

export function AddMoreChip({ label = "Add more", onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[34px] items-center gap-1.5 rounded-chip border-[1.5px] border-dashed border-gray-6 px-[13px] text-[12px] font-semibold text-gray-5 transition-colors hover:border-violet hover:text-violet"
    >
      <Plus size={12} /> {label}
    </button>
  );
}

export function GmailLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  );
}

export function AzureLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path fill="#0078D4" d="M11.4 1.6L0 21.4h7.4l1.7-3.2L17.2 1.6h-5.8zm5.3 5.1L9.8 21.4H24L16.7 6.7z" />
    </svg>
  );
}
