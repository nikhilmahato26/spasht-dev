"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { createColumns } from "@/lib/table-features";
import { formatPaisa } from "@/lib/money";

export type TeamRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: string;
  type: string;
  entitled: number;
  paid: number;
  due: number;
};

const col = createColumns<TeamRow>();

const columns = col.columns([
  col.accessor("name", {
    header: "Name",
    meta: { cellClassName: "whitespace-normal" },
    cell: ({ row }) => (
      <>
        <Link href={`/admin/team/${row.original.id}`} className="font-medium hover:underline">
          {row.original.name}
        </Link>
        {!row.original.isActive && (
          <span className="text-2xs text-text-faint uppercase tracking-label ml-2">inactive</span>
        )}
        <p className="text-sm text-text-faint">{row.original.email}</p>
      </>
    ),
  }),
  col.accessor((row) => `${row.role} · ${row.type}`, {
    id: "role",
    header: "Role",
    meta: { cellClassName: "text-sm text-text-muted" },
  }),
  col.accessor("entitled", {
    header: "Entitled",
    meta: { align: "right", cellClassName: "font-mono" },
    cell: ({ getValue }) => formatPaisa(getValue()),
  }),
  col.accessor("paid", {
    header: "Paid",
    meta: { align: "right", cellClassName: "font-mono" },
    cell: ({ getValue }) => formatPaisa(getValue()),
  }),
  col.accessor("due", {
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
]);

export function TeamTable({ data }: { data: TeamRow[] }) {
  return <DataTable columns={columns} data={data} emptyMessage="No team members yet." />;
}
