import { db } from "@/lib/db";
import { computeDealSplit, computeAssignmentAmount } from "@/lib/deal-calc";

export async function getUserPayoutSummary(userId: string) {
  const [assignments, payouts] = await Promise.all([
    db.dealAssignment.findMany({
      where: { userId },
      include: { deal: { include: { client: true } }, user: true },
      orderBy: { deal: { createdAt: "desc" } },
    }),
    db.payout.findMany({ where: { userId }, orderBy: { date: "desc" } }),
  ]);

  let entitled = 0;
  const dealEarnings = assignments.map((a) => {
    const split = computeDealSplit(a.deal);
    const amount = computeAssignmentAmount(split.netEarning, a.allocationPercent);
    entitled += amount;
    return { assignment: a, amount };
  });

  const paid = payouts.reduce((sum, p) => sum + p.amount, 0);
  const due = Math.max(0, entitled - paid);

  return { entitled, paid, due, payouts, dealEarnings };
}
