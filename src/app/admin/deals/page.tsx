import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaisa } from "@/lib/money";
import { dealScopeWhere } from "@/lib/deals-data";
import type { DealStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<DealStatus, string> = {
  LEAD: "Lead",
  CLOSED: "Closed",
  IN_PROGRESS: "In progress",
  DELIVERED: "Delivered",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<DealStatus, string> = {
  LEAD: "bg-surface-2 text-text-muted",
  CLOSED: "bg-dev-soft text-dev",
  IN_PROGRESS: "bg-marketing-soft text-marketing",
  DELIVERED: "bg-company-soft text-company",
  PAID: "bg-accent-soft text-accent",
  CANCELLED: "bg-error-soft text-error",
};

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; categoryId?: string; clientId?: string; sort?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const [categories, clients] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const where = {
    ...dealScopeWhere(user),
    ...(params.status ? { status: params.status as DealStatus } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.clientId ? { clientId: params.clientId } : {}),
  };

  const orderBy =
    params.sort === "dueMoney"
      ? { dueMoney: "desc" as const }
      : params.sort === "totalPrice"
        ? { totalPrice: "desc" as const }
        : { createdAt: "desc" as const };

  const deals = await db.deal.findMany({
    where,
    include: { client: true, category: true },
    orderBy,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Deals</h1>
        <Link
          href="/deals/new"
          className="bg-text text-surface border border-text px-4 py-2.5 rounded-btn text-base font-medium hover:bg-black transition-colors"
        >
          + New deal
        </Link>
      </div>

      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="border border-border rounded-input px-3 py-2 text-sm bg-surface"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="categoryId"
          defaultValue={params.categoryId ?? ""}
          className="border border-border rounded-input px-3 py-2 text-sm bg-surface"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="clientId"
          defaultValue={params.clientId ?? ""}
          className="border border-border rounded-input px-3 py-2 text-sm bg-surface"
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={params.sort ?? ""}
          className="border border-border rounded-input px-3 py-2 text-sm bg-surface"
        >
          <option value="">Newest first</option>
          <option value="dueMoney">Due money</option>
          <option value="totalPrice">Total price</option>
        </select>
        <button
          type="submit"
          className="bg-surface text-text border border-border px-3 py-2 rounded-btn text-sm font-medium hover:border-text-faint transition-colors"
        >
          Apply
        </button>
      </form>

      <div className="bg-surface border border-border rounded-card overflow-hidden overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-label text-text-muted">
              <th className="text-left font-semibold px-4 py-2.5">Client</th>
              <th className="text-left font-semibold px-4 py-2.5">Project</th>
              <th className="text-left font-semibold px-4 py-2.5">Category</th>
              <th className="text-right font-semibold px-4 py-2.5">Total</th>
              <th className="text-right font-semibold px-4 py-2.5">Due</th>
              <th className="text-left font-semibold px-4 py-2.5">Status</th>
              <th className="text-left font-semibold px-4 py-2.5">Created</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3">
                  <Link href={`/clients/${deal.client.id}`} className="hover:underline">
                    {deal.client.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/deals/${deal.id}`} className="font-medium hover:underline">
                    {deal.projectName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {deal.category ? (
                    <span
                      className="text-2xs font-semibold px-2.5 py-0.5 rounded-badge uppercase tracking-[0.03em]"
                      style={{
                        backgroundColor: `${deal.category.color}22`,
                        color: deal.category.color ?? undefined,
                      }}
                    >
                      {deal.category.name}
                    </span>
                  ) : (
                    <span className="text-text-faint">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatPaisa(deal.totalPrice)}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {deal.dueMoney > 0 ? (
                    <span className="text-pending">{formatPaisa(deal.dueMoney)}</span>
                  ) : (
                    <span className="text-text-faint">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-2xs font-semibold px-2.5 py-0.5 rounded-badge uppercase tracking-[0.03em] ${STATUS_COLORS[deal.status]}`}
                  >
                    {STATUS_LABELS[deal.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-faint text-sm">
                  {deal.createdAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {deals.length === 0 && (
          <p className="text-text-muted text-sm px-4 py-6">No deals match these filters.</p>
        )}
      </div>
    </div>
  );
}
