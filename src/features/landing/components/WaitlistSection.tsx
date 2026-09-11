import Link from "next/link";

export function WaitlistSection() {
  return (
    <section id="get-started" className="relative z-10 py-[100px]">
      <div className="mx-auto max-w-[760px] px-7">
        <div className="rounded-card border border-border bg-white px-[40px] pb-[56px] pt-[60px] text-center shadow-[0_30px_80px_rgba(15,15,30,0.06)]">
          <h2 className="mx-auto mb-[14px] max-w-[480px] font-heading text-[44px] font-semibold leading-[1.05] tracking-[-1.4px] text-dark">
            Two sides. <span className="text-violet">One marketplace.</span>
          </h2>
          <p className="mb-[30px] text-[15.5px] text-gray-3">
            Multiply yourself, or hire a virtual workforce with real humans behind every twyn. Pick a side — switch any time.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/onboarding"
              className="group inline-flex h-[48px] items-center gap-2 rounded-btn bg-violet px-[22px] text-[14.5px] font-semibold text-white transition-[background,transform] duration-150 ease-soft hover:-translate-y-px hover:bg-violet-h"
            >
              Create your twyn
              <span className="transition-transform duration-150 group-hover:translate-x-[3px]">→</span>
            </Link>
            <Link
              href="/demo"
              className="group inline-flex h-[48px] items-center gap-2 rounded-btn border-[1.5px] border-border bg-transparent px-[22px] text-[14.5px] font-semibold text-gray-2 transition-colors duration-150 hover:border-violet hover:text-violet"
            >
              Build your team
              <span className="transition-transform duration-150 group-hover:translate-x-[3px]">→</span>
            </Link>
          </div>
          <p className="mt-[22px] text-[12.5px] text-gray-4">
            First twyn is free. Extras are $29/mo. Every twyn reviewed by Twynity before going live.
          </p>
        </div>
      </div>
    </section>
  );
}
