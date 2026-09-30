"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requirePermission } from "@/lib/dal";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { formatPaisa, rupeesToPaisa } from "@/lib/money";
import { payoutRecipients, sendPushToUsers } from "@/lib/push";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string): number {
  const raw = formData.get(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function recordSectionPayout(formData: FormData) {
  const admin = await requirePermission("PAYOUTS_MANAGE");

  const clientId = str(formData, "clientId");
  const dealId = str(formData, "dealId");
  const team = str(formData, "team");
  const rawAmount = num(formData, "amount");
  const amount = rupeesToPaisa(rawAmount);
  const method = str(formData, "method") || "Bank Transfer";
  const note = str(formData, "note") || null;
  const rawDate = str(formData, "date");
  const date = rawDate ? new Date(rawDate) : new Date();

  if (team !== "DEV" && team !== "MARKETING") {
    throw new Error("Choose either the Dev or Marketing section");
  }
  if (!amount || amount <= 0) {
    throw new Error("Invalid payout amount");
  }

  // The deal must belong to the client whose workspace this came from
  const deal = await db.deal.findFirst({
    where: { id: dealId, ...(clientId ? { clientId } : {}) },
    select: { id: true, projectName: true, client: { select: { name: true } } },
  });
  if (!deal) {
    throw new Error("Deal not found for this client");
  }

  const payout = await db.sectionPayout.create({
    data: {
      dealId,
      team,
      amount,
      method,
      note,
      date,
      createdById: admin.id,
    },
  });

  await logAudit({
    userId: admin.id,
    action: "sectionPayout.create",
    entityType: "SectionPayout",
    entityId: payout.id,
    diff: {
      amount: { old: null, new: amount },
      team: { old: null, new: team },
      dealId: { old: null, new: dealId },
      method: { old: null, new: method },
      note: { old: null, new: note },
    },
  });

  after(async () => {
    const section = team === "DEV" ? "Dev" : "Marketing";
    await sendPushToUsers(await payoutRecipients({ actorId: admin.id, team }), {
      title: `${section} payout: ${formatPaisa(amount)}`,
      body: `${deal.client.name} / ${deal.projectName}, recorded by ${admin.name}`,
      url: clientId ? `/admin/client-payouts/${clientId}` : "/admin/client-payouts?tab=payouts",
      tag: `section-payout-${payout.id}`,
    });
  });

  if (clientId) {
    revalidatePath(`/admin/client-payouts/${clientId}`);
  }
  revalidatePath("/admin/client-payouts");
  revalidatePath(`/admin/deals/${dealId}`);
}
