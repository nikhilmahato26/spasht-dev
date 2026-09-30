import { db } from "@/lib/db";

// Deal, payout and audit rows reference the user without cascading, so a
// member with any of that history can only be deactivated, never deleted.
export async function memberHasHistory(userId: string) {
  const counts = await Promise.all([
    db.dealAssignment.count({ where: { userId } }),
    db.deal.count({ where: { OR: [{ createdById: userId }, { closedById: userId }] } }),
    db.payout.count({ where: { userId } }),
    db.sectionPayout.count({ where: { createdById: userId } }),
    db.auditLog.count({ where: { userId } }),
  ]);
  return counts.some((c) => c > 0);
}
