"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { rupeesToPaisa } from "@/lib/money";
import { recalcDue, getDealForUser } from "@/lib/deals-data";
import type { DealStatus } from "@/generated/prisma/client";

function num(formData: FormData, key: string): number {
  const raw = formData.get(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

async function readAssignments(formData: FormData) {
  const userIds = new Set<string>();
  for (const key of formData.keys()) {
    const match = key.match(/^assign_(.+)$/);
    if (match) userIds.add(match[1]);
  }

  return Array.from(userIds).map((userId) => ({
    userId,
    role: str(formData, `role_${userId}`) || null,
    allocationPercent: num(formData, `pct_${userId}`),
  }));
}

// allocationPercent is a direct share of net earning. A DEV assignee's %
// (with dev teammates) can't exceed devPoolPercent; a MARKETING assignee's %
// can't exceed marketingPercent — each type is capped at its own budget.
async function assignmentsWithinPoolLimits(
  assignments: { userId: string; allocationPercent: number }[],
  marketingPercent: number,
  devPoolPercent: number
): Promise<boolean> {
  if (assignments.length === 0) return true;

  const users = await db.user.findMany({
    where: { id: { in: assignments.map((a) => a.userId) } },
    select: { id: true, type: true },
  });
  const typeById = new Map(users.map((u) => [u.id, u.type]));

  const sums = { DEV: 0, MARKETING: 0 };
  for (const a of assignments) {
    const type = typeById.get(a.userId);
    if (!type) continue;
    sums[type] += a.allocationPercent;
  }

  // Allow a 2.0% tolerance to account for rounding errors when converting integer rupee amounts back to percentages
  const EPSILON = 2.0;
  return sums.DEV <= devPoolPercent + EPSILON && sums.MARKETING <= marketingPercent + EPSILON;
}

export async function createDeal(formData: FormData) {
  const user = await requireUser();

  const projectName = str(formData, "projectName");
  const link = str(formData, "link") || null;
  const categoryId = str(formData, "categoryId") || null;
  const totalPrice = rupeesToPaisa(num(formData, "totalPrice"));
  const fixedCosts = rupeesToPaisa(num(formData, "fixedCosts"));
  const marketingPercent = num(formData, "marketingPercent");
  const devPoolPercent = num(formData, "devPoolPercent");
  const advanceReceived = rupeesToPaisa(num(formData, "advanceReceived"));
  const status = str(formData, "status") as DealStatus;
  const closedById = str(formData, "closedById") || null;
  const clientId = str(formData, "clientId");

  if (!projectName || !totalPrice) return;

  const initialDueMoney = Math.max(0, totalPrice - advanceReceived);
  // Fully paid up front: same auto-mark-PAID rule as recalcDue applies here too.
  const resolvedStatus = initialDueMoney === 0 ? "PAID" : status;

  const assignments = await readAssignments(formData);
  if (!(await assignmentsWithinPoolLimits(assignments, marketingPercent, devPoolPercent))) {
    throw new Error("Assignments exceed pool limits");
  }

  const deal = await db.$transaction(async (tx) => {
    let resolvedClientId = clientId;

    if (!resolvedClientId) {
      const newClientName = str(formData, "newClientName");
      if (!newClientName) throw new Error("Client is required");

      const newClient = await tx.client.create({
        data: {
          name: newClientName,
          phone: str(formData, "newClientPhone") || null,
          email: str(formData, "newClientEmail") || null,
          company: str(formData, "newClientCompany") || null,
        },
      });
      resolvedClientId = newClient.id;
    }

    const created = await tx.deal.create({
      data: {
        clientId: resolvedClientId,
        projectName,
        link,
        categoryId,
        totalPrice,
        fixedCosts,
        marketingPercent,
        devPoolPercent,
        advanceReceived,
        dueMoney: initialDueMoney,
        status: resolvedStatus,
        closedById,
        createdById: user.id,
        assignments: {
          create: assignments.map((a) => ({
            userId: a.userId,
            role: a.role,
            allocationPercent: a.allocationPercent,
          })),
        },
      },
    });

    return created;
  }, { maxWait: 10_000, timeout: 20_000 });

  await recalcDue(deal.id, user.id);

  await logAudit({
    userId: user.id,
    action: "deal.create",
    entityType: "Deal",
    entityId: deal.id,
  });

  revalidatePath("/deals");
  redirect(`/deals/${deal.id}`);
}

export async function updateDeal(dealId: string, formData: FormData) {
  const user = await requireUser();

  const existing = await getDealForUser(dealId, user);
  if (!existing) return;
  const canEdit =
    user.role === "ADMIN" ||
    existing.createdById === user.id ||
    existing.closedById === user.id ||
    existing.assignments.some((a) => a.userId === user.id);
  if (!canEdit) return;

  const projectName = str(formData, "projectName");
  const link = str(formData, "link") || null;
  const categoryId = str(formData, "categoryId") || null;
  const totalPrice = rupeesToPaisa(num(formData, "totalPrice"));
  const fixedCosts = rupeesToPaisa(num(formData, "fixedCosts"));
  const marketingPercent = num(formData, "marketingPercent");
  const devPoolPercent = num(formData, "devPoolPercent");
  const advanceReceived = rupeesToPaisa(num(formData, "advanceReceived"));
  const status = str(formData, "status") as DealStatus;
  const closedById = str(formData, "closedById") || null;
  const assignments = await readAssignments(formData);
  if (!(await assignmentsWithinPoolLimits(assignments, marketingPercent, devPoolPercent))) {
    throw new Error("Assignments exceed pool limits");
  }

  // Optimistic locking: only applies if no one else updated the deal since this form loaded.
  await db.$transaction(async (tx) => {
    await tx.deal.updateMany({
      where: { id: dealId, version: existing.version },
      data: {
        projectName,
        link,
        categoryId,
        totalPrice,
        fixedCosts,
        marketingPercent,
        devPoolPercent,
        advanceReceived,
        status,
        closedById,
        version: { increment: 1 },
      },
    });

    await tx.dealAssignment.deleteMany({ where: { dealId } });
    if (assignments.length > 0) {
      await tx.dealAssignment.createMany({
        data: assignments.map((a) => ({
          dealId,
          userId: a.userId,
          role: a.role,
          allocationPercent: a.allocationPercent,
        })),
      });
    }
  }, { maxWait: 10_000, timeout: 20_000 });

  await recalcDue(dealId, user.id);

  await logAudit({
    userId: user.id,
    action: "deal.update",
    entityType: "Deal",
    entityId: dealId,
  });

  revalidatePath(`/deals/${dealId}`);
  redirect(`/deals/${dealId}`);
}

export async function deleteDeal(formData: FormData) {
  const user = await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;

  await db.deal.delete({ where: { id } });
  await logAudit({ userId: user.id, action: "deal.delete", entityType: "Deal", entityId: id });
  revalidatePath("/deals");
  redirect("/deals");
}

export async function addPayment(dealId: string, formData: FormData) {
  const user = await requireUser();
  const amount = rupeesToPaisa(num(formData, "amount"));
  if (!amount) return;

  await db.payment.create({
    data: {
      dealId,
      amount,
      method: str(formData, "method") || null,
      note: str(formData, "note") || null,
    },
  });

  await recalcDue(dealId, user.id);

  await logAudit({
    userId: user.id,
    action: "payment.create",
    entityType: "Deal",
    entityId: dealId,
  });

  revalidatePath(`/deals/${dealId}`);
}

export async function addCostItem(dealId: string, formData: FormData) {
  const user = await requireUser();
  const label = str(formData, "label");
  const amount = rupeesToPaisa(num(formData, "amount"));
  if (!label || !amount) return;

  await db.costItem.create({
    data: {
      dealId,
      label,
      amount,
      isRecurring: formData.get("isRecurring") === "on",
    },
  });

  await logAudit({
    userId: user.id,
    action: "costItem.create",
    entityType: "Deal",
    entityId: dealId,
  });

  revalidatePath(`/deals/${dealId}`);
}
