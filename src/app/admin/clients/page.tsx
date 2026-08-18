import Link from "next/link";
import { Users } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaisa } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

export default async function ClientsPage() {
  await requireUser();
  const clients = await db.client.findMany({
    orderBy: { name: "asc" },
    include: { deals: { select: { totalPrice: true, dueMoney: true } } },
  });

  return (
    <div>
      <PageHeader
        icon={Users}
        color="#B9832A"
        title="Clients"
        action={
          <Button asChild className="h-auto bg-text text-surface px-4 py-2.5 rounded-btn text-base font-medium hover:bg-black">
            <Link href="/admin/clients/new">+ New client</Link>
          </Button>
        }
      />

      <Card className="border border-border rounded-card ring-0 py-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Name</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Contact</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Deals</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5 text-right">Revenue</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5 text-right">Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const revenue = client.deals.reduce((sum, d) => sum + d.totalPrice, 0);
              const due = client.deals.reduce((sum, d) => sum + d.dueMoney, 0);
              return (
                <TableRow key={client.id}>
                  <TableCell className="px-4 py-3 whitespace-normal">
                    <Link href={`/admin/clients/${client.id}`} className="font-medium hover:underline">
                      {client.name}
                    </Link>
                    {client.company && (
                      <p className="text-sm text-text-faint">{client.company}</p>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-normal text-text-muted text-sm">
                    {client.phone && <p>{client.phone}</p>}
                    {client.email && <p>{client.email}</p>}
                  </TableCell>
                  <TableCell className="px-4 py-3">{client.deals.length}</TableCell>
                  <TableCell className="px-4 py-3 text-right font-mono">{formatPaisa(revenue)}</TableCell>
                  <TableCell className="px-4 py-3 text-right font-mono">
                    {due > 0 ? (
                      <span className="text-pending">{formatPaisa(due)}</span>
                    ) : (
                      <span className="text-text-faint">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {clients.length === 0 && (
          <p className="text-text-muted text-sm px-4 py-6">No clients yet.</p>
        )}
      </Card>
    </div>
  );
}
