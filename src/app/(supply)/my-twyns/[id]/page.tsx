import { notFound } from "next/navigation";
import { getTwyn, TWYNS } from "@/features/my-twyns/data/mock-data";
import { EditTwynView } from "@/features/edit-twyn/components/EditTwynView";

export default async function EditTwynPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const twyn = getTwyn(id);
  if (!twyn) notFound();

  return <EditTwynView twyn={twyn} />;
}

// Static export: one page per twyn in the mock catalogue.
export function generateStaticParams() {
  return TWYNS.map((t) => ({ id: t.id }));
}
