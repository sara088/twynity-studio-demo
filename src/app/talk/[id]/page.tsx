import { notFound } from "next/navigation";
import { getTwyn, TWYNS } from "@/features/my-twyns/data/mock-data";
import { TalkEntry } from "./TalkEntry";

// Static export: one page per twyn. The start mode moves to the client, since
// there is no request to read searchParams from at build time.
export function generateStaticParams() {
  return TWYNS.map((t) => ({ id: t.id }));
}

export default async function TalkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const twyn = getTwyn(id);
  if (!twyn) notFound();
  return <TalkEntry twyn={twyn} />;
}
