import Link from "next/link";
import {
  Activity,
  AlertCircle,
  Clock,
  Filter,
  Handshake,
  IndianRupee,
  PieChart,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaisa } from "@/lib/money";
import { computeDealSplit, computeAssignmentAmount } from "@/lib/deal-calc";
import { listDealsForUser } from "@/lib/deals-data";
import { getUserPayoutSummary } from "@/lib/payouts-data";
import { timeAgo } from "@/lib/time-ago";
import { AUDIT_ACTION_LABELS } from "@/lib/audit-labels";
import { Sparkline } from "@/components/sparkline";
import { RevenueTrendChart } from "@/components/revenue-trend-chart";
import { RevenueDonut } from "@/components/revenue-donut";
import { DealPipeline } from "@/components/deal-pipeline";
import { FormSelect } from "@/components/form-select";
import { Button } from "@/components/ui/button";
import type { Deal, DealStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<DealStatus, string> = {
  LEAD: "Lead",
  IN_PROGRESS: "In progress",
  DELIVERED: "Delivered",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

const STATUS_HEX: Record<DealStatus, string> = {
  LEAD: "#A5A49C",
  IN_PROGRESS: "#B9832A",
  DELIVERED: "#6B5490",
  PAID: "#0F6E5F",
  CANCELLED: "#9A3C3C",
};

const STATUS_ORDER: DealStatus[] = ["LEAD", "IN_PROGRESS", "DELIVERED", "PAID", "CANCELLED"];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function last6Months(baseDate = new Date()) {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - (5 - i), 1);
    return { key: monthKey(d), label: d.toLocaleDateString("en-IN", { month: "short" }) };
  });
}

function SummaryCard({
  label,
  value,
  color,
  icon: Icon,
  sparkData,
  sparkFormat,
}: {
  label: string;
  value: string;
  color: string;
  icon: LucideIcon;
  sparkData?: { label: string; value: number }[];
  sparkFormat?: "currency" | "count";
}) {
  return (
    <div className="group relative bg-surface border border-border rounded-card p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-[0.15] group-hover:opacity-25 transition-opacity duration-200"
        style={{ backgroundColor: color }}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-label text-text-muted font-semibold">{label}</p>
          <p className="font-mono text-xl sm:text-[26px] font-semibold mt-1.5 tracking-tighter leading-none truncate">
            {value}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-btn flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        >
          <Icon size={18} strokeWidth={2.25} className="text-white" />
        </div>
      </div>
      {sparkData && sparkFormat && (
        <div className="relative mt-2">
          <Sparkline data={sparkData} color={color} format={sparkFormat} />
        </div>
      )}
    </div>
  );
}

