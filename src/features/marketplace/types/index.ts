export type CapabilityKind = "tool" | "interconnector" | "knowledge" | "skill";

export interface Capability {
  id: string;
  name: string;
  kind: CapabilityKind;
  description: string;
  icon: string;
  pricePerMonth?: number;
  rating?: number;
  installs?: string;
}
