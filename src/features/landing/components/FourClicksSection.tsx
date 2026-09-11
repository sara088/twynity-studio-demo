const STEPS = [
  {
    n: "01",
    title: "Express onboarding",
    desc: "Name, face, voice, what you do. Submit for review in under four clicks. You'll see your twyn in your dashboard right away — and on the marketplace once Twynity approves (~24h).",
  },
  {
    n: "02",
    title: "Add depth over time",
    desc: "Personality, decisions, refusals, memories. Captured through conversation with the avatar guide — not forms. Returnable any time.",
  },
  {
    n: "03",
    title: "Capture your workflows",
    desc: "The IP layer. List your frameworks separately on the marketplace. License access — never give the workflow away.",
  },
  {
    n: "04",
    title: "Stay in the loop. Earn while you sleep.",
    desc: "Your twyn escalates to you when it matters. Level-2 is the real you. Every time your twyn ships work, you get paid.",
  },
];

export function FourClicksSection() {
  return (
    <section id="individuals" className="relative z-10 py-[100px]">
      <div className="mx-auto max-w-[1120px] px-7">
        <div className="mx-auto mb-14 max-w-[720px] text-center">
          <div className="mb-[14px] text-[11.5px] font-bold uppercase tracking-[1.2px] text-violet">
            For Individuals
          </div>
          <h2 className="mt-[14px] font-heading text-[40px] font-semibold leading-[1.1] tracking-[-1.3px] text-dark">
            From you to your twyn, in{" "}
            <span className="text-violet">under four clicks</span>.
          </h2>
          <p className="mx-auto mt-[18px] max-w-[560px] text-[16px] leading-[1.6] text-gray-3">
            Then go as deep as you want. The more you capture, the more your
            twyn is worth.
          </p>
        </div>

        <ul className="mx-auto flex max-w-[720px] flex-col gap-9 border-l-2 border-border pl-8">
          {STEPS.map((s) => (
            <li key={s.n} className="relative">
              <span
                aria-hidden
                className="absolute -left-[41px] top-[6px] h-[18px] w-[18px] rounded-full border-2 border-violet bg-bg-page"
              />
              <div className="mb-1 text-[13px] font-bold tracking-[0.2px] text-violet">
                {s.n}
              </div>
              <h3 className="mb-1.5 font-heading text-[19px] font-semibold leading-[1.25] tracking-[-0.4px] text-dark">
                {s.title}
              </h3>
              <p className="text-[14.5px] leading-[1.6] text-gray-3">
                {s.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
