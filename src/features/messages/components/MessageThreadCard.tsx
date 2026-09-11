import Image from "next/image";
import type { MessageThread } from "../data/mock-data";

export function MessageThreadCard({ thread }: { thread: MessageThread }) {
  return (
    <article className="flex items-start gap-3.5 rounded-[14px] border-[1.5px] border-border bg-white p-4 transition-colors hover:border-violet/40">
      <Image
        src={thread.fromAvatar}
        alt={thread.from}
        width={42}
        height={42}
        className="h-[42px] w-[42px] shrink-0 rounded-full bg-violet-mid object-cover object-top"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h3 className="truncate font-heading text-[14px] font-semibold tracking-[-0.2px] text-dark">
            {thread.from}
          </h3>
          <span className="shrink-0 text-[11px] text-gray-4 tabular-nums">
            {thread.ts}
          </span>
        </div>
        <p className="line-clamp-1 text-[13px] leading-[1.4] text-gray-3">
          {thread.preview}
        </p>
      </div>
      {thread.unread && (
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet" />
      )}
    </article>
  );
}
