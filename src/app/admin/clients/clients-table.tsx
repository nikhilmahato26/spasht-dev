"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { createColumns } from "@/lib/table-features";
import { formatPaisa } from "@/lib/money";

export type ClientRow = {
  id: string;
  name: string;
  phone: string | null;
  revenue: number;
  due: number;
};

const col = createColumns<ClientRow>();

const columns = col.columns([
  col.accessor("name", {
    header: "Name",
    meta: { cellClassName: "whitespace-normal" },
    cell: ({ row }) => (
      <Link href={`/admin/clients/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  }),
  col.accessor("phone", {
    header: "Contact",
    enableSorting: false,
    meta: { cellClassName: "text-text-muted text-sm" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  col.accessor("revenue", {
    header: "Revenue",
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

export function ClientsTable({ data }: { data: ClientRow[] }) {
  return <DataTable columns={columns} data={data} emptyMessage="No clients yet." />;
}
