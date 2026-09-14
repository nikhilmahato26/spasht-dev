"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { createColumns } from "@/lib/table-features";
import { formatPaisa } from "@/lib/money";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/deal-status";
import { AdvanceDistributedToggle } from "./advance-distributed-toggle";
import { applyAdvanceDistributedChanges } from "./actions";
import type { DealStatus } from "@/generated/prisma/client";

export type DealRow = {
  id: string;
  projectName: string;
  totalPrice: number;
  dueMoney: number;
  advanceReceived: number;
  advanceDistributed: boolean;
  status: DealStatus;
  createdAt: Date;
  client: { id: string; name: string };
  category: { name: string; color: string | null } | null;
};

const col = createColumns<DealRow>();

const baseColumns = [
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
];

const dueColumn = col.accessor("dueMoney", {
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
});

// Shown instead of Due when filtering by Cancelled deals — the amount
// received up front (that may still need paying back) matters there, not
// the (now moot) outstanding balance.
const advanceReceivedColumn = col.accessor("advanceReceived", {
  header: "Advance Received",
  meta: { align: "right", cellClassName: "font-mono" },
  cell: ({ getValue }) => {
    const value = getValue();
    return value > 0 ? formatPaisa(value) : <span className="text-text-faint">—</span>;
  },
});

const trailingColumns = [
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
];

const columns = col.columns([...baseColumns, dueColumn, ...trailingColumns]);

export function DealsTable({ data, cancelledView = false }: { data: DealRow[]; cancelledView?: boolean }) {
  // dealId -> pending (not-yet-applied) value. Absent = no edit for that row.
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [isApplying, startTransition] = useTransition();

  const cancelledColumns = useMemo(() => {
    const advanceDistributedColumn = col.accessor("advanceDistributed", {
      header: "Advance Distributed",
      cell: ({ row }) => {
        const dealId = row.original.id;
        const original = row.original.advanceDistributed;
        const value = pending[dealId] ?? original;
        return (
          <AdvanceDistributedToggle
            value={value}
            disabled={isApplying}
            onChange={(next) => {
              setPending((prev) => {
                const copy = { ...prev };
                if (next === original) {
                  delete copy[dealId];
                } else {
                  copy[dealId] = next;
                }
                return copy;
              });
            }}
          />
        );
      },
    });
    return col.columns([...baseColumns, advanceReceivedColumn, advanceDistributedColumn, ...trailingColumns]);
  }, [pending, isApplying]);

  const pendingCount = Object.keys(pending).length;

  function handleApply() {
    const changes = Object.entries(pending).map(([dealId, distributed]) => ({ dealId, distributed }));
    startTransition(async () => {
      try {
        await applyAdvanceDistributedChanges(changes);
        setPending({});
      } catch (err) {
        console.error("Failed to apply advance distribution changes", err);
      }
    });
  }

  return (
    <div>
      {cancelledView && (
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-border bg-surface-2/40">
          <p className="text-sm text-text-muted">
            {pendingCount > 0
              ? `${pendingCount} unsaved change${pendingCount === 1 ? "" : "s"}`
              : "No unsaved changes"}
          </p>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={pendingCount === 0 || isApplying}
          >
            {isApplying ? "Applying…" : "Apply changes"}
          </Button>
        </div>
      )}
      <DataTable
        columns={cancelledView ? cancelledColumns : columns}
        data={data}
        emptyMessage="No deals match these filters."
        scrollable
      />
    </div>
  );
}
