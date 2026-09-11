import type { FileKind, AttachmentMeta } from "../types";

// File types a conversation document drop / paperclip accepts. Story 10·4:
// "drop PDF or text files straight into the conversation window".
export const DOC_ACCEPT = ".pdf,.txt,.md,.csv,.doc,.docx";

function kindFromName(name: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "csv") return "csv";
  if (ext === "doc" || ext === "docx") return "doc";
  return "text";
}

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** Reduce a dropped/picked File to the lightweight meta the chat thread needs. */
export function describeFile(file: File): AttachmentMeta {
  return {
    name: file.name,
    sizeLabel: formatBytes(file.size),
    kind: kindFromName(file.name),
  };
}

/** Map a FileList (from a drop or the paperclip picker) to attachment meta. */
export function describeFiles(files: FileList | File[]): AttachmentMeta[] {
  return Array.from(files).map(describeFile);
}
