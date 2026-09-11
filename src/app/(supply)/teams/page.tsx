import { PageHeader } from "@/features/shared/components/PageHeader";
import { TeamsGrid } from "@/features/teams/components/TeamsGrid";

export default function TeamsPage() {
  return (
    <>
      <PageHeader
        title="Teams"
        subtitle="Group your twyns into a team, pick who leads, and set how they collaborate — all on one central wallet."
      />
      <TeamsGrid />
    </>
  );
}
