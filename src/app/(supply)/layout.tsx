import { SupplyShell } from "@/features/shared/components/SupplyShell";

export default function SupplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SupplyShell>{children}</SupplyShell>;
}