export default async function HomePage(props: {
  searchParams?: Promise<{ month?: string; categoryId?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const user = await requireUser();
  const firstName = user.name?.split(" ")[0] ?? user.name;

  if (user.role === "ADMIN") {
    const categories = await db.category.findMany({ orderBy: { name: "asc" } });

    const filterMonth = searchParams?.month;
    const filterCategoryId = searchParams?.categoryId;
    const filterStatus = searchParams?.status as DealStatus | undefined;

    const where: any = {};
    if (filterCategoryId) where.categoryId = filterCategoryId;
    if (filterStatus) where.status = filterStatus;

    let baseDate = new Date();
    if (filterMonth) {
      const [yearStr, monthStr] = filterMonth.split("-");
      const year = parseInt(yearStr, 10);
      const monthIndex = parseInt(monthStr, 10);
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 1);
      where.createdAt = { gte: start, lt: end };
      baseDate = start;
    }

    const months = last6Months(baseDate);

    const now = new Date();
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { value: monthKey(d), label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) };
    });

    const [deals, clients, recentAuditLogs] = await Promise.all([
      db.deal.findMany({ where, include: { client: true, category: true } }),
      db.client.findMany({ include: { deals: { select: { totalPrice: true } } } }),
      db.auditLog.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { user: true } }),
    ]);

    const revenueByMonth = new Map(months.map((m) => [m.key, 0]));
    const marginByMonth = new Map(months.map((m) => [m.key, 0]));
    const dueByMonth = new Map(months.map((m) => [m.key, 0]));
    const dealsCountByMonth = new Map(months.map((m) => [m.key, 0]));
    const clientsByMonth = new Map(months.map((m) => [m.key, 0]));

    let totalRevenue = 0;
    let totalMargin = 0;
    let totalDue = 0;
    let dueDealsCount = 0;
    const revenueByCategory = new Map<string, { name: string; color: string; value: number }>();
    const pipelineCounts: Record<DealStatus, number> = {
      LEAD: 0,
      IN_PROGRESS: 0,
      DELIVERED: 0,
      PAID: 0,
      CANCELLED: 0,
    };

    for (const deal of deals) {
      const split = computeDealSplit(deal);
      totalRevenue += deal.totalPrice;
      totalMargin += split.netEarning;
      totalDue += deal.dueMoney;
      if (deal.dueMoney > 0) dueDealsCount += 1;
      pipelineCounts[deal.status] += 1;

      const key = monthKey(deal.createdAt);
      if (revenueByMonth.has(key)) {
        revenueByMonth.set(key, revenueByMonth.get(key)! + deal.totalPrice);
        marginByMonth.set(key, marginByMonth.get(key)! + split.netEarning);
        dueByMonth.set(key, dueByMonth.get(key)! + deal.dueMoney);
        dealsCountByMonth.set(key, dealsCountByMonth.get(key)! + 1);
      }

      const catName = deal.category?.name ?? "Uncategorized";
      const catColor = deal.category?.color ?? "#A5A49C";
      const existing = revenueByCategory.get(catName);
      if (existing) existing.value += deal.totalPrice;
      else revenueByCategory.set(catName, { name: catName, color: catColor, value: deal.totalPrice });
    }

    for (const client of clients) {
      const key = monthKey(client.createdAt);
      if (clientsByMonth.has(key)) clientsByMonth.set(key, clientsByMonth.get(key)! + 1);
    }

    const trendData = months.map((m) => ({
      label: m.label,
      revenue: revenueByMonth.get(m.key)!,
      margin: marginByMonth.get(m.key)!,
    }));

    const revenueSpark = months.map((m) => ({ label: m.label, value: revenueByMonth.get(m.key)! }));
    const marginSpark = months.map((m) => ({ label: m.label, value: marginByMonth.get(m.key)! }));
    const dueSpark = months.map((m) => ({ label: m.label, value: dueByMonth.get(m.key)! }));
    const dealsSpark = months.map((m) => ({ label: m.label, value: dealsCountByMonth.get(m.key)! }));
    const clientsSpark = months.map((m) => ({ label: m.label, value: clientsByMonth.get(m.key)! }));

    const topDeal = deals.reduce<Deal | null>(
      (best, d) => (!best || d.totalPrice > best.totalPrice ? d : best),
      null
    );
    const topDealWithRelations = topDeal
      ? deals.find((d) => d.id === topDeal.id)!
      : null;

    const topClients = clients
      .map((c) => ({ id: c.id, name: c.name, revenue: c.deals.reduce((sum, d) => sum + d.totalPrice, 0) }))
      .filter((c) => c.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const recentDeals = [...deals]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    const teamMembers = await db.user.findMany({ where: { isActive: true } });
    const teamPayoutSummaries = await Promise.all(
      teamMembers.map(async (member) => ({
        member,
        summary: await getUserPayoutSummary(member.id),
      }))
    );
    const teamDueTotal = teamPayoutSummaries.reduce((sum, t) => sum + t.summary.due, 0);
    const teamMembersOwed = teamPayoutSummaries
      .filter((t) => t.summary.due > 0)
      .sort((a, b) => b.summary.due - a.summary.due)
      .slice(0, 4);

    const categoryDonutData = Array.from(revenueByCategory.values()).sort((a, b) => b.value - a.value);

    const pipelineStages = STATUS_ORDER.map((status) => ({
      key: status,
      label: STATUS_LABELS[status],
      count: pipelineCounts[status],
      color: STATUS_HEX[status],
    }));

    const activeDealsCount = deals.filter((d) => d.status !== "PAID").length;

    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Home</h1>
            <p className="text-text-muted text-sm mt-1">
              Welcome back, {firstName}. Here&apos;s what&apos;s happening at spasht.dev.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
            <Link
              href="/admin/deals/new"
              className="bg-text text-surface border border-text px-4 py-2.5 rounded-btn text-base font-medium hover:bg-black transition-colors self-end"
            >
              + New deal
            </Link>
            <form method="GET" className="flex flex-wrap items-center justify-end gap-2 w-full">
              <FormSelect
                name="month"
                defaultValue={filterMonth ?? ""}
                placeholder="All time"
                options={[
                  { value: "", label: "All time" },
                  ...monthOptions,
                ]}
                className="h-auto py-1.5 rounded-input text-sm w-[140px]"
              />
              <FormSelect
                name="status"
                defaultValue={filterStatus ?? ""}
                placeholder="All statuses"
                options={[
                  { value: "", label: "All statuses" },
                  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
                ]}
                className="h-auto py-1.5 rounded-input text-sm w-[130px]"
              />
              <FormSelect
                name="categoryId"
                defaultValue={filterCategoryId ?? ""}
                placeholder="All categories"
                options={[
                  { value: "", label: "All categories" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                className="h-auto py-1.5 rounded-input text-sm w-[140px]"
              />
              <Button type="submit" variant="outline" className="h-auto text-sm px-3 py-1.5 rounded-btn">
                Filter
              </Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <SummaryCard
            label="Total Revenue"
            value={formatPaisa(totalRevenue)}
            color="#0F6E5F"
            icon={IndianRupee}
            sparkData={revenueSpark}
            sparkFormat="currency"
          />
          <SummaryCard
            label="Active Deals"
            value={String(activeDealsCount)}
            color="#39568F"
            icon={Handshake}
            sparkData={dealsSpark}
            sparkFormat="count"
          />
          <SummaryCard
            label="Net Earning"
            value={formatPaisa(totalMargin)}
            color="#6B5490"
            icon={TrendingUp}
            sparkData={marginSpark}
            sparkFormat="currency"
          />
          <SummaryCard
            label="Due"
            value={formatPaisa(totalDue)}
            color="#9A5B13"
            icon={Clock}
            sparkData={dueSpark}
            sparkFormat="currency"
          />
          <SummaryCard
            label="Clients"
            value={String(clients.length)}
            color="#B9832A"
            icon={Users}
            sparkData={clientsSpark}
            sparkFormat="count"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2 bg-surface border border-border rounded-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-dev" />
              <p className="text-lg font-semibold">Performance Overview</p>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-sm text-text-muted">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0F6E5F" }} />
                    Revenue
                  </p>
                  <p className="font-mono text-lg font-semibold mt-0.5">{formatPaisa(totalRevenue)}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-sm text-text-muted">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#6B5490" }} />
                    Net Earning
                  </p>
                  <p className="font-mono text-lg font-semibold mt-0.5">{formatPaisa(totalMargin)}</p>
                </div>
              </div>
              <RevenueTrendChart data={trendData} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-pending-soft border border-pending/30 rounded-card p-4 shadow-sm">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-pending mb-1">
                <AlertCircle size={15} />
                Needs Attention
              </p>
              <p className="text-sm text-text">
                {dueDealsCount > 0 ? (
                  <>
                    {dueDealsCount} deal{dueDealsCount === 1 ? "" : "s"} have pending dues
                    totaling <span className="font-mono font-semibold">{formatPaisa(totalDue)}</span>.
                  </>
                ) : (
                  "No outstanding dues right now."
                )}
              </p>
              {dueDealsCount > 0 && (
                <Link
                  href="/admin/deals?sort=dueMoney"
                  className="inline-block mt-3 bg-surface text-text border border-border px-3 py-1.5 rounded-btn text-sm font-medium hover:border-text-faint transition-colors"
                >
                  View Details
                </Link>
              )}
            </div>

            {teamMembersOwed.length > 0 && (
              <div className="bg-surface border border-border rounded-card p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-sm font-semibold mb-1">
                  <Wallet size={15} className="text-dev" />
                  Team Payouts Due
                </p>
                <p className="text-sm text-text-muted mb-3">
                  <span className="font-mono font-semibold text-text">{formatPaisa(teamDueTotal)}</span>{" "}
                  owed across the team
                </p>
                <div className="flex flex-col gap-2">
                  {teamMembersOwed.map(({ member, summary }) => (
                    <Link
                      key={member.id}
                      href={`/admin/team/${member.id}`}
                      className="flex items-center justify-between text-sm hover:underline"
                    >
                      <span>{member.name}</span>
                      <span className="font-mono font-medium">{formatPaisa(summary.due)}</span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/admin/team"
                  className="inline-block mt-3 bg-surface text-text border border-border px-3 py-1.5 rounded-btn text-sm font-medium hover:border-text-faint transition-colors"
                >
                  View Team
                </Link>
              </div>
            )}

            {topDealWithRelations && (
              <div className="bg-surface border border-border rounded-card p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-sm font-semibold mb-2">
                  <Sparkles size={15} className="text-marketing" />
                  Top Deal
                </p>
                <p className="font-medium">{topDealWithRelations.projectName}</p>
                <p className="text-sm text-text-faint mb-3">{topDealWithRelations.client.name}</p>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-2xs text-text-faint uppercase tracking-label">Total</p>
                    <p className="font-mono font-semibold">{formatPaisa(topDealWithRelations.totalPrice)}</p>
                  </div>
                  <div>
                    <p className="text-2xs text-text-faint uppercase tracking-label">Status</p>
                    <p>{STATUS_LABELS[topDealWithRelations.status]}</p>
                  </div>
                </div>
                <Link
                  href={`/admin/deals/${topDealWithRelations.id}`}
                  className="inline-block bg-surface text-text border border-border px-3 py-1.5 rounded-btn text-sm font-medium hover:border-text-faint transition-colors"
                >
                  View Deal
                </Link>
              </div>
            )}

            <div className="bg-surface border border-border rounded-card p-4 flex-1 shadow-sm">
              <p className="flex items-center gap-1.5 text-sm font-semibold mb-3">
                <Activity size={15} className="text-accent" />
                Recent Activity
              </p>
              <div className="flex flex-col gap-3">
                {recentAuditLogs.map((log) => (
                  <div key={log.id} className="text-sm">
                    <p>
                      <span className="font-medium">{log.user.name}</span>{" "}
                      {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    <p className="text-2xs text-text-faint">{timeAgo(log.createdAt)}</p>
                  </div>
                ))}
                {recentAuditLogs.length === 0 && (
                  <p className="text-sm text-text-faint">No activity yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
            <p className="flex items-center gap-1.5 text-lg font-semibold mb-4">
              <PieChart size={16} className="text-dev" />
              Revenue by Category
            </p>
            {categoryDonutData.length > 0 ? (
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <RevenueDonut
                  data={categoryDonutData}
                  centerLabel="Total Revenue"
                  centerValue={formatPaisa(totalRevenue)}
                />
                <div className="flex flex-col gap-2 text-sm min-w-35">
                  {categoryDonutData.map((slice) => (
                    <div key={slice.name} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-text-muted">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: slice.color }}
                        />
                        {slice.name}
                      </span>
                      <span className="font-mono text-xs">
                        {totalRevenue > 0 ? Math.round((slice.value / totalRevenue) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-faint">No deals yet.</p>
            )}
          </div>

          <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
            <p className="flex items-center gap-1.5 text-lg font-semibold mb-4">
              <Filter size={16} className="text-marketing" />
              Deal Pipeline
            </p>
            <DealPipeline stages={pipelineStages} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Recent Deals</h2>
              <Link href="/admin/deals" className="text-sm text-dev hover:underline">
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {recentDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/admin/deals/${deal.id}`}
                  className="flex items-center justify-between bg-surface border border-border rounded-card px-4 py-3 shadow-sm hover:shadow-md hover:border-text-faint hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div>
                    <p className="font-medium">{deal.projectName}</p>
                    <p className="text-sm text-text-faint">{deal.client.name}</p>
                  </div>
                  <span className="font-mono text-base font-semibold">
                    {formatPaisa(deal.totalPrice)}
                  </span>
                </Link>
              ))}
              {recentDeals.length === 0 && (
                <p className="text-text-muted text-sm">No deals yet. Create your first one.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Top Clients</h2>
              <Link href="/admin/clients" className="text-sm text-dev hover:underline">
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {topClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="flex items-center justify-between bg-surface border border-border rounded-card px-4 py-3 shadow-sm hover:shadow-md hover:border-text-faint hover:-translate-y-0.5 transition-all duration-200"
                >
                  <p className="font-medium">{client.name}</p>
                  <span className="font-mono text-base font-semibold">
                    {formatPaisa(client.revenue)}
                  </span>
                </Link>
              ))}
              {topClients.length === 0 && (
                <p className="text-text-muted text-sm">No client revenue yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MEMBER view
  const [myDeals, myPayouts] = await Promise.all([
    listDealsForUser(user),
    db.payout.findMany({ where: { userId: user.id } }),
  ]);

  const assignments = await db.dealAssignment.findMany({
    where: { userId: user.id },
    include: { deal: { include: { payments: true } } },
  });

  let entitled = 0;
  for (const a of assignments) {
    const split = computeDealSplit(a.deal);
    entitled += computeAssignmentAmount(split.netEarning, a.allocationPercent);
  }
  const paid = myPayouts.reduce((sum, p) => sum + p.amount, 0);
  const due = Math.max(0, entitled - paid);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Home</h1>
        <p className="text-text-muted text-sm mt-1">Welcome back, {firstName}.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <SummaryCard label="My Entitled" value={formatPaisa(entitled)} color="#39568F" icon={Handshake} />
        <SummaryCard label="My Paid" value={formatPaisa(paid)} color="#0F6E5F" icon={IndianRupee} />
        <SummaryCard label="My Due" value={formatPaisa(due)} color="#9A5B13" icon={Clock} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">My recent deals</h2>
        <Link href="/admin/deals" className="text-sm text-dev hover:underline">
          View all
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {myDeals.slice(0, 5).map((deal) => (
          <Link
            key={deal.id}
            href={`/admin/deals/${deal.id}`}
            className="flex items-center justify-between bg-surface border border-border rounded-card px-4 py-3 shadow-sm hover:shadow-md hover:border-text-faint hover:-translate-y-0.5 transition-all duration-200"
          >
            <div>
              <p className="font-medium">{deal.projectName}</p>
              <p className="text-sm text-text-faint">{deal.client.name}</p>
            </div>
          </Link>
        ))}
        {myDeals.length === 0 && (
          <p className="text-text-muted text-sm">No deals assigned to you yet.</p>
        )}
      </div>
    </div>
  );
}
