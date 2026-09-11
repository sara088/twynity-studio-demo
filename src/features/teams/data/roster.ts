// The twyns you can put on a team: your own twyns (owned) + ones you've purchased
// from the marketplace. Prototype roster.

export interface RosterTwyn {
  id: string;
  name: string;
  role: string;
  portrait: string;
  /** true = one of your twyns; false = purchased from the marketplace. */
  owned: boolean;
}

export const ROSTER: RosterTwyn[] = [
  // Your twyns (mirror /my-twyns)
  { id: "sara", name: "Virtual Bob", role: "Sales Rep", portrait: "/assets/bob.png", owned: true },
  { id: "elena", name: "Virtual Elena", role: "Strategy Consultant", portrait: "/assets/persona-consult-f.png", owned: true },
  { id: "priya", name: "Virtual Priya", role: "Growth Lead", portrait: "/assets/persona-prof-f.png", owned: true },
  // Purchased from the marketplace
  { id: "rey", name: "Rey", role: "Data Analyst", portrait: "/assets/persona-analytic-f.png", owned: false },
  { id: "milo", name: "Milo", role: "Copywriter", portrait: "/assets/persona-creative-m.png", owned: false },
  { id: "ari", name: "Ari", role: "Researcher", portrait: "/assets/persona-tech-f.png", owned: false },
  { id: "sol", name: "Sol", role: "Sales Rep", portrait: "/assets/persona-lead-m.png", owned: false },
  { id: "dax", name: "Dax", role: "Engineer", portrait: "/assets/persona-dev-m.png", owned: false },
];

export function getRosterTwyn(id: string): RosterTwyn | undefined {
  return ROSTER.find((r) => r.id === id);
}
