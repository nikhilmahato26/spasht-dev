"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { formatPaisa, rupeesToPaisa } from "@/lib/money";
import { currentDeviceEndpoint, payoutRecipients, sendPushToUsers } from "@/lib/push";
import { capitalizeWords } from "@/lib/text";
import type { MemberType, Permission, Role } from "@/generated/prisma/client";
import { PERMISSION_KEYS } from "@/lib/permissions";
import { memberHasHistory } from "@/lib/team-data";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createMember(formData: FormData) {
  const admin = await requireAdmin();

  const name = capitalizeWords(str(formData, "name"));
  const email = str(formData, "email");
  const password = str(formData, "password");
  const role = str(formData, "role") as Role;
  const type = str(formData, "type") as MemberType;

  if (!name || !email || !password) return;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);

  const member = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      type,
      // Schema default covers everything else; Dev Projects stays opt-in for Marketing.
      ...(type === "DEV"
        ? { permissions: ["DEALS_VIEW", "DEALS_MANAGE", "CLIENTS_MANAGE", "CATEGORIES_MANAGE", "EXPENSES_VIEW", "DEV_PROJECTS"] satisfies Permission[] }
        : {}),
    },
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

  const name = capitalizeWords(str(formData, "name"));
  const email = str(formData, "email");
  const password = str(formData, "password");
  const role = str(formData, "role") as Role;
  const type = str(formData, "type") as MemberType;
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

  const dataToUpdate: {
    name?: string;
    email?: string;
    role?: Role;
    type?: MemberType;
    isActive: boolean;
    passwordHash?: string;
  } = {
    role,
    type,
    isActive,
  };

  if (name) {
    dataToUpdate.name = name;
  }

  if (email) {
    const existing = await db.user.findFirst({
      where: { email, id: { not: userId } },
    });
    if (!existing) {
      dataToUpdate.email = email;
    }
  }

  if (password && password.trim().length > 0) {
    dataToUpdate.passwordHash = await bcrypt.hash(password.trim(), 10);
  }

  await db.user.update({
    where: { id: userId },
    data: dataToUpdate,
  });

  await logAudit({
    userId: admin.id,
    action: "user.update",
    entityType: "User",
    entityId: userId,
    diff: {
      name: { old: null, new: dataToUpdate.name },
      email: { old: null, new: dataToUpdate.email },
      role: { old: null, new: role },
      type: { old: null, new: type },
      isActive: { old: null, new: isActive },
      passwordReset: { old: null, new: !!dataToUpdate.passwordHash },
    },
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

  if (await memberHasHistory(userId)) {
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

  const payout = await db.payout.create({
    include: { user: { select: { name: true } }, deal: { select: { projectName: true } } },
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

  const skipEndpoint = await currentDeviceEndpoint();
  after(async () => {
    const recipients = await payoutRecipients({ memberId: userId });
    const base = {
      title: `Payout to ${payout.user.name}: ${formatPaisa(amount)}`,
      body: `${payout.deal ? `${payout.deal.projectName}, r` : "R"}ecorded by ${admin.name}`,
      tag: `payout-${payout.id}`,
    };
    // The paid member lands on My Payouts; admins land on that member's page.
    await Promise.all([
      sendPushToUsers(recipients.filter((id) => id === userId), { ...base, url: "/admin/my-payouts" }, { skipEndpoint }),
      sendPushToUsers(recipients.filter((id) => id !== userId), { ...base, url: `/admin/team/${userId}` }, { skipEndpoint }),
    ]);
  });

  revalidatePath(`/admin/team/${userId}`);
  revalidatePath("/admin/team");
  revalidatePath("/admin/my-payouts");
  revalidatePath("/admin/client-payouts");
}


export type RemoveMemberResult = { ok: true } | { ok: false; error: string };

// Used by the team table's delete dialog. Unlike deleteMember it reports
// failures back to the dialog instead of redirecting.
export async function removeMember(userId: string): Promise<RemoveMemberResult> {
  const admin = await requireAdmin();

  if (userId === admin.id) return { ok: false, error: "You can't delete your own account." };
  if (await memberHasHistory(userId)) {
    return { ok: false, error: "This member has deal or payout history. Deactivate them instead." };
  }

  await db.user.delete({ where: { id: userId } });
  await logAudit({ userId: admin.id, action: "user.delete", entityType: "User", entityId: userId });

  revalidatePath("/admin/team");
  return { ok: true };
}

export async function deactivateMember(userId: string): Promise<RemoveMemberResult> {
  const admin = await requireAdmin();
  if (userId === admin.id) return { ok: false, error: "You can't deactivate your own account." };

  await db.user.update({ where: { id: userId }, data: { isActive: false } });
  await logAudit({
    userId: admin.id,
    action: "user.update",
    entityType: "User",
    entityId: userId,
    diff: { isActive: { old: true, new: false } },
  });

  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${userId}`);
  return { ok: true };
}

export async function setMemberPermission(userId: string, permission: Permission, enabled: boolean) {
  const admin = await requireAdmin();
  if (!PERMISSION_KEYS.includes(permission)) throw new Error("Unknown permission");

  const member = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, permissions: true },
  });
  if (!member) throw new Error("Member not found");
  if (member.role === "ADMIN") throw new Error("Admins always have every permission");

  const next = enabled
    ? Array.from(new Set([...member.permissions, permission]))
    : member.permissions.filter((p) => p !== permission);

  await db.user.update({ where: { id: userId }, data: { permissions: { set: next } } });
  await logAudit({
    userId: admin.id,
    action: "user.permission",
    entityType: "User",
    entityId: userId,
    diff: { [permission]: { old: !enabled, new: enabled } },
  });

  revalidatePath("/admin/team");
}
