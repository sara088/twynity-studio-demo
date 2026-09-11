import { EmbeddedBuilder } from "@/features/workflows/components/EmbeddedBuilder";

// OPTION C · embedded — the SAME external Workflow Builder, rendered in an iframe inside
// our shell and themed to match. The industry-standard middle path
// (Prismatic / Workato / Cyclr / n8n Embedded).
export default function EmbeddedBuilderPage() {
  return <EmbeddedBuilder />;
}
