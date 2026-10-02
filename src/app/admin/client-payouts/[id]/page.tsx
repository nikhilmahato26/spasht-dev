import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  IndianRupee,
  Code,
  Megaphone,
  Receipt,
  Layers,
  Send,
  GitBranch,
} from "lucide-react";
import { requirePermission } from "@/lib/dal";
import { can } from "@/lib/permissions";
import { getClientLedgerData } from "@/lib/client-payouts-data";
import { formatPaisa } from "@/lib/money";
import { SummaryCard } from "@/components/summary-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PayoutForm } from "./payout-form";
import { TransactionTree } from "./transaction-tree";

export default async function ClientPayoutWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePermission("PAYOUTS_VIEW");
  const canRecord = can(user, "PAYOUTS_MANAGE");
  const { id } = await params;

  const data = await getClientLedgerData(id);
  if (!data) notFound();

  const { client, deals, totals } = data;

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/admin/client-payouts"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-3 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Ledger</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text">
                {client.name}
              </h1>
              {client.company && (
                <Badge
                  variant="secondary"
                  className="rounded-sm uppercase tracking-wider text-xs px-2 py-0.5 bg-border/40 text-text"
                >
                  {client.company}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted mt-1">
              {client.email && <span>{client.email}</span>}
              {client.phone && <span>· {client.phone}</span>}
              <span>· {deals.length} {deals.length === 1 ? "Project Deal" : "Project Deals"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link
              href={`/admin/clients/${client.id}`}
              className="text-xs font-medium text-text-muted hover:text-text border border-border px-3 py-1.5 rounded-btn hover:border-text-faint transition-colors"
            >
              View Client Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Top Financial Health Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Total Inflow"
          value={formatPaisa(totals.totalInflow)}
          color="#0f6e5f"
          icon={IndianRupee}
        />
        <SummaryCard
          label="Dev Payouts"
          value={formatPaisa(totals.totalDevPaid)}
          color="#39568f"
          icon={Code}
        />
        <SummaryCard
          label="Marketing Payouts"
          value={formatPaisa(totals.totalMarketingPaid)}
          color="#9A5B13"
          icon={Megaphone}
        />
        <SummaryCard
          label="Project Costs"
          value={formatPaisa(totals.totalCosts)}
          color="#c2410c"
          icon={Receipt}
        />
      </div>

      {/* Two Column Layout: Payout Form & Immutable Transaction Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Issue Section Payout Form (only with Record payouts) */}
        {canRecord && (
          <div className="lg:col-span-5 space-y-4">
            <Card className="border border-border rounded-card p-5 bg-surface">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <div className="w-7 h-7 rounded-full bg-text text-surface flex items-center justify-center">
                  <Send size={14} />
                </div>
                <div>
                  <h2 className="font-semibold text-sm text-text">Disburse Section Payout</h2>
                  <p className="text-2xs text-text-muted">Pay out to the Dev or Marketing section</p>
                </div>
              </div>

              <PayoutForm
                clientId={client.id}
                deals={deals.map((d) => ({
                  id: d.id,
                  projectName: d.projectName,
                  status: d.status,
                  sections: d.sections,
                }))}
              />
            </Card>
          </div>
        )}

        {/* Right Column: Immutable Transaction Tree */}
        <div className={`${canRecord ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-dev" />
            <h2 className="font-semibold text-base text-text">Transaction Audit Tree</h2>
          </div>

          <TransactionTree clientName={client.name} deals={deals} />
        </div>
      </div>
    </div>
  );
}
