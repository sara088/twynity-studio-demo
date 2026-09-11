import { WorkflowBuilder } from "@/features/workflows/components/WorkflowBuilder";

// OPTION A · native — the builder is ours, in our shell, in our design system.
export default function NativeBuilderPage() {
  return (
    <div className="h-[calc(100vh-56px)] px-4 py-4">
      <WorkflowBuilder theme="light" frame="native" backHref="/workflows" />
    </div>
  );
}
