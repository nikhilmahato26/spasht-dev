import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaisa } from "@/lib/money";
import { dealScopeWhere } from "@/lib/deals-data";
import { SubmitButton } from "@/components/submit-button";
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Expenses</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-card p-3.5">
          <p className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Total expenses
          </p>
          <p className="font-mono text-2xl font-semibold mt-1.5 tracking-tighter">
            {formatPaisa(total)}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-card p-3.5">
          <p className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Recurring
          </p>
          <p className="font-mono text-2xl font-semibold mt-1.5 tracking-tighter">
            {formatPaisa(recurringTotal)}
          </p>
        </div>
      </div>

      <form
        action={createExpense}
        className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 bg-surface border border-border rounded-card p-4"
      >
        <select
          name="dealId"
          required={!isAdmin}
          defaultValue=""
          className="border border-border rounded-input px-3 py-2 text-base bg-surface"
        >
          {isAdmin ? (
            <option value="">General expense (no deal)</option>
          ) : (
            <option value="" disabled>
              Deal
            </option>
          )}
          {deals.map((d) => (
            <option key={d.id} value={d.id}>
              {d.projectName}
            </option>
          ))}
        </select>
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
        <Link
          href="/expenses"
          className={`text-sm px-3 py-1.5 rounded-btn border ${
            recurring !== "1"
              ? "bg-text text-surface border-text"
              : "bg-surface text-text border-border hover:border-text-faint"
          }`}
        >
          All
        </Link>
        <Link
          href="/expenses?recurring=1"
          className={`text-sm px-3 py-1.5 rounded-btn border ${
            recurring === "1"
              ? "bg-text text-surface border-text"
              : "bg-surface text-text border-border hover:border-text-faint"
          }`}
        >
          Recurring only
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-card overflow-hidden overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-label text-text-muted">
              <th className="text-left font-semibold px-4 py-2.5">Label</th>
              <th className="text-left font-semibold px-4 py-2.5">Deal</th>
              <th className="text-left font-semibold px-4 py-2.5">Client</th>
              <th className="text-left font-semibold px-4 py-2.5">Date</th>
              <th className="text-right font-semibold px-4 py-2.5">Amount</th>
            </tr>
          </thead>
          <tbody>
            {costItems.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3">
                  {item.label}
                  {item.isRecurring && (
                    <span className="ml-2 text-2xs font-semibold px-2 py-0.5 rounded-badge uppercase tracking-[0.03em] bg-pending-soft text-pending">
                      Recurring
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.deal ? (
                    <Link href={`/deals/${item.deal.id}`} className="hover:underline">
                      {item.deal.projectName}
                    </Link>
                  ) : (
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-badge uppercase tracking-[0.03em] bg-surface-2 text-text-muted">
                      General
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted">{item.deal?.client.name ?? "—"}</td>
                <td className="px-4 py-3 text-text-faint text-sm">
                  {item.createdAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatPaisa(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {costItems.length === 0 && (
          <p className="text-text-muted text-sm px-4 py-6">No expenses recorded yet.</p>
        )}
      </div>
    </div>
  );
}
