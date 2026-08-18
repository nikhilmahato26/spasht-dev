"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { rupeesToPaisa } from "@/lib/money";
import { getDealForUser } from "@/lib/deals-data";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string): number {
  const parsed = Number(formData.get(key));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function createExpense(formData: FormData) {
  const user = await requireUser();

  const dealId = str(formData, "dealId") || null;
  const label = str(formData, "label");
  const amount = rupeesToPaisa(num(formData, "amount"));
  if (!label || !amount) return;

  if (dealId) {
    // Scoped the same way editing a deal is — can't log an expense against
    // a deal you can't see.
    const deal = await getDealForUser(dealId, user);
    if (!deal) return;
  } else if (user.role !== "ADMIN") {
    // General company overhead, not tied to any deal — admin only, same as
    // the rest of the company-wide financial view.
    return;
  }

  const costItem = await db.costItem.create({
    data: {
      // Omit entirely rather than passing `dealId: null` — Prisma's
      // relation-checked create input wants the FK left unset, not nulled.
      ...(dealId ? { dealId } : {}),
      label,
      amount,
      isRecurring: formData.get("isRecurring") === "on",
    },
  });

  await logAudit({
    userId: user.id,
    action: "costItem.create",
    entityType: dealId ? "Deal" : "Expense",
    entityId: dealId ?? costItem.id,
  });

  revalidatePath("/admin/expenses");
  if (dealId) revalidatePath(`/admin/deals/${dealId}`);
}
