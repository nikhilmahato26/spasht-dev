"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { rupeesToPaisa } from "@/lib/money";
import { getDealForUser } from "@/lib/deals-data";
import type { MemberType } from "@/generated/prisma/client";

function teamValue(formData: FormData): MemberType | null {
  const raw = String(formData.get("team") ?? "");
  return raw === "DEV" || raw === "MARKETING" ? raw : null;
}

// Deal-specific costs are added from the deal's own page (dealId is implicit
// there, via addCostItem in deals/actions.ts). This page — and this action —
// is for general, deal-less company overhead only.

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string): number {
  const parsed = Number(formData.get(key));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function createExpense(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") return;

  const expenseCategoryId = str(formData, "expenseCategoryId") || null;
  const team = teamValue(formData);
  const label = str(formData, "label");
  const amount = rupeesToPaisa(num(formData, "amount"));
  if (!label || !amount) return;

  const costItem = await db.costItem.create({
    data: {
      ...(expenseCategoryId ? { expenseCategoryId } : {}),
      ...(team ? { team } : {}),
      label,
      amount,
    },
  });

  await logAudit({
    userId: user.id,
    action: "costItem.create",
    entityType: "Expense",
    entityId: costItem.id,
  });

  revalidatePath("/admin/expenses");
}

export async function updateExpense(id: string, formData: FormData) {
  const user = await requireUser();

  const existing = await db.costItem.findUnique({ where: { id } });
  if (!existing) return;

  if (existing.dealId) {
    const deal = await getDealForUser(existing.dealId, user);
    if (!deal) return;
  } else if (user.role !== "ADMIN") {
    return;
  }

  const expenseCategoryId = str(formData, "expenseCategoryId") || null;
  const team = teamValue(formData);
  const label = str(formData, "label");
  const amount = rupeesToPaisa(num(formData, "amount"));
  if (!label || !amount) return;

  await db.costItem.update({
    where: { id },
    data: {
      label,
      amount,
      expenseCategoryId: existing.dealId ? undefined : expenseCategoryId,
      team,
    },
  });

  await logAudit({
    userId: user.id,
    action: "costItem.update",
    entityType: existing.dealId ? "Deal" : "Expense",
    entityId: existing.dealId ?? id,
  });

  revalidatePath("/admin/expenses");
  if (existing.dealId) revalidatePath(`/admin/deals/${existing.dealId}`);
}

export async function deleteExpense(formData: FormData) {
  const user = await requireUser();
  const id = str(formData, "id");
  if (!id) return;

  const existing = await db.costItem.findUnique({ where: { id } });
  if (!existing) return;

  if (existing.dealId) {
    const deal = await getDealForUser(existing.dealId, user);
    if (!deal) return;
  } else if (user.role !== "ADMIN") {
    return;
  }

  await db.costItem.delete({ where: { id } });

  await logAudit({
    userId: user.id,
    action: "costItem.delete",
    entityType: existing.dealId ? "Deal" : "Expense",
    entityId: existing.dealId ?? id,
  });

  revalidatePath("/admin/expenses");
  if (existing.dealId) revalidatePath(`/admin/deals/${existing.dealId}`);
}

export async function createExpenseCategory(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") return;

  const name = str(formData, "name");
  if (!name) return;

  const category = await db.expenseCategory.upsert({
    where: { name },
    create: { name },
    update: {},
  });

  await logAudit({
    userId: user.id,
    action: "expenseCategory.create",
    entityType: "Expense",
    entityId: category.id,
  });

  revalidatePath("/admin/expenses");
}
