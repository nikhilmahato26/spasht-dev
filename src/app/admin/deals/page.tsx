import Link from "next/link";
import { Handshake } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { dealScopeWhere } from "@/lib/deals-data";
import { STATUS_LABELS } from "@/lib/deal-status";
import { FormSelect } from "@/components/form-select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { DealsTable } from "./deals-table";
import type { DealStatus } from "@/generated/prisma/client";

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; categoryId?: string; clientId?: string; sort?: string; q?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const [categories, clients] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const where: any = {
    ...dealScopeWhere(user),
    ...(params.status ? { status: params.status as DealStatus } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.clientId ? { clientId: params.clientId } : {}),
    ...(params.q
      ? {
          OR: [
            { projectName: { contains: params.q, mode: "insensitive" } },
            { client: { name: { contains: params.q, mode: "insensitive" } } },
          ],
        }
      : {}),
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

  // Advance-distribution status is only relevant once a deal is cancelled —
  // swap the Due column for Advance Received + the Yes/No toggle, and show
  // a log of who flipped it and when, only in that filtered view.
  const isCancelledView = params.status === "CANCELLED";
  const advanceLogs = isCancelledView
    ? await db.auditLog.findMany({
        where: { action: "deal.advanceDistributed", entityId: { in: deals.map((d) => d.id) } },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const projectNameById = new Map(deals.map((d) => [d.id, d.projectName]));

  return (
    <div>
      <PageHeader
        icon={Handshake}
        color="#39568f"
        title="Deals"
        action={
          <Button asChild className="h-auto bg-text text-surface px-4 py-2.5 rounded-btn text-base font-medium hover:bg-black">
            <Link href="/admin/deals/new">+ New deal</Link>
          </Button>
        }
      />

      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        <input
          type="text"
          name="q"
          placeholder="Search deals..."
          defaultValue={params.q ?? ""}
          className="h-auto py-2 rounded-input text-sm border border-border bg-surface px-3 min-w-[200px]"
        />
        <FormSelect
          name="status"
          defaultValue={params.status ?? ""}
          placeholder="All statuses"
          options={[
            { value: "", label: "All statuses" },
            ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
          ]}
          className="h-auto py-2 rounded-input text-sm"
        />
        <FormSelect
          name="categoryId"
          defaultValue={params.categoryId ?? ""}
          placeholder="All categories"
          options={[
            { value: "", label: "All categories" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
          className="h-auto py-2 rounded-input text-sm"
        />
        <FormSelect
          name="clientId"
          defaultValue={params.clientId ?? ""}
          placeholder="All clients"
          options={[
            { value: "", label: "All clients" },
            ...clients.map((c) => ({ value: c.id, label: c.name })),
          ]}
          className="h-auto py-2 rounded-input text-sm"
        />
        <FormSelect
          name="sort"
          defaultValue={params.sort ?? ""}
          placeholder="Newest first"
          options={[
            { value: "", label: "Newest first" },
            { value: "dueMoney", label: "Due money" },
            { value: "totalPrice", label: "Total price" },
          ]}
          className="h-auto py-2 rounded-input text-sm"
        />
        <Button type="submit" variant="outline" className="h-auto text-sm px-3 py-2 rounded-btn">
          Apply
        </Button>
      </form>

      <Card className="border border-border rounded-card ring-0 py-0 overflow-hidden">
        <DealsTable data={deals} cancelledView={isCancelledView} />
      </Card>

      {isCancelledView && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-label mb-2">
            Advance distribution log
          </h2>
          {advanceLogs.length === 0 ? (
            <p className="text-sm text-text-muted">No advance distribution status changes yet.</p>
          ) : (
            <Card className="border border-border rounded-card ring-0 py-0 overflow-hidden divide-y divide-border">
              {advanceLogs.map((log) => {
                const diff = log.diff as { advanceDistributed?: { old: boolean; new: boolean } } | null;
                const from = diff?.advanceDistributed?.old ? "Yes" : "No";
                const to = diff?.advanceDistributed?.new ? "Yes" : "No";
                return (
                  <div key={log.id} className="px-4 py-3 text-sm flex items-center justify-between gap-4">
                    <p>
                      <span className="font-medium">{log.user.name}</span> changed advance distribution for{" "}
                      <span className="font-medium">{projectNameById.get(log.entityId) ?? "a deal"}</span> from{" "}
                      <span className="text-text-muted">{from}</span> to{" "}
                      <span className="font-medium">{to}</span>
                    </p>
                    <p className="text-text-faint whitespace-nowrap">
                      {log.createdAt.toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
