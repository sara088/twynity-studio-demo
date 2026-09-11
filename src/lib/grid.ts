// Shared card-grid for catalogue / inventory pages (marketplace View-All,
// Workshop, …) so the whole app shares one column rhythm. Pair it with a
// `max-w-[1100px]` container for a consistent ~4-up layout.
export const CARD_GRID =
  "grid items-stretch gap-4 [grid-template-columns:repeat(auto-fill,minmax(256px,1fr))]";
