"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { rupeesToPaisa } from "@/lib/money";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string): number {
  const raw = formData.get(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function recordClientTeamPayout(formData: FormData) {
  const admin = await requireAdmin();

  const clientId = str(formData, "clientId");
  const dealId = str(formData, "dealId") || null;
  const userId = str(formData, "userId");
  const rawAmount = num(formData, "amount");
  const amount = rupeesToPaisa(rawAmount);
  const method = str(formData, "method") || "Bank Transfer";
  const note = str(formData, "note") || null;
  const rawDate = str(formData, "date");
  const date = rawDate ? new Date(rawDate) : new Date();

  if (!userId || !amount || amount <= 0) {
    throw new Error("Invalid team member or payout amount");
  }

  // Verify the target user exists
  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, type: true },
  });

  if (!targetUser) {
    throw new Error("Target team member not found");
  }

  // Create Payout
  const payout = await db.payout.create({
    data: {
      userId,
      dealId,
      amount,
      method,
      note,
      date,
    },
  });

  // Log authoritative audit trail
  await logAudit({
    userId: admin.id,
    action: "payout.create",
    entityType: "Payout",
    entityId: payout.id,
    diff: {
      amount: { old: null, new: amount },
      recipient: { old: null, new: `${targetUser.name} (${targetUser.type})` },
      dealId: { old: null, new: dealId },
      method: { old: null, new: method },
      note: { old: null, new: note },
    },
  });

  if (clientId) {
    revalidatePath(`/admin/client-payouts/${clientId}`);
  }
  revalidatePath("/admin/client-payouts");
  if (dealId) {
    revalidatePath(`/admin/deals/${dealId}`);
  }
  revalidatePath(`/admin/team/${userId}`);
  revalidatePath("/admin/my-payouts");
  revalidatePath("/admin/team");
}
