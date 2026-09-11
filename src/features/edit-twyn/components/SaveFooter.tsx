// Save/Discard footer shown at the bottom of a section when it has unsaved edits.
// Shared so every editable section uses the exact same control.
export function SaveFooter({ onDiscard, onSave }: { onDiscard: () => void; onSave: () => void }) {
  return (
    <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-border pt-4">
      <button
        type="button"
        onClick={onDiscard}
        className="inline-flex h-9 items-center rounded-btn px-4 text-[13px] font-semibold text-gray-3 transition-colors hover:text-dark"
      >
        Discard
      </button>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex h-9 items-center rounded-btn bg-violet px-5 text-[13px] font-bold text-white transition-colors hover:bg-violet-h"
      >
        Save changes
      </button>
    </div>
  );
}
