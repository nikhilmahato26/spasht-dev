import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { LinkInput } from "./link-input";
import Link from "next/link";
import { formatPaisa } from "@/lib/money";
import { FormSelect } from "@/components/form-select";
import { Button } from "@/components/ui/button";
import { Wallet, Code2, type LucideIcon } from "lucide-react";

export const metadata = {
  title: "Dev Projects",
};

// Fixed color per dev card, as requested — not a design-system token since
// this is a deliberately colorful callout row, unlike the rest of the app's
// muted palette.
const DEV_CARD_STYLE: Record<string, { label: string; color: string }> = {
  nikhil: { label: "Nikhil", color: "#06b6d4" }, // cyan
  viplav: { label: "Viplav", color: "#dc2626" }, // red
  kanhaiya: { label: "Kanhaiya", color: "#16a34a" }, // green
};

function StatCard({
  label,
  color,
  icon: Icon,
  earning,
  projectCount,
}: {
  label: string;
  color: string;
  icon: LucideIcon;
  earning: string;
  projectCount: number;
}) {
  return (
    <div
      className="group relative bg-surface border border-border rounded-card p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
      style={{ backgroundImage: `linear-gradient(to top, ${color}14, transparent 65%)` }}
    >
      <div
        aria-hidden
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-[0.15] group-hover:opacity-25 transition-opacity duration-200"
        style={{ backgroundColor: color }}
      />
      <div className="relative flex items-center justify-between gap-2 mb-1.5">
        <p className="text-xs uppercase tracking-label text-text-muted font-semibold">{label}</p>
        <div
          className="w-10 h-10 rounded-btn flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        >
          <Icon size={18} strokeWidth={2.25} className="text-white" />
        </div>
      </div>
      <p className="relative font-mono text-xl sm:text-[26px] font-semibold tracking-tighter leading-none">
        {earning}
      </p>
      <p className="relative text-xs text-text-muted mt-1.5">
        {projectCount} {projectCount === 1 ? "project" : "projects"}
      </p>
    </div>
  );
}

function monthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      value: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    };
  });
}

