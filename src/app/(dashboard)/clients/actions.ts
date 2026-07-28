"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

function readClientFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    company: String(formData.get("company") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createClient(formData: FormData) {
  const user = await requireUser();
  const fields = readClientFields(formData);
  if (!fields.name) return;

  const client = await db.client.create({ data: fields });
  await logAudit({
    userId: user.id,
    action: "client.create",
    entityType: "Client",
    entityId: client.id,
  });
  redirect(`/clients/${client.id}`);
}

export async function updateClient(id: string, formData: FormData) {
  const user = await requireUser();
  const fields = readClientFields(formData);
  if (!fields.name) return;

  await db.client.update({ where: { id }, data: fields });
  await logAudit({
    userId: user.id,
    action: "client.update",
    entityType: "Client",
    entityId: id,
  });
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClient(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const dealCount = await db.deal.count({ where: { clientId: id } });
  if (dealCount > 0) {
    redirect(`/clients/${id}?error=has-deals`);
  }

  await db.client.delete({ where: { id } });
  await logAudit({
    userId: user.id,
    action: "client.delete",
    entityType: "Client",
    entityId: id,
  });
  revalidatePath("/clients");
  redirect("/clients");
}
