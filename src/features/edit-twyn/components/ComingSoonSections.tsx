// Future phases — permanently-collapsed teasers (title + "Soon" only). These
// are not expandable; they just signal what's coming.
const SOON_SECTIONS = [
  "Sharpen Virtual Bob",
  "Captured facts",
  "Identity & status",
];

export function ComingSoonSections() {
  return (
    <div className="space-y-3">
      {SOON_SECTIONS.map((title) => (
        <div
          key={title}
          className="flex items-center gap-2.5 rounded-card border border-dashed border-border bg-bg-input/40 px-5 py-3.5"
        >
          <h2 className="font-heading text-[15.5px] font-semibold tracking-[-0.3px] text-gray-4">
            {title}
          </h2>
          <span className="rounded-full border border-gray-6 bg-white px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-gray-5">
            Soon
          </span>
        </div>
      ))}
    </div>
  );
}
