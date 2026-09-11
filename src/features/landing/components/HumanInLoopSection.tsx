import {
  ShieldCheck,
  MessageCircle,
  Lock,
  Target,
  Clock,
  Users,
  User,
  Eye,
  Zap,
} from "lucide-react";

// cx/cy = center point in the 380×380 SVG viewBox (matches the design's exact line endpoints)
// CSS left/top position the node div so its center lands on cx/cy
const NODES = [
  { key: "tl", cx: 106, cy:  50, label: "Refusals", Icon: ShieldCheck },
  { key: "tr", cx: 274, cy:  50, label: "Memory",   Icon: MessageCircle },
  { key: "l",  cx:  36, cy: 190, label: "Values",   Icon: Lock },
  { key: "r",  cx: 344, cy: 190, label: "Workflow",  Icon: Target },
  { key: "bl", cx: 106, cy: 330, label: "Audit",    Icon: Clock },
  { key: "br", cx: 274, cy: 330, label: "Level-2",  Icon: Users },
];

const FEATURES = [
  {
    Icon: ShieldCheck,
    name: "Refusals are binding",
    desc: "The things you say you won't do — your twyn can't be pushed past them. Ever.",
  },
  {
    Icon: Eye,
    name: "Full transparency",
    desc: "Every interaction logged. Every decision auditable. No black boxes, no surprises.",
  },
  {
    Icon: Zap,
    name: "Instant escalation",
    desc: "Step in any time. Or have your twyn page you when it hits a question only you can answer.",
  },
];

export function HumanInLoopSection() {
  return (
    <section className="relative z-10 py-[100px]">
      <div className="mx-auto max-w-[1120px] px-7">
        <div className="grid items-center gap-[60px] lg:grid-cols-[1fr_1.05fr]">

          {/* Left — honeycomb diagram */}
          <div className="relative mx-auto aspect-square w-full max-w-[380px]">
            {/* SVG lines from center to each node — uses design's exact coordinates */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 380 380"
              aria-hidden
            >
              {NODES.map((h) => (
                <line
                  key={h.key}
                  x1="190"
                  y1="190"
                  x2={h.cx}
                  y2={h.cy}
                  stroke="var(--violet)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  strokeOpacity="0.34"
                />
              ))}
            </svg>

            {/* Center hex */}
            <div className="absolute left-1/2 top-1/2 grid h-[90px] w-[90px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-card bg-violet text-white shadow-[0_8px_24px_rgba(15,15,30,0.10)]">
              <User size={30} strokeWidth={1.8} />
            </div>

            {/* Orbit nodes — left/top position the center of each 72px box on cx/cy */}
            {NODES.map((h) => {
              const Icon = h.Icon;
              return (
                <div
                  key={h.key}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${(h.cx / 380) * 100}%`,
                    top: `${(h.cy / 380) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="grid h-[72px] w-[72px] place-items-center rounded-[16px] border-[1.5px] border-border bg-white text-violet shadow-[0_4px_16px_rgba(15,15,30,0.04)]">
                    <Icon size={24} strokeWidth={1.7} />
                  </div>
                  <span
                    className="absolute font-bold uppercase text-gray-4"
                    style={{ fontSize: "9.5px", letterSpacing: "0.4px", bottom: "-18px", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}
                  >
                    {h.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right — copy + feature cards */}
          <div>
            <div className="mb-[10px] text-[11.5px] font-bold uppercase tracking-[1.2px] text-violet">
              Human in the loop
            </div>
            <h2 className="my-[10px] font-heading text-[40px] font-semibold leading-[1.1] tracking-[-1.3px] text-dark">
              Your twyn works.{" "}
              <span className="text-violet">You decide.</span>
            </h2>
            <p className="mb-7 max-w-[500px] text-[16px] leading-[1.6] text-gray-3">
              Twynity is built on a simple principle: AI should amplify human
              judgment, not replace it. You set the rules, approve critical
              decisions, and stay in control — always.
            </p>

            <div className="flex flex-col gap-[10px]">
              {FEATURES.map((f) => {
                const Icon = f.Icon;
                return (
                  <div
                    key={f.name}
                    className="flex items-start gap-[14px] rounded-input border border-border bg-white px-5 py-[18px] transition-[border-color,transform] duration-150 ease-soft hover:translate-x-[2px] hover:border-violet"
                  >
                    <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] bg-violet-mid text-violet">
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="mb-[3px] text-[14.5px] font-bold text-dark">
                        {f.name}
                      </h3>
                      <p className="text-[13px] leading-[1.55] text-gray-3">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
