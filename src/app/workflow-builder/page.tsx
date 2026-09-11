import { StandaloneBuilder } from "@/features/workflows/components/StandaloneBuilder";

// OPTION B · external — a SEPARATE application. Deliberately outside the
// (supply) route group, so it gets none of Twynity's chrome: no sidebar, no
// nav, no way back except the browser. That absence is the point of the demo.
export default function WorkflowBuilderRoutePage() {
  return <StandaloneBuilder />;
}
