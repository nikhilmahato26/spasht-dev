"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { rupeesToPaisa } from "@/lib/money";
import type { MemberType, Role } from "@/generated/prisma/client";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createMember(formData: FormData) {
  const admin = await requireAdmin();

  const name = str(formData, "name");
  const email = str(formData, "email");
  const password = str(formData, "password");
  const role = str(formData, "role") as Role;
  const type = str(formData, "type") as MemberType;

  if (!name || !email || !password) return;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);

  const member = await db.user.create({
    data: { name, email, passwordHash, role, type },
  });

  await logAudit({
    userId: admin.id,
    action: "user.create",
    entityType: "User",
    entityId: member.id,
  });

  revalidatePath("/admin/team");
}

export async function updateMember(userId: string, formData: FormData) {
  const admin = await requireAdmin();

  const role = str(formData, "role") as Role;
  const type = str(formData, "type") as MemberType;
  const isActive = formData.get("isActive") === "on";

  await db.user.update({
    where: { id: userId },
    data: { role, type, isActive },
  });

  await logAudit({
    userId: admin.id,
    action: "user.update",
    entityType: "User",
    entityId: userId,
  });

  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${userId}`);
}

export async function deleteMember(formData: FormData) {
  const admin = await requireAdmin();
  const userId = str(formData, "id");
  if (!userId) return;

  if (userId === admin.id) {
    redirect(`/admin/team/${userId}?error=self`);
  }

  const [assignmentCount, dealCount, payoutCount, auditCount] = await Promise.all([
    db.dealAssignment.count({ where: { userId } }),
    db.deal.count({ where: { OR: [{ createdById: userId }, { closedById: userId }] } }),
    db.payout.count({ where: { userId } }),
    db.auditLog.count({ where: { userId } }),
  ]);

  if (assignmentCount > 0 || dealCount > 0 || payoutCount > 0 || auditCount > 0) {
    redirect(`/admin/team/${userId}?error=has-history`);
  }

  await db.user.delete({ where: { id: userId } });
  await logAudit({
    userId: admin.id,
    action: "user.delete",
    entityType: "User",
    entityId: userId,
  });

  revalidatePath("/admin/team");
  redirect("/admin/team");
}

export async function recordPayout(userId: string, formData: FormData) {
  const admin = await requireAdmin();

  const amount = rupeesToPaisa(Number(formData.get("amount") ?? 0));
  if (!amount) return;

  const dealId = str(formData, "dealId") || null;

  await db.payout.create({
    data: {
      userId,
      dealId,
      amount,
      method: str(formData, "method") || null,
      note: str(formData, "note") || null,
    },
  });

  await logAudit({
    userId: admin.id,
    action: "payout.create",
    entityType: "User",
    entityId: userId,
  });

  revalidatePath(`/admin/team/${userId}`);
  revalidatePath("/admin/team");
  revalidatePath("/admin/my-payouts");
}
