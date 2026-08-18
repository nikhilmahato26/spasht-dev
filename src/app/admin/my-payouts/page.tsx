import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { formatPaisa } from "@/lib/money";
import { getUserPayoutSummary } from "@/lib/payouts-data";

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-card p-3.5">
      <p className="text-xs uppercase tracking-label text-text-muted font-semibold">{label}</p>
      <p className="font-mono text-2xl font-semibold mt-1.5 tracking-tighter">{value}</p>
    </div>
  );
}

export default async function MyPayoutsPage() {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin/team");

  const summary = await getUserPayoutSummary(user.id);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-6">My Payouts</h1>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <SummaryCard label="Total Entitled" value={formatPaisa(summary.entitled)} />
        <SummaryCard label="Total Paid" value={formatPaisa(summary.paid)} />
        <SummaryCard label="Total Due" value={formatPaisa(summary.due)} />
      </div>

      <h2 className="text-lg font-semibold mb-3">Payout ledger</h2>
      <div className="bg-surface border border-border rounded-card divide-y divide-border mb-8">
        {summary.payouts.map((payout) => (
          <div key={payout.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="text-base">{payout.method || "Payout"}</span>
              {payout.note && <span className="text-sm text-text-faint"> · {payout.note}</span>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-faint">
                {payout.date.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="font-mono text-base font-semibold">{formatPaisa(payout.amount)}</span>
            </div>
          </div>
        ))}
        {summary.payouts.length === 0 && (
          <p className="text-text-muted text-sm px-4 py-4">No payouts recorded yet.</p>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-3">Deal history</h2>
      <div className="flex flex-col gap-2">
        {summary.dealEarnings.map(({ assignment, amount }) => (
          <Link
            key={assignment.id}
            href={`/admin/deals/${assignment.dealId}`}
            className="flex items-center justify-between bg-surface border border-border rounded-card px-4 py-3 hover:border-text-faint transition-colors"
          >
            <div>
              <p className="font-medium">{assignment.deal.projectName}</p>
              <p className="text-sm text-text-faint">
                {assignment.deal.client.name} · {assignment.role || assignment.deal.status} ·{" "}
                {assignment.allocationPercent}% of net earning
              </p>
            </div>
            <span className="font-mono text-base font-semibold">{formatPaisa(amount)}</span>
          </Link>
        ))}
        {summary.dealEarnings.length === 0 && (
          <p className="text-text-muted text-sm">Not assigned to any deals yet.</p>
        )}
      </div>
    </div>
  );
}
