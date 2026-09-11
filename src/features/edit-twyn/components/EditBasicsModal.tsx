"use client";

import { useEffect, useState } from "react";
import { Trash2, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PillButton } from "@/features/shared/components/PillButton";
import { Field } from "@/features/shared/components/Field";

const GENDERS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
  { value: "other", label: "Other" },
];

// Edit-basics modal — rename the twyn and set its role + gender.
export function EditBasicsModal({
  open,
  onOpenChange,
  name,
  role,
  gender,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  role: string;
  gender: string;
  onSave: (next: { name: string; role: string; gender: string }) => void;
  /** Permanently delete this twyn (all tiers). */
  onDelete?: () => void;
}) {
  const [draftName, setDraftName] = useState(name);
  const [draftRole, setDraftRole] = useState(role);
  const [draftGender, setDraftGender] = useState(gender);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset drafts to the latest values whenever the modal opens.
  useEffect(() => {
    if (open) {
      setDraftName(name);
      setDraftRole(role);
      setDraftGender(gender);
      setConfirmDelete(false);
    }
  }, [open, name, role, gender]);

  const inputCls = "h-11 rounded-input border-border bg-white px-[14px] text-[14px] placeholder:text-gray-6";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-card p-7">
        <DialogTitle className="font-heading text-[19px] font-semibold tracking-[-0.4px] text-dark">
          Edit basics
        </DialogTitle>
        <DialogDescription className="mt-1 text-[13px] text-gray-3">
          Rename your twyn and set their role.
        </DialogDescription>

        <form
          className="mt-5 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              name: draftName.trim() || name,
              role: draftRole.trim() || role,
              gender: draftGender || gender,
            });
            onOpenChange(false);
          }}
        >
          <Field label="Twyn name" htmlFor="eb-name">
            <Input id="eb-name" value={draftName} onChange={(e) => setDraftName(e.target.value)} className={inputCls} />
          </Field>

          <Field label="Gender" htmlFor="eb-gender">
            <Select value={draftGender} onValueChange={setDraftGender}>
              <SelectTrigger id="eb-gender" className={inputCls}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div>
            <Field label="Role" htmlFor="eb-role">
              <Input
                id="eb-role"
                value={draftRole}
                onChange={(e) => setDraftRole(e.target.value)}
                placeholder="e.g. Graduate Executive, Product Designer…"
                className={inputCls}
              />
            </Field>
            <p className="mt-1.5 text-[12px] leading-[1.45] text-gray-4">
              All twyns start as Graduate Executive. Update this as your twyn gains
              experience and specialization.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-1">
            <PillButton type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </PillButton>
            <PillButton type="submit" size="sm">
              Save changes
            </PillButton>
          </div>
        </form>

        {/* Delete — available on every tier. Two-step to avoid accidents. */}
        {onDelete && (
          <div className="mt-5 border-t border-border pt-4">
            {confirmDelete ? (
              <div className="rounded-input border border-error/25 bg-error/5 p-3.5">
                <div className="flex items-start gap-2.5">
                  <TriangleAlert size={16} className="mt-px shrink-0 text-error" />
                  <p className="text-[12.5px] leading-[1.5] text-gray-2">
                    <span className="font-bold text-dark">Delete {name}?</span>{" "}
                    This permanently removes this twyn — its chats, skills, and connected tools. This can&apos;t be undone.
                  </p>
                </div>
                <div className="mt-3 flex justify-end gap-2.5">
                  <PillButton type="button" variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </PillButton>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-error px-5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <Trash2 size={14} /> Delete twyn
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12.5px] text-gray-4">Delete this twyn permanently.</span>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-error/30 px-3.5 py-2 text-[12.5px] font-semibold text-error transition-colors hover:bg-error/5"
                >
                  <Trash2 size={14} /> Delete twyn
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
