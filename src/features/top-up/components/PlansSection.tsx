"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CalendarClock, Check, Rocket, Sparkles, Star, Users, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS, type Plan } from "../data/mock-data";
import { UpgradePlanModal } from "./UpgradePlanModal";
import { ContactSalesModal } from "./ContactSalesModal";
import { DowngradeConfirmModal } from "./DowngradeConfirmModal";
import {
  TIERS,
  canSwitchTo,
  clearTierPreview,
  isDowngrade,
  setTierId,
  type TierId,
} from "@/features/shared/lib/tier";
import { useTier } from "@/features/shared/hooks/useTier";
import { applyPendingDowngrade } from "@/features/archive/lib/archive";
import { toast } from "sonner";
import {
  allAssets,
  cancelDowngrade,
  fitsWithoutArchiving,
  getPendingDowngrade,
  onDowngradeChanged,
  scheduleDowngrade,
  tierName,
  type PendingDowngrade,
} from "../lib/downgrade";

const ICONS: Record<Plan["icon"], LucideIcon> = {
  trial: Sparkles,
  basic: Rocket,
  standard: Zap,
  pro: Star,
  teams: Users,
  enterprise: Building2,
};

// One quiet, neutral tile for every plan — the only color on the page is the
// violet used to mark the recommended tier.
const TILE: Record<Plan["icon"], string> = {
  trial: "bg-bg-input text-gray-2",
  basic: "bg-bg-input text-gray-2",
  standard: "bg-bg-input text-gray-2",
  pro: "bg-bg-input text-gray-2",
  teams: "bg-bg-input text-gray-2",
  enterprise: "bg-bg-input text-gray-2",
};

// Custom-priced plans (Teams, Enterprise) route to sales instead of self-serve.
const isContactSales = (plan: Plan) => plan.priceLabel === "Custom";

/** PLANS carries an "enterprise" entry that has no tier in the entitlement model. */
const asTierId = (id: Plan["id"]): TierId | null => (id in TIERS ? (id as TierId) : null);

