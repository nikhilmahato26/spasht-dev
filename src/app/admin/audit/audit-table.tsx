"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { createColumns } from "@/lib/table-features";
import { AUDIT_ACTION_LABELS, ENTITY_LINK_PREFIX } from "@/lib/audit-labels";

export type AuditRow = {
  id: string;
  createdAt: Date;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
};

const col = createColumns<AuditRow>();

const columns = col.columns([
  col.accessor("createdAt", {
    header: "When",
    meta: { cellClassName: "text-sm text-text-faint whitespace-nowrap" },
    cell: ({ getValue }) =>
      getValue().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  }),
  col.accessor("userName", {
    header: "User",
    meta: { cellClassName: "font-medium whitespace-nowrap" },
  }),
  col.accessor("action", {
    header: "Action",
    meta: { cellClassName: "text-sm whitespace-normal" },
    cell: ({ getValue }) => AUDIT_ACTION_LABELS[getValue()] ?? getValue(),
  }),
  col.accessor("entityType", {
    header: "Entity",
    meta: { cellClassName: "text-sm" },
    cell: ({ row }) => {
      const { entityType, action, entityId } = row.original;
      const linkPrefix = ENTITY_LINK_PREFIX[entityType];
      const canLink = linkPrefix && !action.endsWith(".delete");
      return canLink ? (
        <Link href={`${linkPrefix}/${entityId}`} className="text-dev hover:underline">
          {entityType}
        </Link>
      ) : (
        <span className="text-text-muted">{entityType}</span>
      );
    },
  }),
]);

export function AuditTable({ data }: { data: AuditRow[] }) {
  return <DataTable columns={columns} data={data} emptyMessage="No activity yet." />;
}
