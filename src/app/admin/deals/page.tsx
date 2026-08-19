import Link from "next/link";
import { Handshake } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaisa } from "@/lib/money";
import { dealScopeWhere } from "@/lib/deals-data";
import { FormSelect } from "@/components/form-select";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import type { DealStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<DealStatus, string> = {
  LEAD: "Lead",
  IN_PROGRESS: "In progress",
  DELIVERED: "Delivered",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<DealStatus, string> = {
  LEAD: "bg-surface-2 text-text-muted",
  IN_PROGRESS: "bg-marketing-soft text-marketing",
  DELIVERED: "bg-company-soft text-company",
  PAID: "bg-accent-soft text-accent",
  CANCELLED: "bg-cost-soft text-cost",
};

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

  return (
    <div>
      <PageHeader
        icon={Handshake}
        color="#39568F"
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
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Client</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Project</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Category</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5 text-right">Total</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5 text-right">Due</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Status</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell className="px-4 py-3">
                  <Link href={`/admin/clients/${deal.client.id}`} className="hover:underline">
                    {deal.client.name}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Link href={`/admin/deals/${deal.id}`} className="font-medium hover:underline">
                    {deal.projectName}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3">
                  {deal.category ? (
                    <Badge
                      variant="secondary"
                      className="rounded-badge uppercase tracking-[0.03em]"
                      style={{
                        backgroundColor: `${deal.category.color}22`,
                        color: deal.category.color ?? undefined,
                      }}
                    >
                      {deal.category.name}
                    </Badge>
                  ) : (
                    <span className="text-text-faint">—</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-mono">{formatPaisa(deal.totalPrice)}</TableCell>
                <TableCell className="px-4 py-3 text-right font-mono">
                  {deal.dueMoney > 0 ? (
                    <span className="text-pending">{formatPaisa(deal.dueMoney)}</span>
                  ) : (
                    <span className="text-text-faint">—</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge variant="secondary" className={`rounded-badge uppercase tracking-[0.03em] ${STATUS_COLORS[deal.status]}`}>
                    {STATUS_LABELS[deal.status]}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-text-faint text-sm">
                  {deal.createdAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {deals.length === 0 && (
          <p className="text-text-muted text-sm px-4 py-6">No deals match these filters.</p>
        )}
      </Card>
    </div>
  );
}
