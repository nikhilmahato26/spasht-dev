import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaisa } from "@/lib/money";

export default async function ClientsPage() {
  await requireUser();
  const clients = await db.client.findMany({
    orderBy: { name: "asc" },
    include: { deals: { select: { totalPrice: true, dueMoney: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Clients</h1>
        <Link
          href="/clients/new"
          className="bg-text text-surface border border-text px-4 py-2.5 rounded-btn text-base font-medium hover:bg-black transition-colors"
        >
          + New client
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-card overflow-hidden overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-label text-text-muted">
              <th className="text-left font-semibold px-4 py-2.5">Name</th>
              <th className="text-left font-semibold px-4 py-2.5">Contact</th>
              <th className="text-left font-semibold px-4 py-2.5">Deals</th>
              <th className="text-right font-semibold px-4 py-2.5">Revenue</th>
              <th className="text-right font-semibold px-4 py-2.5">Due</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const revenue = client.deals.reduce((sum, d) => sum + d.totalPrice, 0);
              const due = client.deals.reduce((sum, d) => sum + d.dueMoney, 0);
              return (
                <tr key={client.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${client.id}`} className="font-medium hover:underline">
                      {client.name}
                    </Link>
                    {client.company && (
                      <p className="text-sm text-text-faint">{client.company}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted text-sm">
                    {client.phone && <p>{client.phone}</p>}
                    {client.email && <p>{client.email}</p>}
                  </td>
                  <td className="px-4 py-3">{client.deals.length}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatPaisa(revenue)}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {due > 0 ? (
                      <span className="text-pending">{formatPaisa(due)}</span>
                    ) : (
                      <span className="text-text-faint">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="text-text-muted text-sm px-4 py-6">No clients yet.</p>
        )}
      </div>
    </div>
  );
}
