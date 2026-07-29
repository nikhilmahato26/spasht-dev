import { db } from "@/lib/db";
import { computeDueMoney, computeDealSplit, computeAssignmentAmount } from "@/lib/deal-calc";

export type ScopeUser = { id: string; role: "ADMIN" | "MEMBER" };

export function dealScopeWhere(user: ScopeUser) {
  if (user.role === "ADMIN") return {};
  return {
    OR: [
      { createdById: user.id },
      { closedById: user.id },
      { assignments: { some: { userId: user.id } } },
    ],
  };
}

export function listDealsForUser(user: ScopeUser) {
  return db.deal.findMany({
    where: dealScopeWhere(user),
    include: { client: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getDealForUser(id: string, user: ScopeUser) {
  return db.deal.findFirst({
    where: { id, ...dealScopeWhere(user) },
    include: {
      client: true,
      category: true,
      payments: { orderBy: { date: "desc" } },
      costItems: { orderBy: { createdAt: "desc" } },
      assignments: { include: { user: true } },
      createdBy: true,
      closedBy: true,
    },
  });
}

export async function recalcDue(dealId: string, actorId?: string) {
  const deal = await db.deal.findUniqueOrThrow({
    where: { id: dealId },
    include: { payments: true },
  });
  const dueMoney = computeDueMoney(deal.totalPrice, deal.advanceReceived, deal.payments);

  // Fully collected, not already marked as such: bump status to PAID.
  // Never auto-revert PAID back to something else if due goes back up later
  // (e.g. a price edit) — that's a judgment call for a human to make.
  const shouldAutoMarkPaid = dueMoney === 0 && deal.totalPrice > 0 && deal.status !== "PAID";

  await db.deal.update({
    where: { id: dealId },
    data: {
      dueMoney,
      ...(shouldAutoMarkPaid ? { status: "PAID" } : {}),
    },
  });

  if (shouldAutoMarkPaid && actorId) {
    const dealWithAssignments = await db.deal.findUnique({
      where: { id: dealId },
      include: { assignments: true },
    });
    
    if (dealWithAssignments) {
      const split = computeDealSplit({
        totalPrice: dealWithAssignments.totalPrice,
        fixedCosts: dealWithAssignments.fixedCosts,
        marketingPercent: dealWithAssignments.marketingPercent,
        devPoolPercent: dealWithAssignments.devPoolPercent,
      });

      for (const a of dealWithAssignments.assignments) {
        const entitled = computeAssignmentAmount(split.netEarning, a.allocationPercent);
        const existingPayouts = await db.payout.aggregate({
          where: { userId: a.userId, dealId: a.dealId },
          _sum: { amount: true },
        });
        const paid = existingPayouts._sum.amount || 0;
        const left = entitled - paid;

        if (left > 0) {
          await db.payout.create({
            data: {
              userId: a.userId,
              dealId: a.dealId,
              amount: left,
              note: "Auto payout on full payment",
              method: "System Auto",
            },
          });
          await db.auditLog.create({
            data: {
              userId: actorId,
              action: "payout.create",
              entityType: "User",
              entityId: a.userId,
            }
          });
        }
      }
    }
  }

  return dueMoney;
}
