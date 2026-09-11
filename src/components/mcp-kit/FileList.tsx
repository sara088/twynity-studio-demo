import * as React from "react";
import { FileText } from "lucide-react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────
// FileList — files/attachments an app produced or references. Each row shows a
// file icon, name, optional meta (size/type) and an optional trailing action.
// ─────────────────────────────────────────────────────────────────────────

type FileRow = {
  name: string;
  meta?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
};

function FileList({
  files,
  className,
}: {
  files: FileRow[];
  className?: string;
}) {
  return (
    <ul
      data-slot="mcp-file-list"
      className={cn("space-y-2", className)}
    >
      {files.map((f, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-[12px] border border-border bg-bg-input px-3 py-2.5"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-white text-violet">
            {f.icon ?? <FileText size={15} />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-dark">
              {f.name}
            </div>
            {f.meta != null && (
              <div className="truncate text-[11.5px] text-gray-4">{f.meta}</div>
            )}
          </div>
          {f.trailing != null && (
            <span className="shrink-0 text-gray-4">{f.trailing}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export { FileList };
export type { FileRow };
