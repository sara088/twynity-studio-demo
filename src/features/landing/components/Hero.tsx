import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative z-10 pb-[60px] pt-[130px]">
      <div className="mx-auto max-w-[1120px] px-7 text-center">
        <span className="inline-block rounded-chip border border-border bg-white px-[14px] py-[6px] text-[11.5px] font-bold uppercase tracking-[0.6px] text-violet">
          Now in early access
        </span>
        <h1 className="mx-auto mt-7 max-w-[880px] font-heading text-[clamp(38px,6vw,68px)] font-semibold leading-[1.05] tracking-[-2.2px] text-dark">
          A virtual workforce — with{" "}
          <span className="text-violet">real humans</span> behind it.
        </h1>
        <p className="mt-3 text-[19px] font-medium italic text-gray-3">
          — starting with you.
        </p>
        <p className="mx-auto mt-[22px] max-w-[560px] text-[16px] leading-[1.55] text-gray-3">
          Multiply yourself, or hire the best version of someone else. Either
          way, the real human stays in the loop.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

        <div className="mt-10 flex flex-col items-center gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-5">
            Trusted by teams at
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 font-heading text-[16px] font-semibold tracking-[-0.2px] text-gray-3">
            {["Linear", "Stripe", "Notion", "Vercel", "Figma"].map((o, i, a) => (
              <span key={o} className="flex items-center gap-4">
                <span>{o}</span>
                {i < a.length - 1 && (
                  <span className="h-[3px] w-[3px] rounded-full bg-gray-6" />
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-14 mx-auto w-full max-w-[920px] overflow-hidden rounded-[24px]">
          <Image
            src="/hero1.png"
            alt="Two members of the Twynity workforce"
            width={1100}
            height={620}
            priority
            className="h-auto w-full object-cover object-top"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
              maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
