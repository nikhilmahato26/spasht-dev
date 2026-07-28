import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export async function logAudit(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  diff?: Record<string, { old: unknown; new: unknown }>;
}) {
  await db.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      diff: params.diff as Prisma.InputJsonValue | undefined,
    },
  });
}
