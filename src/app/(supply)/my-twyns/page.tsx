import { PageHeader } from "@/features/shared/components/PageHeader";
import { MyTwynsGrid } from "@/features/my-twyns/components/MyTwynsGrid";

export default function MyTwynsPage() {
  return (
    <>
      <PageHeader
        title="My twyns"
        subtitle="Each twyn is a version of you for one kind of work. Talk to them, connect their tools, deepen their skills."
      />
      <MyTwynsGrid />
    </>
  );
}
