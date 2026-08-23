"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { createColumns } from "@/lib/table-features";
import { formatPaisa } from "@/lib/money";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/deal-status";
import type { DealStatus } from "@/generated/prisma/client";

export type DealRow = {
  id: string;
  projectName: string;
  totalPrice: number;
  dueMoney: number;
  status: DealStatus;
  createdAt: Date;
  client: { id: string; name: string };
  category: { name: string; color: string | null } | null;
};

const col = createColumns<DealRow>();

const columns = col.columns([
  col.accessor((row) => row.client.name, {
    id: "client",
    header: "Client",
    cell: ({ row }) => (
      <Link href={`/admin/clients/${row.original.client.id}`} className="hover:underline">
        {row.original.client.name}
      </Link>
    ),
  }),
  col.accessor("projectName", {
    header: "Project",
    cell: ({ row }) => (
      <Link href={`/admin/deals/${row.original.id}`} className="font-medium hover:underline">
        {row.original.projectName}
      </Link>
    ),
  }),
  col.accessor((row) => row.category?.name ?? "", {
    id: "category",
    header: "Category",
    cell: ({ row }) =>
      row.original.category ? (
        <Badge
          variant="secondary"
          className="rounded-badge uppercase tracking-[0.03em]"
          style={{
            backgroundColor: `${row.original.category.color}22`,
            color: row.original.category.color ?? undefined,
          }}
        >
          {row.original.category.name}
        </Badge>
      ) : (
        <span className="text-text-faint">—</span>
      ),
  }),
  col.accessor("totalPrice", {
    header: "Total",
    meta: { align: "right", cellClassName: "font-mono" },
    cell: ({ getValue }) => formatPaisa(getValue()),
  }),
  col.accessor("dueMoney", {
    header: "Due",
    meta: { align: "right", cellClassName: "font-mono" },
    cell: ({ getValue }) => {
      const value = getValue();
      return value > 0 ? (
        <span className="text-pending">{formatPaisa(value)}</span>
      ) : (
        <span className="text-text-faint">—</span>
      );
    },
  }),
  col.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue();
      return (
        <Badge variant="secondary" className={`rounded-badge uppercase tracking-[0.03em] ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </Badge>
      );
    },
  }),
  col.accessor("createdAt", {
    header: "Created",
    meta: { cellClassName: "text-text-faint text-sm" },
    cell: ({ getValue }) =>
      getValue().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  }),
]);

export function DealsTable({ data }: { data: DealRow[] }) {
  return <DataTable columns={columns} data={data} emptyMessage="No deals match these filters." />;
}
