"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/dal";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { capitalizeWords } from "@/lib/text";

export async function createCategory(formData: FormData) {
  const user = await requirePermission("CATEGORIES_MANAGE");
  const name = capitalizeWords(String(formData.get("name") ?? "").trim());
  const color = String(formData.get("color") ?? "").trim() || null;
  if (!name) return;

  const category = await db.category.create({ data: { name, color } });
  await logAudit({
    userId: user.id,
    action: "category.create",
    entityType: "Category",
    entityId: category.id,
  });
  revalidatePath("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const user = await requirePermission("CATEGORIES_MANAGE");
  const name = capitalizeWords(String(formData.get("name") ?? "").trim());
  const color = String(formData.get("color") ?? "").trim() || null;
  if (!name) return;

  await db.category.update({ where: { id }, data: { name, color } });
  await logAudit({
    userId: user.id,
    action: "category.update",
    entityType: "Category",
    entityId: id,
  });
  revalidatePath("/admin/categories");
  revalidatePath("/admin");
}

export async function deleteCategory(formData: FormData) {
  const user = await requirePermission("CATEGORIES_MANAGE");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.category.delete({ where: { id } });
  await logAudit({
    userId: user.id,
    action: "category.delete",
    entityType: "Category",
    entityId: id,
  });
  revalidatePath("/admin/categories");
}
