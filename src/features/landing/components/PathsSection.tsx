import Link from "next/link";
import { User, LayoutGrid, Grid2x2 } from "lucide-react";

const PATHS = [
  {
    tag: "For people · Supply",
    tagTone: "bg-tag-green text-tag-green-text",
    icon: User,
    title: "Multiply yourself",
    desc: "Capture your skills, decisions, and refusals in a twyn that earns while you stay in control. First twyn free · extras $29/mo.",
    cta: "Create your twyn",
    href: "/onboarding",
  },
  {
    tag: "The bridge",
    tagTone: "bg-violet-mid text-violet",
    icon: LayoutGrid,
    title: "The marketplace",
    desc: "Every twyn is listed by name, reviewed by Twynity, and reachable for L2 escalation. Browse capabilities, workflows, and frameworks.",
    cta: "Open marketplace",
    href: "/marketplace?public",
  },
  {
    tag: "For orgs · Demand",
    tagTone: "bg-tag-amber text-tag-amber-text",
    icon: Grid2x2,
    title: "Hire a virtual workforce",
    desc: "By the day or by the month. Place twyns inside your org chart alongside humans. Refusals binding, audit trail by default.",
    cta: "Build your team",
    href: "/demo",
  },
];

export function PathsSection() {
  return (
    <section id="paths" className="relative z-10 py-[100px]">
      <div className="mx-auto max-w-[1120px] px-7">
        <div className="mb-14 text-center">
          <div className="mb-[14px] text-[11.5px] font-bold uppercase tracking-[1.2px] text-violet">
            What you came here for
          </div>
          <h2 className="mt-[14px] font-heading text-[44px] font-semibold leading-[1.1] tracking-[-1.4px] text-dark">
            Pick your side.
          </h2>
          <p className="mx-auto mt-[18px] max-w-[560px] text-[16px] leading-[1.6] text-gray-3">
            Twynity is a two-sided marketplace. People multiply themselves on
            one side; organisations hire that expertise on the other. The
            marketplace sits in the middle — every twyn backed by a real human
            you can reach.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PATHS.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.title}
                className="group flex flex-col rounded-card border border-border bg-white px-6 pb-[22px] pt-6 transition-[border-color,transform,box-shadow] duration-[180ms] ease-soft hover:-translate-y-[3px] hover:border-violet hover:shadow-[0_18px_40px_rgba(15,15,30,0.06)]"
              >
                <span
                  className={`mb-[14px] inline-block w-fit rounded-[6px] px-[10px] py-[4px] text-[10.5px] font-bold uppercase tracking-[0.5px] ${p.tagTone}`}
                >
                  {p.tag}
                </span>
                <div className="mb-[14px] mt-1 grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-violet-mid text-violet">
                  <Icon size={20} />
                </div>
                <h3 className="mb-[14px] font-heading text-[19px] font-semibold leading-[1.25] tracking-[-0.4px] text-dark">
                  {p.title}
                </h3>
                <p className="flex-1 text-[13.5px] leading-[1.6] text-gray-3">
                  {p.desc}
                </p>
                <Link
                  href={p.href}
                  className="mt-[18px] inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-violet px-[18px] text-[13.5px] font-semibold text-white transition-colors duration-150 hover:bg-violet-h"
                >
                  {p.cta} <span>→</span>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
