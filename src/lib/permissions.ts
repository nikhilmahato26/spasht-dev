import type { Permission, Role } from "@/generated/prisma/client";

// Column order of the Team → Permissions matrix.
export const PERMISSIONS: { key: Permission; label: string; hint: string }[] = [
  { key: "DEALS_VIEW", label: "View deals", hint: "See deals they're on" },
  { key: "DEALS_MANAGE", label: "Manage deals", hint: "Create, edit, log payments" },
  { key: "CLIENTS_MANAGE", label: "Manage clients", hint: "View, add, edit clients" },
  { key: "CATEGORIES_MANAGE", label: "Manage categories", hint: "Add, rename, delete" },
  { key: "EXPENSES_VIEW", label: "Expenses", hint: "View and edit deal costs" },
  { key: "DEV_PROJECTS", label: "Dev projects", hint: "Project links and previews" },
  { key: "PAYOUTS_VIEW", label: "View payouts", hint: "Client payouts and ledger" },
  { key: "PAYOUTS_MANAGE", label: "Record payouts", hint: "Pay Dev / Marketing sections" },
];

export const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

export function can(
  user: { role: Role | string; permissions: readonly Permission[] | readonly string[] },
  permission: Permission
) {
  if (user.role === "ADMIN") return true;
  const granted = user.permissions as readonly string[];
  // Recording payouts is pointless without seeing the ledger, so it implies view.
  if (permission === "PAYOUTS_VIEW" && granted.includes("PAYOUTS_MANAGE")) return true;
  return granted.includes(permission);
}
