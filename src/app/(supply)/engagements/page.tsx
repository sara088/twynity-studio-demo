import { PageHeader } from "@/features/shared/components/PageHeader";
import { StatusBadge } from "@/features/shared/components/ui-primitives/StatusBadge";
import { ENGAGEMENTS } from "@/features/engagements/data/mock-data";

const TONE = {
  active: "mint",
  ending: "amber",
  pending: "gray",
} as const;

export default function EngagementsPage() {
  return (
    <>
      <PageHeader
        title="Engagements"
        subtitle="Active deals between your twyns and the orgs that hired them."
      />

      <div className="overflow-hidden rounded-[14px] border-[1.5px] border-border bg-white">
        <div className="grid grid-cols-[1fr_1fr_120px_140px_120px_120px] gap-4 border-b border-border bg-input-bg px-5 py-3 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-5">
          <div>Organization</div>
          <div>Role</div>
          <div>Status</div>
          <div>Started</div>
          <div className="text-right">Rate</div>
          <div className="text-right">MTD</div>
        </div>
        {ENGAGEMENTS.map((e) => (
          <div
            key={e.id}
            className="grid grid-cols-[1fr_1fr_120px_140px_120px_120px] items-center gap-4 border-b border-border px-5 py-4 last:border-b-0 hover:bg-input-bg/50"
          >
            <div className="font-heading text-[15px] font-semibold tracking-[-0.3px] text-dark">
              {e.org}
            </div>
            <div className="text-[13px] text-gray-3">{e.role}</div>
            <div>
              <StatusBadge tone={TONE[e.status]}>{e.status}</StatusBadge>
            </div>
            <div className="text-[12.5px] text-gray-3 tabular-nums">
              {e.startedAt}
            </div>
            <div className="text-right text-[13px] font-semibold text-dark tabular-nums">
              {e.rate}
            </div>
            <div className="text-right text-[13px] font-bold text-violet tabular-nums">
              ${e.earningsMtd}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