export function PlansSection({ variant = "account" }: { variant?: "account" | "public" }) {
  const router = useRouter();
  const [upgradePlan, setUpgradePlan] = useState<Plan | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  // A downgrade that fits needs no selection step — just this confirm (scenario 1).
  const [downgradeTo, setDowngradeTo] = useState<TierId | null>(null);
  const { tier } = useTier();
  const [pending, setPending] = useState<PendingDowngrade | null>(null);

  // Pending switch lives in localStorage, so read it after mount and follow changes.
  useEffect(() => {
    const sync = () => setPending(getPendingDowngrade());
    sync();
    return onDowngradeChanged(sync);
  }, []);
  // Individual tiers vs Teams & Enterprise — a quiet segmented toggle instead of
  // cramming the custom-priced plans in as extra columns (Claude-style).
  const [tab, setTab] = useState<"individual" | "business">("individual");
  // "public" = the marketing pricing page (no logged-in user): no current plan,
  // and CTAs start the free signup instead of the in-app upgrade flow.
  const isPublic = variant === "public";

  const onCta = (plan: Plan) => {
    if (isContactSales(plan)) {
      setContactOpen(true);
      return;
    }
    if (isPublic) {
      router.push("/onboarding");
      return;
    }
    const target = asTierId(plan.id);
    // Same plan, or a destination that isn't reachable (the trial) — no action.
    if (!target || !canSwitchTo(tier.id, target)) return;

    // Moving down: does the workspace already fit? If yes we can confirm in
    // place (scenario 1); if not, the switch pauses on the selection step so
    // the user can choose what to keep (scenarios 2 & 3).
    if (isDowngrade(tier.id, target)) {
      // Anchor the tier being switched FROM. Otherwise a switch started while
      // previewing (?tier=pro) would outlive the param and leave a pending
      // downgrade hanging off a plan the workspace isn't on.
      setTierId(tier.id);
      if (fitsWithoutArchiving(allAssets(), TIERS[target])) setDowngradeTo(target);
      else router.push(`/plans/downgrade?to=${target}&tier=${tier.id}`);
      return;
    }
    setUpgradePlan(plan);
  };

  const confirmDowngrade = (to: TierId) => {
    scheduleDowngrade(to, []);
    clearTierPreview();
    setDowngradeTo(null);
  };

  // Self-serve tiers (Free/Basic/Standard/Pro) vs the sales-led ones.
  const tiers = PLANS.filter((p) => !isContactSales(p));
  const business = PLANS.filter((p) => isContactSales(p));

  return (
    <>
      {/* A scheduled switch is reversible right up to the date it applies. */}
      {!isPublic && pending && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[14px] border border-border bg-amber/60 px-4 py-3">
          <CalendarClock size={16} className="shrink-0 text-amber-text" />
          <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-gray-2">
            Downgrading to <span className="font-semibold">{tierName(pending.to)}</span> on{" "}
            <span className="font-semibold">{pending.effectiveOn}</span>.
            {pending.archive.length > 0 && (
              <>
                {" "}
                {pending.archive.length} item{pending.archive.length === 1 ? "" : "s"} will be
                archived — nothing is deleted.
              </>
            )}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={cancelDowngrade}
              className="rounded-btn border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-2 hover:border-violet hover:text-violet"
            >
              Keep {tier.name}
            </button>
            {/* Prototype only: production applies this on the effective date. */}
            <button
              type="button"
              onClick={() => {
                const applied = applyPendingDowngrade();
                if (!applied) return;
                clearTierPreview();
                toast.success(`Now on ${tierName(applied.to)}`, {
                  description: `${applied.archive.length} item${applied.archive.length === 1 ? "" : "s"} moved to My Archive — nothing was deleted.`,
                  action: { label: "Open archive", onClick: () => router.push("/my-archive") },
                });
              }}
              className="rounded-btn border border-dashed border-amber-text/50 bg-white px-3 py-1.5 text-[12px] font-semibold text-amber-text hover:border-amber-text"
            >
              Apply now (demo)
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-bg-input/60 p-1">
          {([["individual", "Individual"], ["business", "Teams & Enterprise"]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "rounded-full px-5 py-2 text-[13px] font-semibold transition-colors",
                tab === key ? "bg-white text-dark shadow-sm" : "text-gray-4 hover:text-gray-2",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "individual" ? (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isPublic={isPublic}
              currentTier={tier.id}
              onCta={() => onCta(plan)}
            />
          ))}
        </div>
      ) : (
        // Teams + Enterprise: full-width single column on mobile, two centered
        // cards from sm+ (comfortable width — a lone ¼-column card reads cramped).
        <div className="mx-auto grid w-full gap-4 sm:max-w-[720px] sm:grid-cols-2">
          {business.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isPublic={isPublic}
              currentTier={tier.id}
              onCta={() => onCta(plan)}
            />
          ))}
        </div>
      )}

      <UpgradePlanModal plan={upgradePlan} onOpenChange={(open) => !open && setUpgradePlan(null)} />
      <ContactSalesModal open={contactOpen} onOpenChange={setContactOpen} />
      <DowngradeConfirmModal
        to={downgradeTo}
        onCancel={() => setDowngradeTo(null)}
        onConfirm={confirmDowngrade}
      />
    </>
  );
}

