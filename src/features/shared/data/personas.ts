import type { Persona } from "../types";

export const SARA: Persona = {
  id: "sara",
  name: "Sara Gordic",
  role: "Creator",
  avatar: "/assets/sara.png",
  mode: "supply",
  homeHref: "/my-twyns",
};

export const SONYA: Persona = {
  id: "sonya",
  name: "Sonya Park",
  role: "Linear · VP People (Demand)",
  avatar: "/assets/persona-prof-f.png",
  mode: "demand",
  homeHref: "/workforce",
};

export const PERSONAS: Persona[] = [SARA, SONYA];
