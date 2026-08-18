import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getDealForUser } from "@/lib/deals-data";
import { computeDealSplit, computeAssignmentAmount } from "@/lib/deal-calc";
import { formatPaisa } from "@/lib/money";
import { MoneyFlowBar } from "@/components/money-flow-bar";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { addPayment, addCostItem, deleteDeal } from "../actions";
import type { DealStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<DealStatus, string> = {
  LEAD: "Lead",
  IN_PROGRESS: "In progress",
  DELIVERED: "Delivered",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const deal = await getDealForUser(id, user);
  if (!deal) notFound();

  const split = computeDealSplit(deal);
  const addPaymentForDeal = addPayment.bind(null, deal.id);
  const addCostItemForDeal = addCostItem.bind(null, deal.id);

  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {deal.category && (
              <Badge
                variant="secondary"
                className="rounded-badge uppercase tracking-[0.03em]"
                style={{ backgroundColor: `${deal.category.color}22`, color: deal.category.color ?? undefined }}
              >
                {deal.category.name}
              </Badge>
            )}
            <Badge variant="secondary" className="rounded-badge uppercase tracking-[0.03em] bg-dev-soft text-dev">
              {STATUS_LABELS[deal.status]}
            </Badge>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{deal.projectName}</h1>
          <p className="text-sm text-text-faint mt-1">
            <Link href={`/admin/clients/${deal.client.id}`} className="hover:underline">
              {deal.client.name}
            </Link>
            {" · "}
            {deal.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            {deal.closedBy && ` · closed by ${deal.closedBy.name}`}
            {deal.link && (
              <>
                {" · "}
                <a href={deal.link} target="_blank" rel="noreferrer" className="text-dev hover:underline">
                  link
                </a>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-2xl font-semibold tracking-tighter">
            {formatPaisa(deal.totalPrice)}
          </span>
          <Link
            href={`/admin/deals/${deal.id}/edit`}
            className="bg-surface text-text border border-border px-3 py-2 rounded-btn text-sm font-medium hover:border-text-faint transition-colors"
          >
            Edit
          </Link>
          {user.role === "ADMIN" && (
            <form action={deleteDeal}>
              <input type="hidden" name="id" value={deal.id} />
              <SubmitButton
                pendingText="Deleting..."
                className="bg-surface text-danger border border-border px-3 py-2 rounded-btn text-sm font-medium hover:border-danger transition-colors disabled:opacity-60"
              >
                Delete
              </SubmitButton>
            </form>
          )}
        </div>
      </div>

      {deal.dueMoney > 0 && (
        <div className="bg-pending-soft border border-pending/30 rounded-card px-4 py-3 mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-pending">Due from client</span>
          <span className="font-mono font-semibold text-pending">{formatPaisa(deal.dueMoney)}</span>
        </div>
      )}

      <div className="mt-6">
        <MoneyFlowBar split={split} />
        <div className="grid grid-cols-3 gap-2 mt-2 text-2xs">
          <div>
            <span className="inline-block w-2 h-2 rounded-full bg-cost-soft border border-cost mr-1" />
            Costs · <span className="font-mono">{formatPaisa(split.costs)}</span>
          </div>
          <div>
            <span className="inline-block w-2 h-2 rounded-full bg-marketing mr-1" />
            Marketing · <span className="font-mono">{formatPaisa(split.marketing)}</span>
          </div>
          <div>
            <span className="inline-block w-2 h-2 rounded-full bg-dev mr-1" />
            Dev pool · <span className="font-mono">{formatPaisa(split.devPool)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mt-8">
        <div>
          <h2 className="text-lg font-semibold mb-3">Team assignments</h2>
          <div className="bg-surface border border-border rounded-card divide-y divide-border">
            {deal.assignments.map((a) => {
              const isSelf = a.userId === user.id;
              const canSeeAmount = user.role === "ADMIN" || isSelf;
              const amount = computeAssignmentAmount(split.netEarning, a.allocationPercent);
              return (
                <div key={a.id} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="font-medium text-base">{a.user.name}</p>
                    <p className="text-sm text-text-faint">
                      {a.role || a.user.type} · {a.allocationPercent}% of net earning
                    </p>
                  </div>
                  <span className="font-mono text-base">
                    {canSeeAmount ? formatPaisa(amount) : "—"}
                  </span>
                </div>
              );
            })}
            {deal.assignments.length === 0 && (
              <p className="text-text-muted text-sm px-4 py-4">No one assigned yet.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Cost items</h2>
          <div className="bg-surface border border-border rounded-card divide-y divide-border mb-3">
            {deal.costItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-base">
                  {item.label} {item.isRecurring && <span className="text-2xs text-text-faint">(recurring)</span>}
                </span>
                <span className="font-mono text-base">{formatPaisa(item.amount)}</span>
              </div>
            ))}
            {deal.costItems.length === 0 && (
              <p className="text-text-muted text-sm px-4 py-4">No cost items yet.</p>
            )}
          </div>
          <form action={addCostItemForDeal} className="flex gap-2 items-center flex-wrap">
            <input
              name="label"
              placeholder="Label (e.g. Domain)"
              required
              className="border border-border rounded-input px-3 py-1.5 text-sm bg-surface flex-1 min-w-[120px]"
            />
            <input
              type="number"
              name="amount"
              placeholder="₹"
              min="0"
              required
              className="border border-border rounded-input px-3 py-1.5 text-sm bg-surface font-mono w-24"
            />
            <label className="flex items-center gap-1 text-sm text-text-muted">
              <input type="checkbox" name="isRecurring" className="w-3.5 h-3.5" /> recurring
            </label>
            <SubmitButton
              pendingText="Adding..."
              className="bg-surface text-text border border-border px-3 py-1.5 rounded-btn text-sm font-medium hover:border-text-faint transition-colors disabled:opacity-60"
            >
              Add
            </SubmitButton>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Payments received</h2>
        <div className="bg-surface border border-border rounded-card divide-y divide-border mb-3">
          {deal.payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <span className="text-base">{p.method || "Payment"}</span>
                {p.note && <span className="text-sm text-text-faint"> · {p.note}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-faint">
                  {p.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span className="font-mono text-base">{formatPaisa(p.amount)}</span>
              </div>
            </div>
          ))}
          {deal.payments.length === 0 && (
            <p className="text-text-muted text-sm px-4 py-4">No payments recorded yet.</p>
          )}
        </div>
        <form action={addPaymentForDeal} className="flex gap-2 items-center flex-wrap">
          <input
            type="number"
            name="amount"
            placeholder="₹ amount"
            min="0"
            required
            className="border border-border rounded-input px-3 py-1.5 text-sm bg-surface font-mono w-32"
          />
          <input
            name="method"
            placeholder="Method (UPI, bank...)"
            className="border border-border rounded-input px-3 py-1.5 text-sm bg-surface w-40"
          />
          <input
            name="note"
            placeholder="Note (optional)"
            className="border border-border rounded-input px-3 py-1.5 text-sm bg-surface flex-1 min-w-[120px]"
          />
          <SubmitButton
            pendingText="Recording..."
            className="bg-surface text-text border border-border px-3 py-1.5 rounded-btn text-sm font-medium hover:border-text-faint transition-colors disabled:opacity-60"
          >
            Record payment
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
