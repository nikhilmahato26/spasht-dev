"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, ShieldCheck, AlertCircle } from "lucide-react";
import { PERMISSIONS } from "@/lib/permissions";
import type { Permission } from "@/generated/prisma/client";
import { setMemberPermission } from "./actions";

export type PermissionRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  type: string;
  isActive: boolean;
  permissions: Permission[];
};

type Filter = "members" | "admins" | "inactive";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Switch({
  checked,
  disabled,
  pending,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  pending?: boolean;
  label: string;
  onChange?: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        checked ? "bg-accent" : "bg-border"
      } ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer active:scale-95"} ${
        pending ? "opacity-60" : ""
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-out ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function PermissionsMatrix({ rows }: { rows: PermissionRow[] }) {
  const [filter, setFilter] = useState<Filter>("members");
  const [query, setQuery] = useState("");
  // Optimistic copy of every member's permissions, keyed by user id.
  const [granted, setGranted] = useState<Record<string, Permission[]>>(() =>
    Object.fromEntries(rows.map((r) => [r.id, r.permissions]))
  );
  const [pendingCell, setPendingCell] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      members: rows.filter((r) => r.role !== "ADMIN" && r.isActive).length,
      admins: rows.filter((r) => r.role === "ADMIN").length,
      inactive: rows.filter((r) => r.role !== "ADMIN" && !r.isActive).length,
    }),
    [rows]
  );

  const visible = rows.filter((r) => {
    const inFilter =
      filter === "admins"
        ? r.role === "ADMIN"
        : filter === "inactive"
          ? r.role !== "ADMIN" && !r.isActive
          : r.role !== "ADMIN" && r.isActive;
    const q = query.trim().toLowerCase();
    return inFilter && (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
  });

  const toggle = (userId: string, permission: Permission, enabled: boolean) => {
    const cell = `${userId}:${permission}`;
    const previous = granted[userId] ?? [];
    setError(null);
    setPendingCell(cell);
    setGranted((g) => ({
      ...g,
      [userId]: enabled ? [...previous, permission] : previous.filter((p) => p !== permission),
    }));

    startTransition(async () => {
      try {
        await setMemberPermission(userId, permission, enabled);
      } catch {
        setGranted((g) => ({ ...g, [userId]: previous }));
        setError("Couldn't save that change. Please try again.");
      } finally {
        setPendingCell((c) => (c === cell ? null : c));
      }
    });
  };

  const tabs: { id: Filter; label: string }[] = [
    { id: "members", label: "Members" },
    { id: "admins", label: "Admins" },
    { id: "inactive", label: "Inactive" },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <div className="inline-flex items-center gap-1 rounded-btn bg-bg p-1 border border-border w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-[6px] text-sm font-medium transition-colors ${
                filter === t.id
                  ? "bg-surface text-text shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {t.label} <span className="font-mono text-xs text-text-faint">({counts[t.id]})</span>
            </button>
          ))}
        </div>

        <label className="relative sm:w-60">
          <span className="sr-only">Search members</span>
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-full border border-border rounded-full pl-8 pr-3 py-1.5 text-sm bg-surface text-text placeholder:text-text-muted focus:outline-none focus:border-text-faint transition-colors"
          />
        </label>
      </div>

      {filter === "admins" && (
        <p className="flex items-center gap-2 px-4 py-2.5 text-xs text-text-muted bg-bg/60 border-b border-border">
          <ShieldCheck size={14} className="text-accent shrink-0" />
          Admins always have full access. Change their role to Member to restrict them.
        </p>
      )}

      {error && (
        <p className="flex items-center gap-2 px-4 py-2.5 text-sm text-danger bg-cost-soft border-b border-cost/30">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 pl-5 pr-4 text-xs font-medium text-text-muted min-w-55">User</th>
              {PERMISSIONS.map((p) => (
                <th key={p.key} className="py-3 px-3 text-center align-bottom min-w-28">
                  <span className="block text-xs font-medium text-text-muted leading-snug">{p.label}</span>
                  <span className="block text-[11px] text-text-faint font-normal leading-snug mt-0.5">
                    {p.hint}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((row) => {
              const isAdmin = row.role === "ADMIN";
              const rowPerms = granted[row.id] ?? [];
              const tone = row.type === "DEV" ? "bg-dev-soft text-dev" : "bg-marketing-soft text-marketing";

              return (
                <tr
                  key={row.id}
                  className={`hover:bg-bg/50 transition-colors ${
                    !row.isActive ? "shadow-[inset_2px_0_0_var(--color-pending)]" : ""
                  }`}
                >
                  <td className="py-3 pl-5 pr-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${tone}`}
                      >
                        {initials(row.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-text truncate">{row.name}</p>
                        <p className="text-xs text-text-faint truncate">
                          {row.type === "DEV" ? "Dev" : "Marketing"}
                          {isAdmin ? ", Admin" : ""}
                          {!row.isActive ? ", Inactive" : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  {PERMISSIONS.map((p) => {
                    // Record payouts implies View payouts (see can()), so lock it on.
                    const implied = p.key === "PAYOUTS_VIEW" && rowPerms.includes("PAYOUTS_MANAGE");
                    const on = isAdmin || implied || rowPerms.includes(p.key);
                    return (
                      <td
                        key={p.key}
                        className="py-3 px-3 text-center"
                        title={implied ? "Included with Record payouts" : undefined}
                      >
                        <div className="flex justify-center">
                          <Switch
                            checked={on}
                            disabled={isAdmin || implied}
                            pending={pendingCell === `${row.id}:${p.key}`}
                            label={`${p.label} for ${row.name}`}
                            onChange={(next) => toggle(row.id, p.key, next)}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {visible.length === 0 && (
              <tr>
                <td colSpan={PERMISSIONS.length + 1} className="py-12 text-center text-sm text-text-muted">
                  {query ? `No one matches "${query}".` : "Nobody in this group yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
