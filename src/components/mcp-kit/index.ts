// ─────────────────────────────────────────────────────────────────────────
// Twynity Studio — MCP App Component Kit
//
// The building blocks every MCP app composes from. All themed with Studio
// tokens (globals.css) so apps share one look across the inline card and the
// Canvas. This is the coded counterpart to the MCP App Design Guide; the live
// reference that exercises every component is the /mcp-guide route.
//
//   import { AppCard, AppHeader, AppBody, DataTable, Action } from "@/components/mcp-kit";
//
// Rule of thumb: reach for these before inventing new UI, keep ≤2 primary
// actions per card, and let the kit inherit the theme — don't reskin it.
// ─────────────────────────────────────────────────────────────────────────

// Frame + chrome
export { AppCard, AppHeader, AppHeaderAction, AppBody, AppFooter } from "./AppCard";
export { Action } from "./Action";
export { SectionLabel, Chip } from "./primitives";

// Content components
export { DataTable, type Column } from "./DataTable";
export { BarChart, type Bar } from "./BarChart";
export { List, type ListItem } from "./List";
export { KeyValue, type Pair } from "./KeyValue";
export { FileList, type FileRow } from "./FileList";
export { Media } from "./Media";
export { MapBlock, type Pin } from "./MapBlock";
export { Form, Field, Input, Select } from "./Form";

// Required states
export {
  StateRunning,
  StateLoading,
  StateEmpty,
  StateError,
  StatePermission,
  type LogStep,
} from "./states";
