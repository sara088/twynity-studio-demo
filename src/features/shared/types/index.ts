export type AppMode = "supply" | "demand";

export interface Persona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  mode: AppMode;
  homeHref: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
  disabled?: boolean;
}
