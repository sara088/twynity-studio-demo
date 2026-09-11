import Link from "next/link";
import { WordmarkDot } from "./Logo";
import { ProgressDots } from "./ProgressDots";

export function FlowTopbar({
  totalSteps,
  currentIndex,
  rightSlot,
  exitHref = "/",
  exitLabel = "Exit",
}: {
  totalSteps: number;
  currentIndex: number;
  rightSlot?: React.ReactNode;
  exitHref?: string;
  exitLabel?: string;
}) {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 flex h-[60px] items-center justify-between border-b border-border px-7 backdrop-blur-[14px]"
      style={{ background: "rgba(243, 242, 248, 0.86)" }}
    >
      <WordmarkDot />
      <ProgressDots total={totalSteps} currentIndex={currentIndex} />
      <div className="flex items-center gap-3">
        {rightSlot}
        <Link
          href={exitHref}
          className="text-[12.5px] font-medium text-gray-3 hover:text-dark"
        >
          {exitLabel}
        </Link>
      </div>
    </header>
  );
}
