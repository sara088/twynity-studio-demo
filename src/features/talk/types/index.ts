export type ChatRole = "user" | "twyn";

export type FileKind = "pdf" | "csv" | "doc" | "text";

// A document dropped/attached into the conversation. `status` drives the
// in-thread indexing → ready affordance (real indexing is backend).
export interface AttachmentMeta {
  name: string;
  sizeLabel: string;
  kind: FileKind;
}

export interface ChatAttachment extends AttachmentMeta {
  status: "indexing" | "ready";
}

export type ToolIcon = "search" | "doc" | "calendar" | "clock" | "mail";

// A tool the twyn ran during its turn — rendered as a subtle, collapsible
// activity step in the chat thread (story 6 · the live-video conversation's
// real-time tool-execution log, Claude/ChatGPT style).
export interface ToolStep {
  id: string;
  label: string;
  icon: ToolIcon;
  status: "running" | "done";
}

// A Canvas artifact the twyn produced during its turn (a doc, table, brief…).
// It renders as a compact card *inline* in the chat (Claude-style); clicking it
// expands the full thing into the side Canvas (or fullscreen on mobile).
export interface ChatArtifact {
  id: string;
  title: string;
  subtitle: string;
  // "document" opens the Canvas straight to the produced doc; "workflow" opens it
  // to the live run board (which then produces the doc); "app" opens it to an MCP
  // app, drawn from that app's descriptor (see data/mcp-apps.ts).
  kind: "document" | "workflow" | "app";
  /** For kind "workflow" — the equipped workflow this run belongs to. */
  workflowId?: string;
  /** For kind "app" — the MCP app descriptor id. */
  appId?: string;
  /** For kind "app" — parameters the app was invoked with (e.g. which deal). */
  appParams?: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  attachments?: ChatAttachment[];
  tools?: ToolStep[];
  artifact?: ChatArtifact;
}
