import * as React from "react";
import { Image as ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────
// Media — an image or video block with an optional caption. Without a `src`
// it renders a tokenised placeholder (handy in the loading/empty path). Always
// pass `alt` for accessibility (AA).
// ─────────────────────────────────────────────────────────────────────────

function Media({
  src,
  alt = "",
  caption,
  aspect = "16 / 9",
  className,
}: {
  src?: string;
  alt?: string;
  caption?: React.ReactNode;
  aspect?: string;
  className?: string;
}) {
  return (
    <figure
      data-slot="mcp-media"
      className={cn(
        "overflow-hidden rounded-[12px] border border-border bg-white",
        className
      )}
    >
      <div
        className="grid place-items-center bg-violet-light text-violet"
        style={{ aspectRatio: aspect }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={24} className="opacity-70" />
        )}
      </div>
      {caption != null && (
        <figcaption className="px-3 py-2 text-[12px] text-gray-3">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export { Media };
