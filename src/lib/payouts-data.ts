import { db } from "@/lib/db";
import { computeDealSplit, computeAssignmentAmount } from "@/lib/deal-calc";

export async function getUserPayoutSummary(userId: string) {
  const [assignments, payouts] = await Promise.all([
    db.dealAssignment.findMany({
      where: { userId },
      include: { deal: { include: { client: true } }, user: true },
      orderBy: { deal: { createdAt: "desc" } },
    }),
    db.payout.findMany({ where: { userId }, orderBy: { date: "desc" }, include: { deal: { include: { payments: true } } } }),
  ]);

  let entitled = 0;
  const dealEarnings = assignments.map((a) => {
    const split = computeDealSplit(a.deal);
    const amount = computeAssignmentAmount(split.netEarning, a.allocationPercent);
    entitled += amount;
    
    const dealPayouts = payouts.filter(p => p.dealId === a.dealId);
    const paidForDeal = dealPayouts.reduce((sum, p) => sum + p.amount, 0);
    const left = Math.max(0, amount - paidForDeal);
    
    return { assignment: a, amount, paid: paidForDeal, left };
  });

  const paid = payouts.reduce((sum, p) => sum + p.amount, 0);
  const due = Math.max(0, entitled - paid);

  return { entitled, paid, due, payouts, dealEarnings };
}
