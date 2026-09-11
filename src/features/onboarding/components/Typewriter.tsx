"use client";

import { useEffect, useState } from "react";

export function Typewriter({
  text,
  speed = 26,
  punctuationDelay = 220,
}: {
  text: string;
  speed?: number;
  punctuationDelay?: number;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    setShown("");
    let i = 0;
    let cancelled = false;
    function step() {
      if (cancelled) return;
      if (i >= text.length) return;
      const ch = text[i];
      i += 1;
      setShown(text.slice(0, i));
      const delay =
        ch === "." || ch === "?" || ch === "!" || ch === ","
          ? punctuationDelay
          : speed;
      setTimeout(step, delay);
    }
    step();
    return () => {
      cancelled = true;
    };
  }, [text, speed, punctuationDelay]);

  return (
    <span>
      {shown}
      <span className="inline-block h-4 w-[2px] -mb-0.5 ml-0.5 animate-pulse bg-violet" />
    </span>
  );
}
