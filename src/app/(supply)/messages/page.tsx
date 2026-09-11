import { PageHeader } from "@/features/shared/components/PageHeader";
import { SUPPLY_THREADS } from "@/features/messages/data/mock-data";
import { MessageThreadCard } from "@/features/messages/components/MessageThreadCard";

export default function MessagesPage() {
  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Conversations between you (or your twyns) and the orgs that hired them."
      />
      <div className="grid gap-3 max-w-[820px]">
        {SUPPLY_THREADS.map((t) => (
          <MessageThreadCard key={t.id} thread={t} />
        ))}
      </div>
    </>
  );
}
