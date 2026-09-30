import type { Permission, Role } from "@/generated/prisma/client";

// Column order of the Team → Permissions matrix.
export const PERMISSIONS: { key: Permission; label: string; hint: string }[] = [
  { key: "DEALS_VIEW", label: "View deals", hint: "See deals they're on" },
  { key: "DEALS_MANAGE", label: "Manage deals", hint: "Create, edit, log payments" },
  { key: "CLIENTS_MANAGE", label: "Manage clients", hint: "View, add, edit clients" },
  { key: "CATEGORIES_MANAGE", label: "Manage categories", hint: "Add, rename, delete" },
  { key: "EXPENSES_VIEW", label: "Expenses", hint: "View and edit deal costs" },
  { key: "DEV_PROJECTS", label: "Dev projects", hint: "Project links and previews" },
];

export const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

export function can(
  user: { role: Role | string; permissions: readonly Permission[] | readonly string[] },
  permission: Permission
) {
  return user.role === "ADMIN" || (user.permissions as readonly string[]).includes(permission);
}
