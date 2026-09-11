// Persona Teams — a named group of member twyns with a lead model, a collaboration
// mode, and one shared wallet. Experimental (local only).

// Who leads the team:
//  • user    — you run the group chat, orchestrate + assign tasks to everyone.
//  • persona — you talk only to a delegated lead twyn; it manages the rest.
export type LeadModel = "user" | "persona";

// How members execute a delegated task:
//  • parallel    — all relevant members work at once.
//  • sequential  — a chain; each builds on the previous.
//  • conditional — approval-gated branches (you clear a gate before it continues).
export type Collaboration = "parallel" | "sequential" | "conditional";

export interface Team {
  id: string;
  name: string;
  /** Member twyn ids (from the roster — your twyns + purchased). */
  memberIds: string[];
  leadModel: LeadModel;
  /** The lead twyn id, when leadModel === "persona". */
  leadId?: string;
  collaboration: Collaboration;
  /** Optional freeform brief — how the team should work together. */
  brief?: string;
  createdLabel: string;
}