export default async function DevProjectsPage(props: {
  searchParams?: Promise<{ categoryId?: string; devId?: string; q?: string; month?: string }>;
}) {
  const searchParams = await props.searchParams;
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.type !== "DEV") {
    redirect("/admin");
  }

  const params = searchParams ?? {};

  let dateFilter: { gte: Date; lt: Date } | undefined;
  if (params.month) {
    const [yearStr, monthStr] = params.month.split("-");
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10);
    dateFilter = { gte: new Date(year, monthIndex, 1), lt: new Date(year, monthIndex + 1, 1) };
  }

  const where: any = {
    status: { in: ["IN_PROGRESS", "DELIVERED", "PAID"] },
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.devId ? { closedById: params.devId } : {}),
    ...(dateFilter ? { createdAt: dateFilter } : {}),
    ...(params.q
      ? {
          OR: [
            { projectName: { contains: params.q, mode: "insensitive" } },
            { client: { name: { contains: params.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [categories, devs, deals] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({ where: { type: "DEV" }, orderBy: { name: "asc" } }),
    db.deal.findMany({
      where,
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
    }),
  ]);

  // Pre-compute per-deal dev assignments + earnings once, reused for both
  // the row rendering and the footer totals.
  const rows = deals.map((deal) => {
    const devAssignments = deal.assignments
      .filter((a) => a.user.type === "DEV")
      .sort((a, b) => {
        if (params.devId) {
          if (a.userId === params.devId) return -1;
          if (b.userId === params.devId) return 1;
        }
        return a.user.name.localeCompare(b.user.name);
      });
    const netEarning = deal.totalPrice - deal.fixedCosts;
    const devEarnings = devAssignments.map((a) => ({
      userId: a.userId,
      name: a.user.name,
      money: Math.round((netEarning * a.allocationPercent) / 100),
    }));
    const totalDevEarning = devEarnings.reduce((sum, d) => sum + d.money, 0);

    return { deal, devEarnings, totalDevEarning };
  });

  const devTotals = new Map<string, { name: string; total: number; count: number }>();
  for (const row of rows) {
    for (const d of row.devEarnings) {
      const existing = devTotals.get(d.userId);
      if (existing) {
        existing.total += d.money;
        existing.count += 1;
      } else {
        devTotals.set(d.userId, { name: d.name, total: d.money, count: 1 });
      }
    }
  }
  const sortedDevTotals = [...devTotals.values()].sort((a, b) => b.total - a.total);
  const grandTotalEarning = rows.reduce((sum, row) => sum + row.totalDevEarning, 0);

  const closedByCounts = new Map<string, number>();
  for (const { deal } of rows) {
    if (deal.closedById) {
      closedByCounts.set(deal.closedById, (closedByCounts.get(deal.closedById) ?? 0) + 1);
    }
  }

  const devCards = Object.entries(DEV_CARD_STYLE).map(([match, { label, color }]) => {
    const devUser = devs.find((d) => d.name.toLowerCase() === match);
    const total = devUser ? devTotals.get(devUser.id)?.total ?? 0 : 0;
    const count = devUser ? closedByCounts.get(devUser.id) ?? 0 : 0;
    return { label, color, total, count };
  });

  return (
    <div className="flex flex-col h-full min-h-0 gap-6">
      <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dev Projects</h1>
          <p className="text-text-muted mt-1">
            Track all team projects, assigned developers, and live domains.
          </p>
        </div>
        <form method="GET" className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="q"
            placeholder="Search projects..."
            defaultValue={params.q ?? ""}
            className="h-auto py-2 rounded-input text-sm border border-border bg-surface px-3 w-full sm:w-[180px]"
          />
          <FormSelect
            name="categoryId"
            defaultValue={params.categoryId ?? ""}
            placeholder="All categories"
            options={[
              { value: "", label: "All categories" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            className="h-auto py-2 rounded-input text-sm w-full sm:w-[150px]"
          />
          <FormSelect
            name="devId"
            defaultValue={params.devId ?? ""}
            placeholder="All devs"
            options={[
              { value: "", label: "All devs" },
              ...devs.map((d) => ({ value: d.id, label: d.name })),
            ]}
            className="h-auto py-2 rounded-input text-sm w-full sm:w-[150px]"
          />
          <FormSelect
            name="month"
            defaultValue={params.month ?? ""}
            placeholder="All time"
            options={[{ value: "", label: "All time" }, ...monthOptions()]}
            className="h-auto py-2 rounded-input text-sm w-full sm:w-[150px]"
          />
          <Button type="submit" variant="outline" className="h-auto text-sm px-3 py-2 rounded-btn w-full sm:w-auto">
            Filter
          </Button>
        </form>
      </div>

      <div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total"
          color="#7c3aed"
          icon={Wallet}
          earning={formatPaisa(grandTotalEarning)}
          projectCount={rows.length}
        />
        {devCards.map((d) => (
          <StatCard
            key={d.label}
            label={d.label}
            color={d.color}
            icon={Code2}
            earning={formatPaisa(d.total)}
            projectCount={d.count}
          />
        ))}
      </div>

      <div className="flex-1 min-h-0 bg-surface border border-border rounded-card overflow-y-auto overflow-x-hidden">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[11%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[11%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead className="bg-surface-2 border-b border-border sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2.5 font-semibold text-text-muted">Project</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted">Category</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted">Date</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted">Total Price</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted">Closed By</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted">Dev 1</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted">Dev 2</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted">Dev 3</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted">Total Earning</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted">Domain</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-text-muted">
                  No active projects found.
                </td>
              </tr>
            ) : (
              rows.map(({ deal, devEarnings, totalDevEarning }) => {
                return (
                  <tr key={deal.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-3 py-2.5 align-top">
                      <div className="font-medium text-text text-xs truncate" title={deal.projectName}>
                        <Link href={`/admin/deals/${deal.id}`} className="hover:underline">
                          {deal.projectName}
                        </Link>
                      </div>
                      <div className="text-[11px] text-text-muted truncate" title={deal.client.name}>
                        {deal.client.name}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      {deal.category ? (
                        <span
                          className="block w-full max-w-25 truncate px-2 py-0.5 rounded-full bg-surface-2 text-[11px] text-center border border-border text-text-muted"
                          title={deal.category.name}
                        >
                          {deal.category.name}
                        </span>
                      ) : (
                        <span className="text-text-faint">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top text-xs text-text-muted">
                      {deal.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-2.5 align-top font-mono">
                      {formatPaisa(deal.totalPrice)}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      {deal.closedBy ? (
                        <span className="text-xs wrap-break-word">{deal.closedBy.name}</span>
                      ) : (
                        <span className="text-text-faint">-</span>
                      )}
                    </td>
                    {[0, 1, 2].map((i) => {
                      const d = devEarnings[i];
                      if (!d) {
                        return (
                          <td key={i} className="px-3 py-2.5 align-top">
                            <span className="text-text-faint text-xs">-</span>
                          </td>
                        );
                      }
                      return (
                        <td key={i} className="px-3 py-2.5 align-top">
                          <div className="text-xs">
                            <div className="font-medium wrap-break-word">{d.name}</div>
                            <div className="font-mono text-text-muted">{formatPaisa(d.money)}</div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 align-top font-mono font-medium">
                      {formatPaisa(totalDevEarning)}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <LinkInput
                        dealId={deal.id}
                        initialLink={deal.link}
                        initialPreviewImage={deal.previewImage}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot className="bg-surface-2 border-t border-border sticky bottom-0 z-10">
              <tr>
                <td className="px-3 py-2.5 font-semibold text-text">Totals</td>
                <td className="px-3 py-2.5" />
                <td className="px-3 py-2.5" />
                <td className="px-3 py-2.5" />
                <td className="px-3 py-2.5" />
                {[0, 1, 2].map((i) => {
                  const d = sortedDevTotals[i];
                  if (!d) {
                    return <td key={i} className="px-3 py-2.5" />;
                  }
                  return (
                    <td key={i} className="px-3 py-2.5 align-top">
                      <div className="text-xs">
                        <div className="font-medium wrap-break-word">{d.name}</div>
                        <div className="font-mono text-text-muted">{formatPaisa(d.total)}</div>
                      </div>
                    </td>
                  );
                })}
                <td className="px-3 py-2.5 font-mono font-semibold text-text">
                  {formatPaisa(grandTotalEarning)}
                </td>
                <td className="px-3 py-2.5" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
