import Link from "next/link";
import { Receipt, Repeat } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaisa } from "@/lib/money";
import { dealScopeWhere } from "@/lib/deals-data";
import { SubmitButton } from "@/components/submit-button";
import { FormSelect } from "@/components/form-select";
import { SummaryCard } from "@/components/summary-card";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { createExpense } from "./actions";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ recurring?: string }>;
}) {
  const user = await requireUser();
  const { recurring } = await searchParams;
  const isAdmin = user.role === "ADMIN";

  // Members never see general (deal-less) company overhead — only expenses
  // on deals they're already scoped to. Admins see everything.
  const scopeFilter = isAdmin ? {} : { dealId: { not: null }, deal: dealScopeWhere(user) };

  const [deals, costItems] = await Promise.all([
    db.deal.findMany({
      where: dealScopeWhere(user),
      select: { id: true, projectName: true },
      orderBy: { projectName: "asc" },
    }),
    db.costItem.findMany({
      where: {
        ...scopeFilter,
        ...(recurring === "1" ? { isRecurring: true } : {}),
      },
      include: { deal: { include: { client: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const total = costItems.reduce((sum, c) => sum + c.amount, 0);
  const recurringTotal = costItems
    .filter((c) => c.isRecurring)
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div>
      <PageHeader icon={Receipt} color="#AD4A3B" title="Expenses" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <SummaryCard label="Total expenses" value={formatPaisa(total)} color="#AD4A3B" icon={Receipt} />
        <SummaryCard label="Recurring" value={formatPaisa(recurringTotal)} color="#9A5B13" icon={Repeat} />
      </div>

      <form
        action={createExpense}
        className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 bg-surface border border-border rounded-card p-4"
      >
        <FormSelect
          name="dealId"
          required={!isAdmin}
          placeholder={isAdmin ? "General expense (no deal)" : "Deal"}
          options={
            isAdmin
              ? [{ value: "", label: "General expense (no deal)" }, ...deals.map((d) => ({ value: d.id, label: d.projectName }))]
              : deals.map((d) => ({ value: d.id, label: d.projectName }))
          }
          className="w-full h-auto py-2 rounded-input"
        />
        <input
          name="label"
          placeholder="Label (e.g. Domain)"
          required
          className="border border-border rounded-input px-3 py-2 text-base bg-surface"
        />
        <input
          type="number"
          name="amount"
          placeholder="₹ amount"
          min="0"
          required
          className="border border-border rounded-input px-3 py-2 text-base bg-surface font-mono"
        />
        <label className="flex items-center gap-2 text-sm text-text-muted px-1">
          <input type="checkbox" name="isRecurring" className="w-4 h-4" />
          Recurring
        </label>
        <SubmitButton
          pendingText="Adding..."
          className="bg-text text-surface border border-text px-4 py-2 rounded-btn text-base font-medium hover:bg-black transition-colors disabled:opacity-60"
        >
          + Add expense
        </SubmitButton>
        {!isAdmin && deals.length === 0 && (
          <p className="text-2xs text-text-faint col-span-full">
            No deals to attach an expense to yet.
          </p>
        )}
      </form>

      <div className="flex gap-2 mb-4">
        <Button
          asChild
          variant={recurring !== "1" ? "default" : "outline"}
          className="h-auto text-sm px-3 py-1.5 rounded-btn"
        >
          <Link href="/admin/expenses">All</Link>
        </Button>
        <Button
          asChild
          variant={recurring === "1" ? "default" : "outline"}
          className="h-auto text-sm px-3 py-1.5 rounded-btn"
        >
          <Link href="/admin/expenses?recurring=1">Recurring only</Link>
        </Button>
      </div>

      <Card className="border border-border rounded-card ring-0 py-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Label</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Deal</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Client</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Date</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5 text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-4 py-3 whitespace-normal">
                  {item.label}
                  {item.isRecurring && (
                    <Badge variant="secondary" className="ml-2 rounded-badge uppercase tracking-[0.03em] bg-pending-soft text-pending">
                      Recurring
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-normal">
                  {item.deal ? (
                    <Link href={`/admin/deals/${item.deal.id}`} className="hover:underline">
                      {item.deal.projectName}
                    </Link>
                  ) : (
                    <Badge variant="secondary" className="rounded-badge uppercase tracking-[0.03em] bg-surface-2 text-text-muted">
                      General
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-text-muted">{item.deal?.client.name ?? "—"}</TableCell>
                <TableCell className="px-4 py-3 text-text-faint text-sm">
                  {item.createdAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-mono">{formatPaisa(item.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {costItems.length === 0 && (
          <p className="text-text-muted text-sm px-4 py-6">No expenses recorded yet.</p>
        )}
      </Card>
    </div>
  );
}
