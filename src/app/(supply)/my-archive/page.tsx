import { Suspense } from "react";
import { ArchiveView } from "@/features/archive/components/ArchiveView";

// `?restore=1` opens the restore step (arrived at from an upgrade), so the view
// reads search params and needs a boundary around it.
export default function MyArchivePage() {
  return (
    <Suspense fallback={null}>
      <ArchiveView />
    </Suspense>
  );
}
