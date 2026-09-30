import { db } from "@/lib/db";
import { AUDIT_ACTION_LABELS, ENTITY_LINK_PREFIX } from "@/lib/audit-labels";
import { sendPushToUsers } from "@/lib/push";

// Payout actions send their own, more specific notification (see
// client-payouts/actions.ts and team/actions.ts) — don't double up.
const SKIP = new Set(["payout.create", "sectionPayout.create"]);

async function entityName(entityType: string, entityId: string): Promise<string | null> {
  switch (entityType) {
    case "Deal":
      return (await db.deal.findUnique({ where: { id: entityId }, select: { projectName: true } }))?.projectName ?? null;
    case "Client":
      return (await db.client.findUnique({ where: { id: entityId }, select: { name: true } }))?.name ?? null;
    case "User":
      return (await db.user.findUnique({ where: { id: entityId }, select: { name: true } }))?.name ?? null;
    case "Category":
      return (await db.category.findUnique({ where: { id: entityId }, select: { name: true } }))?.name ?? null;
    case "Expense": {
      const item = await db.costItem.findUnique({ where: { id: entityId }, select: { label: true } });
      if (item) return item.label;
      return (await db.expenseCategory.findUnique({ where: { id: entityId }, select: { name: true } }))?.name ?? null;
    }
    default:
      return null;
  }
}

// Every audited action pings all other active admins.
export async function notifyActivity(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
}) {
  if (SKIP.has(params.action)) return;

  const [actor, admins, name] = await Promise.all([
    db.user.findUnique({ where: { id: params.userId }, select: { name: true } }),
    db.user.findMany({
      where: { role: "ADMIN", isActive: true, id: { not: params.userId } },
      select: { id: true },
    }),
    entityName(params.entityType, params.entityId),
  ]);
  if (admins.length === 0) return;

  const label = AUDIT_ACTION_LABELS[params.action] ?? params.action;
  const prefix = ENTITY_LINK_PREFIX[params.entityType];
  const deleted = params.action.endsWith(".delete");

  await sendPushToUsers(
    admins.map((a) => a.id),
    {
      title: `${actor?.name ?? "Someone"} ${label}`,
      body: name ?? (deleted ? "Removed. See the activity log for details." : "Tap to view"),
      url: prefix && !deleted && name ? `/admin${prefix}/${params.entityId}` : "/admin/audit",
      tag: `activity-${params.action}-${params.entityId}`,
    }
  );
}
