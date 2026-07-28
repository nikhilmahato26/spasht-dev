import { db } from "@/lib/db";
import { computeDueMoney } from "@/lib/deal-calc";

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

export async function recalcDue(dealId: string) {
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

  return dueMoney;
}
