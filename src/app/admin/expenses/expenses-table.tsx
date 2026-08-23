"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { createColumns } from "@/lib/table-features";
import { formatPaisa } from "@/lib/money";
import { EditExpenseDialog } from "./edit-expense-dialog";
import { deleteExpense } from "./actions";

const TEAM_LABELS = { DEV: "Dev", MARKETING: "Marketing" } as const;

export type ExpenseRow = {
  id: string;
  label: string;
  isRecurring: boolean;
  amount: number;
  createdAt: Date;
  dealId: string | null;
  expenseCategoryId: string | null;
  team: "DEV" | "MARKETING" | null;
  deal: { id: string; projectName: string } | null;
  expenseCategory: { id: string; name: string } | null;
};

const col = createColumns<ExpenseRow>();

export function ExpensesTable({
  data,
  expenseCategories,
}: {
  data: ExpenseRow[];
  expenseCategories: { id: string; name: string }[];
}) {
  const columns = col.columns([
    col.accessor("label", {
      header: "Label",
      meta: { cellClassName: "whitespace-normal" },
      cell: ({ row }) => (
        <>
          {row.original.label}
          {row.original.isRecurring && (
            <Badge variant="secondary" className="ml-2 rounded-badge uppercase tracking-[0.03em] bg-pending-soft text-pending">
              Recurring
            </Badge>
          )}
        </>
      ),
    }),
    col.accessor((row) => row.deal?.projectName ?? row.expenseCategory?.name ?? "General", {
      id: "deal",
      header: "Deal / Category",
      meta: { cellClassName: "whitespace-normal" },
      cell: ({ row }) =>
        row.original.deal ? (
          <Link href={`/admin/deals/${row.original.deal.id}`} className="hover:underline">
            {row.original.deal.projectName}
          </Link>
        ) : (
          <Badge variant="secondary" className="rounded-badge uppercase tracking-[0.03em] bg-surface-2 text-text-muted">
            {row.original.expenseCategory?.name ?? "General"}
          </Badge>
        ),
    }),
    col.accessor((row) => (row.team ? TEAM_LABELS[row.team] : ""), {
      id: "team",
      header: "Team",
      meta: { cellClassName: "text-text-muted" },
      cell: ({ row }) => (row.original.team ? TEAM_LABELS[row.original.team] : "—"),
    }),
    col.accessor("createdAt", {
      header: "Date",
      meta: { cellClassName: "text-text-faint text-sm" },
      cell: ({ getValue }) =>
        getValue().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    }),
    col.accessor("amount", {
      header: "Amount",
      meta: { align: "right", cellClassName: "font-mono" },
      cell: ({ getValue }) => formatPaisa(getValue()),
    }),
    col.display({
      id: "actions",
      header: "",
      meta: { headerClassName: "w-20", cellClassName: "text-right" },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <EditExpenseDialog expense={row.original} expenseCategories={expenseCategories} />
          <form action={deleteExpense}>
            <input type="hidden" name="id" value={row.original.id} />
            <Button
              type="submit"
              variant="outline"
              size="icon"
              className="h-8 w-8 text-danger hover:border-danger"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      ),
    }),
  ]);

  return <DataTable columns={columns} data={data} emptyMessage="No expenses recorded yet." />;
}
