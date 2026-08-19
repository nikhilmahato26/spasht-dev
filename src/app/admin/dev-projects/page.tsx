import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { LinkInput } from "./link-input";
import Link from "next/link";
import { formatPaisa } from "@/lib/money";

export const metadata = {
  title: "Dev Projects",
};

export default async function DevProjectsPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.type !== "DEV") {
    redirect("/admin");
  }

  // Fetch deals that have at least one DEV assigned to them, 
  // or maybe all deals that are in progress / delivered / paid.
  const deals = await db.deal.findMany({
    where: {
      status: { in: ["IN_PROGRESS", "DELIVERED", "PAID"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      client: true,
      closedBy: true,
      assignments: {
        include: {
          user: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dev Projects</h1>
        <p className="text-text-muted mt-1">
          Track all team projects, assigned developers, and live domains.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-card overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-surface-2 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold text-text-muted">Project</th>
              <th className="px-4 py-3 font-semibold text-text-muted">Category</th>
              <th className="px-4 py-3 font-semibold text-text-muted">Total Price</th>
              <th className="px-4 py-3 font-semibold text-text-muted">Closed By</th>
              <th className="px-4 py-3 font-semibold text-text-muted">Team (Devs)</th>
              <th className="px-4 py-3 font-semibold text-text-muted">Domain</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No active projects found.
                </td>
              </tr>
            ) : (
              deals.map((deal) => {
                const devs = deal.assignments.filter(a => a.user.type === "DEV");
                const netEarning = deal.totalPrice - deal.fixedCosts;

                return (
                  <tr key={deal.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text">
                        <Link href={`/admin/deals/${deal.id}`} className="hover:underline">
                          {deal.projectName}
                        </Link>
                      </div>
                      <div className="text-xs text-text-muted">{deal.client.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      {deal.category ? (
                        <span className="px-2 py-0.5 rounded-full bg-surface-2 text-xs border border-border text-text-muted">
                          {deal.category.name}
                        </span>
                      ) : (
                        <span className="text-text-faint">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {formatPaisa(deal.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      {deal.closedBy ? (
                        <span className="text-xs">{deal.closedBy.name}</span>
                      ) : (
                        <span className="text-text-faint">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {devs.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {devs.map(a => {
                            const money = Math.round((netEarning * a.allocationPercent) / 100);
                            return (
                              <div key={a.id} className="text-xs">
                                <span className="font-medium">{a.user.name}</span>
                                <span className="text-text-faint mx-1">-</span>
                                <span className="font-mono text-text-muted">{formatPaisa(money)}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-text-faint text-xs">No devs</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <LinkInput dealId={deal.id} initialLink={deal.link} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
