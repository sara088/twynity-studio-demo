import { TeamChatView } from "@/features/teams/components/TeamChatView";

export default async function TeamChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamChatView teamId={id} />;
}

export function generateStaticParams() {
  return ["launch-squad", "growth-pod"].map((id) => ({ id }));
}
