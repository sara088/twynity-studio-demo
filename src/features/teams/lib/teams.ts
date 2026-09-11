// Client store for Persona Teams — localStorage + same-tab broadcast, mirroring
// the deleted/purchases stores. Seeded with one sample team.

import type { Team } from "../types";

const KEY = "twynity_teams";
const EVENT = "twynity:teams-changed";

const SEED: Team[] = [
  {
    id: "launch-squad",
    name: "Launch Squad",
    memberIds: ["sara", "priya", "milo", "rey"],
    leadModel: "persona",
    leadId: "sara",
    collaboration: "sequential",
    createdLabel: "2 days ago",
  },
  {
    id: "growth-pod",
    name: "Growth Pod",
    memberIds: ["priya", "rey", "sol"],
    leadModel: "user",
    collaboration: "parallel",
    createdLabel: "1 week ago",
  },
];

export function getTeams(): Team[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Team[]) : SEED;
  } catch {
    return SEED;
  }
}

export function getTeam(id: string): Team | undefined {
  return getTeams().find((t) => t.id === id);
}

function write(teams: Team[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(teams));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function saveTeam(team: Team) {
  const teams = getTeams();
  const i = teams.findIndex((t) => t.id === team.id);
  if (i >= 0) teams[i] = team;
  else teams.unshift(team);
  write(teams);
}

export function deleteTeam(id: string) {
  write(getTeams().filter((t) => t.id !== id));
}

export function onTeamsChanged(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
