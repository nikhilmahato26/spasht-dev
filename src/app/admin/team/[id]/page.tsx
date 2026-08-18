import Link from "next/link";
import { Handshake, IndianRupee, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaisa } from "@/lib/money";
import { getUserPayoutSummary } from "@/lib/payouts-data";
import { SubmitButton } from "@/components/submit-button";
import { SummaryCard } from "@/components/summary-card";
import { FormSelect } from "@/components/form-select";
import { Card } from "@/components/ui/card";
import { deleteMember, recordPayout, updateMember } from "../actions";

export default async function TeamMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;

  const member = await db.user.findUnique({ where: { id } });
  if (!member) notFound();

  const [summary, createdOrClosedDealCount, auditCount] = await Promise.all([
    getUserPayoutSummary(id),
    db.deal.count({ where: { OR: [{ createdById: id }, { closedById: id }] } }),
    db.auditLog.count({ where: { userId: id } }),
  ]);
  const hasHistory =
    summary.dealEarnings.length > 0 ||
    summary.payouts.length > 0 ||
    createdOrClosedDealCount > 0 ||
    auditCount > 0;
  const isSelf = id === admin.id;

  const recordPayoutForUser = recordPayout.bind(null, id);
  const updateMemberForUser = updateMember.bind(null, id);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{member.name}</h1>
          <p className="text-text-muted text-sm mt-1">{member.email}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isSelf || hasHistory ? (
            <button
              type="button"
              disabled
              title={isSelf ? "You can't delete your own account" : "Can't delete a member with deal or payout history"}
              className="bg-surface text-text-faint border border-border px-4 py-2.5 rounded-btn text-base font-medium cursor-not-allowed"
            >
              Delete
            </button>
          ) : (
            <form action={deleteMember}>
              <input type="hidden" name="id" value={member.id} />
              <SubmitButton
                pendingText="Deleting..."
                className="bg-surface text-danger border border-border px-4 py-2.5 rounded-btn text-base font-medium hover:border-danger transition-colors disabled:opacity-60"
              >
                Delete
              </SubmitButton>
            </form>
          )}
          {!isSelf && hasHistory && (
            <p className="text-2xs text-text-faint">Deactivate instead — they have deal or payout history.</p>
          )}
        </div>
      </div>

      {error === "has-history" && (
        <p className="text-sm text-danger mb-4 bg-cost-soft border border-cost/30 rounded-input px-3 py-2">
          Can&apos;t delete this member — they have deal or payout history attached. Deactivate them
          instead using the toggle below.
        </p>
      )}
      {error === "self" && (
        <p className="text-sm text-danger mb-4 bg-cost-soft border border-cost/30 rounded-input px-3 py-2">
          You can&apos;t delete your own account.
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryCard label="Total Entitled" value={formatPaisa(summary.entitled)} color="#39568F" icon={Handshake} />
        <SummaryCard label="Total Paid" value={formatPaisa(summary.paid)} color="#0F6E5F" icon={IndianRupee} />
        <SummaryCard label="Total Due" value={formatPaisa(summary.due)} color="#9A5B13" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Card className="border border-border rounded-card ring-0 p-5 gap-0">
          <p className="text-lg font-semibold mb-4">Role &amp; status</p>
          <form action={updateMemberForUser} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
                  Role
                </label>
                <FormSelect
                  name="role"
                  defaultValue={member.role}
                  placeholder="Role"
                  options={[
                    { value: "MEMBER", label: "Member" },
                    { value: "ADMIN", label: "Admin" },
                  ]}
                  className="w-full h-auto py-2 rounded-input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
                  Type
                </label>
                <FormSelect
                  name="type"
                  defaultValue={member.type}
                  placeholder="Type"
                  options={[
                    { value: "DEV", label: "Dev" },
                    { value: "MARKETING", label: "Marketing" },
                  ]}
                  className="w-full h-auto py-2 rounded-input"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={member.isActive}
                className="w-4 h-4"
              />
              Active
            </label>
            <SubmitButton
              pendingText="Saving..."
              className="self-start bg-surface text-text border border-border px-4 py-2 rounded-btn text-base font-medium hover:border-text-faint transition-colors disabled:opacity-60"
            >
              Save
            </SubmitButton>
          </form>
        </Card>

        <Card className="border border-border rounded-card ring-0 p-5 gap-0">
          <p className="text-lg font-semibold mb-4">Record payout</p>
          <form action={recordPayoutForUser} className="flex flex-col gap-3">
            <FormSelect
              name="dealId"
              placeholder="General Payout"
              options={[
                { value: "", label: "General Payout" },
                ...summary.dealEarnings
                  .filter(({ left }) => left !== 0)
                  .map(({ assignment, left }) => ({
                    value: assignment.dealId,
                    label: `${assignment.deal.client.name} - ${assignment.deal.projectName} (Left: ${formatPaisa(left)})`,
                  })),
              ]}
              className="w-full h-auto py-2 rounded-input"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                name="amount"
                placeholder="₹ amount"
                min="0"
                required
                className="border border-border rounded-input px-3 py-2 text-base bg-surface font-mono"
              />
              <input
                name="method"
                placeholder="Method (UPI, bank...)"
                className="border border-border rounded-input px-3 py-2 text-base bg-surface"
              />
            </div>
            <input
              name="note"
              placeholder="Note (optional)"
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            />
            <SubmitButton
              pendingText="Recording..."
              className="self-start bg-text text-surface border border-text px-4 py-2 rounded-btn text-base font-medium hover:bg-black transition-colors disabled:opacity-60"
            >
              Record payout
            </SubmitButton>
          </form>
        </Card>
      </div>

      <h2 className="text-lg font-semibold mb-3">Payout ledger</h2>
      <div className="bg-surface border border-border rounded-card divide-y divide-border mb-8">
        {summary.payouts.map((payout) => (
          <div key={payout.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="text-base">{payout.method || "Payout"}</span>
              {payout.deal && <span className="font-medium ml-2 bg-cost-soft px-2 py-0.5 rounded text-xs">{payout.deal.projectName}</span>}
              {payout.note && <span className="text-sm text-text-faint ml-2">· {payout.note}</span>}
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
        {summary.dealEarnings.map(({ assignment, amount, left }) => (
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
            <div className="text-right">
              <span className="font-mono text-base font-semibold block">{formatPaisa(amount)}</span>
              {left === 0 ? (
                <span className="text-xs text-accent font-medium">Paid in full</span>
              ) : (
                <span className="text-xs text-text-faint font-medium">Left: {formatPaisa(left)}</span>
              )}
            </div>
          </Link>
        ))}
        {summary.dealEarnings.length === 0 && (
          <p className="text-text-muted text-sm">Not assigned to any deals yet.</p>
        )}
      </div>
    </div>
  );
}
