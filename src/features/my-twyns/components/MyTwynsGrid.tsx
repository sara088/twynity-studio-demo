"use client";

import { useEffect, useState } from "react";
import { TWYNS } from "@/features/my-twyns/data/mock-data";
import { TwynCard } from "@/features/my-twyns/components/TwynCard";
import { AddTwynTile } from "@/features/my-twyns/components/AddTwynTile";
import { getDeletedTwyns, onDeletedTwynsChanged } from "@/features/my-twyns/lib/deleted";
import { useArchive } from "@/features/archive/hooks/useArchive";
import Link from "next/link";
import { Archive } from "lucide-react";

// Client list so deleted twyns drop out immediately (and stay out across visits).
export function MyTwynsGrid() {
  const [deleted, setDeleted] = useState<string[]>([]);
  useEffect(() => {
    const load = () => setDeleted(getDeletedTwyns());
    load();
    return onDeletedTwynsChanged(load);
  }, []);

  const { ids: archived } = useArchive();
  const twyns = TWYNS.filter((t) => !deleted.includes(t.id) && !archived.has(t.id));
  const archivedTwyns = TWYNS.filter((t) => !deleted.includes(t.id) && archived.has(t.id)).length;

  return (
    <>
      <div className="grid justify-center gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),360px))] sm:justify-start">
        {twyns.map((t) => (
          <TwynCard key={t.id} twyn={t} />
        ))}
        <AddTwynTile />
      </div>

      {/* Archived twyns aren't gone, and a grid that silently drops them would
          read as data loss. Only shown when there's something to point at. */}
      {archivedTwyns > 0 && (
        <Link
          href="/my-archive"
          className="mt-5 inline-flex items-center gap-2 rounded-[12px] border border-border bg-white px-3.5 py-2 text-[12.5px] font-semibold text-gray-3 transition-colors hover:border-violet hover:text-violet"
        >
          <Archive size={14} />
          {archivedTwyns} twyn{archivedTwyns === 1 ? "" : "s"} in your archive
        </Link>
      )}
    </>
  );
}
