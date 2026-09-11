import { TeamDetailView } from "@/features/teams/components/TeamDetailView";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamDetailView teamId={id} />;
}

// Static export: one page per seeded team. Teams created at runtime live in
// the client store, so the detail view renders them from there.
export function generateStaticParams() {
  return ["launch-squad", "growth-pod"].map((id) => ({ id }));
}