function PlanCard({
  plan,
  onCta,
  isPublic = false,
  currentTier,
}: {
  plan: Plan;
  onCta: () => void;
  isPublic?: boolean;
  currentTier?: TierId;
}) {
  const Icon = ICONS[plan.icon];
  const target = asTierId(plan.id);
  // On the public pricing page nobody is signed in — no "current plan", and the
  // action is to start the free signup (Teams still goes to contact sales).
  // In-app the current plan comes from the tier store, not the static data, so
  // the ?tier= preview param drives it too.
  const isCurrent = !isPublic && (currentTier ? plan.id === currentTier : plan.current);
  // The trial is entry-only: once you're on a plan it's no longer a destination,
  // so the card stays for comparison but isn't actionable.
  const unreachable =
    !isPublic && !isCurrent && !!currentTier && !!target && !canSwitchTo(currentTier, target);
  const goingDown =
    !isPublic && !unreachable && !!currentTier && !!target && isDowngrade(currentTier, target);
  // Custom-priced plans always go to sales; the rest start the free signup on
  // the public page. A cheaper tier is a switch, not an upgrade.
  const ctaLabel = isPublic && !isContactSales(plan)
    ? "Start free"
    : isCurrent
      ? "Current plan"
      : unreachable
        ? "Not available"
        : goingDown
          ? `Downgrade to ${plan.name}`
          : plan.cta;
  // "Recommended" is a signal for someone choosing a plan, not for someone who
  // already has one — badging a cheaper tier would be nudging a paying customer
  // to spend less. Keep it on the public page and on genuine upgrades only.
  const showRecommended = plan.recommended && (isPublic || (!isCurrent && !goingDown && !unreachable));

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-[18px] border-[1.5px] bg-white p-5 transition-[border-color,box-shadow] duration-150",
        showRecommended
          ? "border-violet shadow-[0_12px_32px_rgba(108,92,231,0.12)]"
          : "border-border",
      )}
    >
      {showRecommended && (
        <span className="absolute -top-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center rounded-full bg-violet px-3 py-1 font-heading text-[9.5px] font-bold uppercase tracking-[0.14em] text-white">
          Recommended
        </span>
      )}

      {/* Header — icon beside a name+tagline column, so the tagline sits under
          the title (not the icon). Fixed height so prices line up across cards.
          (Current state = CTA + mint border, not a badge that would collide.) */}
      <div className="flex min-h-[58px] items-start gap-2.5">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[12px]", TILE[plan.icon])}>
          <Icon size={20} strokeWidth={1.9} />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-[16px] font-bold tracking-[-0.3px] text-dark">{plan.name}</h3>
          <p className="mt-0.5 text-[12px] leading-[1.35] text-gray-4">{plan.tagline}</p>
        </div>
      </div>

      {/* Price */}
      <div className="flex min-h-[58px] flex-col justify-center border-y border-border py-3">
        <div className="font-sans text-[21px] font-bold leading-none tracking-[-0.5px] text-dark tabular-nums">
          {plan.priceLabel}
        </div>
        <div className="mt-1.5 text-[12px] font-medium text-gray-4">{plan.priceUnit}</div>
      </div>

      {/* Features */}
      <ul className="mt-4 flex-1 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[12.5px] leading-[1.4] text-gray-3">
            <Check size={14} strokeWidth={2.5} className="mt-px shrink-0 text-gray-4" />
            {f}
          </li>
        ))}
      </ul>

      {/* Ideal for — fixed height so it lines up across every card */}
      <div className="mt-4 flex min-h-[68px] flex-col justify-center rounded-[12px] bg-bg-input/60 px-3.5 py-3">
        <div className="font-heading text-[9.5px] font-bold uppercase tracking-[0.12em] text-gray-5">Ideal for</div>
        <div className="mt-1 text-[12px] font-semibold leading-[1.35] text-gray-2">{plan.idealFor}</div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onCta}
        disabled={isCurrent || unreachable}
        title={unreachable ? "The free trial is a one-time introduction — it can't be returned to." : undefined}
        className={cn(
          "mt-4 inline-flex min-h-[46px] items-center justify-center rounded-[12px] px-3 py-2 text-center text-[13px] font-bold leading-tight transition-colors",
          isCurrent || unreachable
            ? "cursor-default border-[1.5px] border-border bg-bg-input/40 text-gray-4"
            : showRecommended
              ? "bg-violet text-white hover:bg-violet-h"
              : goingDown
              // A cheaper tier is a lateral move, not the page's goal — keep it
              // available but quiet so it doesn't compete with the upgrades.
              ? "border-[1.5px] border-border bg-white text-gray-2 hover:border-violet hover:text-violet"
              : plan.recommended
                ? "bg-violet text-white hover:bg-violet-h"
                : "bg-dark text-white hover:bg-gray-2",
        )}
      >
        {ctaLabel}
      </button>
    </article>
  );
}

