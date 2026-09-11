import Link from "next/link";
import { Code2, TrendingUp, Users, Lightbulb, Plus } from "lucide-react";

const DEPTS = [
  {
    name: "Development",
    count: 3,
    icon: Code2,
    members: [
      { initial: "J", name: "Jamie", role: "Senior · twyn", tone: "violet" as const },
      { initial: "S", name: "Sam",   role: "Lead · twyn",   tone: "alt"    as const },
    ],
  },
  {
    name: "Sales",
    count: 2,
    icon: TrendingUp,
    members: [],
  },
  {
    name: "HR Team",
    count: 2,
    icon: Users,
    members: [
      { initial: "A", name: "Alex", role: "Senior · twyn", tone: "violet" as const },
    ],
  },
  {
    name: "Innovation",
    count: 1,
    icon: Lightbulb,
    members: [],
  },
];

const AVATAR_BG = {
  violet: "bg-violet text-white",
  alt:    "bg-accent-blue text-white",
};

export function OrgsSection() {
  return (
    <section id="orgs" className="relative z-10 py-[100px]">
      <div className="mx-auto max-w-[1120px] px-7">

        {/* Section head */}
        <div className="mx-auto mb-14 max-w-[720px] text-center">
          <div className="mb-[14px] text-[11.5px] font-bold uppercase tracking-[1.2px] text-violet">
            For Organizations
          </div>
          <h2 className="mt-[14px] font-heading text-[44px] font-semibold leading-[1.1] tracking-[-1.4px] text-dark">
            Build your virtual team
          </h2>
          <p className="mx-auto mt-[18px] max-w-[560px] text-[16px] leading-[1.6] text-gray-3">
            Hire twyns into specific roles across your departments. Real
            expertise — available immediately, fully auditable, always answering
            to a human.
          </p>
        </div>

        {/* Org chart */}
        <div className="mx-auto max-w-[880px]">

          {/* CEO card — mb-[40px] provides space for the vertical line drawn via ::after */}
          <div className="mb-[40px] flex justify-center">
            <div className="relative inline-flex items-center gap-3 rounded-input border border-border bg-white px-[22px] py-4 shadow-[0_8px_24px_rgba(15,15,30,0.04)]">
              <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-violet text-[14px] font-bold text-white">
                TG
              </div>
              <div>
                <div className="text-[14.5px] font-bold tracking-[-0.2px] text-dark">Thomas Quattrini</div>
                <div className="text-[11.5px] font-medium text-gray-4">CEO</div>
              </div>
              {/* vertical line down to horizontal bar */}
              <div className="pointer-events-none absolute bottom-0 left-1/2 h-[40px] w-px -translate-x-1/2 translate-y-full bg-border" />
            </div>
          </div>

          {/* Dept grid — horizontal bar + per-dept vertical drops via relative children */}
          <div className="relative grid gap-[14px] md:grid-cols-2 lg:grid-cols-4">
            {/* horizontal bar across column tops */}
            <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-0 hidden h-px -translate-y-[20px] bg-border lg:block" />

            {DEPTS.map((d) => {
              const Icon = d.icon;
              return (
                <article
                  key={d.name}
                  className="relative flex flex-col rounded-input border border-border bg-white p-4"
                >
                  {/* vertical drop from horizontal bar */}
                  <div className="pointer-events-none absolute left-1/2 top-0 hidden h-[20px] w-px -translate-x-1/2 -translate-y-full bg-border lg:block" />

                  {/* Dept header */}
                  <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
                    <div className="grid h-6 w-6 shrink-0 place-items-center rounded-[6px] bg-violet-mid text-violet">
                      <Icon size={14} strokeWidth={1.8} />
                    </div>
                    <div className="text-[12.5px] font-bold tracking-[-0.2px] text-dark">
                      {d.name}
                    </div>
                    <div className="ml-auto text-[10.5px] font-semibold text-gray-4">
                      {d.count} {d.count === 1 ? "Twyn" : "Twyns"}
                    </div>
                  </div>

                  {/* Members */}
                  <div className="flex flex-1 flex-col gap-[6px]">
                    {d.members.map((m) => (
                      <div
                        key={m.initial}
                        className="flex items-center gap-2 rounded-[8px] bg-bg-input px-2 py-[6px]"
                      >
                        <div className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-[9px] font-bold ${AVATAR_BG[m.tone]}`}>
                          {m.initial}
                        </div>
                        <span className="text-[11.5px] font-semibold text-dark">{m.name}</span>
                        <span className="ml-auto text-[10px] font-medium text-gray-4">{m.role}</span>
                      </div>
                    ))}
                    <Link
                      href="/demo"
                      className="mt-auto flex items-center gap-[6px] rounded-[8px] border border-dashed border-gray-6 bg-transparent px-2 py-[6px] text-[11px] font-semibold text-gray-4 transition-colors hover:border-violet hover:text-violet"
                    >
                      <Plus size={10} />
                      Hire a twyn
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/demo"
            className="group inline-flex h-[48px] items-center gap-2 rounded-btn bg-violet px-[22px] text-[14.5px] font-semibold text-white transition-[background,transform] duration-150 ease-soft hover:-translate-y-px hover:bg-violet-h"
          >
            Build your team
            <span className="transition-transform duration-150 group-hover:translate-x-[3px]">→</span>
          </Link>
          <Link
            href="/marketplace?public"
            className="inline-flex h-[48px] items-center rounded-btn border-[1.5px] border-border bg-transparent px-[22px] text-[14.5px] font-semibold text-gray-2 transition-colors duration-150 hover:border-violet hover:text-violet"
          >
            Browse the marketplace
          </Link>
        </div>

      </div>
    </section>
  );
}
