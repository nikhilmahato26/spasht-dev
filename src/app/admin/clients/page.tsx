import Link from "next/link";
import { Users } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { FormSelect } from "@/components/form-select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { ClientsTable } from "./clients-table";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireUser();
  const { category } = await searchParams;

  const [clients, categoryRows] = await Promise.all([
    db.client.findMany({
      where: category ? { company: category } : {},
      orderBy: { name: "asc" },
      include: { deals: { select: { totalPrice: true, dueMoney: true } } },
    }),
    db.client.findMany({
      distinct: ["company"],
      select: { company: true },
      where: { company: { not: null } },
      orderBy: { company: "asc" },
    }),
  ]);

  const rows = clients.map((client) => ({
    id: client.id,
    name: client.name,
    phone: client.phone,
    revenue: client.deals.reduce((sum, d) => sum + d.totalPrice, 0),
    due: client.deals.reduce((sum, d) => sum + d.dueMoney, 0),
  }));

  return (
    <div>
      <PageHeader
        icon={Users}
        color="#b9832a"
        title="Clients"
        action={
          <Button asChild className="h-auto bg-text text-surface px-4 py-2.5 rounded-btn text-base font-medium hover:bg-black">
            <Link href="/admin/clients/new">+ New client</Link>
          </Button>
        }
      />

      <form method="GET" className="flex gap-2 mb-5">
        <FormSelect
          name="category"
          defaultValue={category ?? ""}
          placeholder="All categories"
          options={[
            { value: "", label: "All categories" },
            ...categoryRows
              .filter((c) => c.company)
              .map((c) => ({ value: c.company as string, label: c.company as string })),
          ]}
          className="h-auto py-2 rounded-input text-sm"
        />
        <Button type="submit" variant="outline" className="h-auto text-sm px-3 py-2 rounded-btn">
          Apply
        </Button>
      </form>

      <Card className="border border-border rounded-card ring-0 py-0 overflow-hidden">
        <ClientsTable data={rows} />
      </Card>
    </div>
  );
}
