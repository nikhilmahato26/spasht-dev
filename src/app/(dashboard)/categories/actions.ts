"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function createCategory(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim() || null;
  if (!name) return;

  const category = await db.category.create({ data: { name, color } });
  await logAudit({
    userId: user.id,
    action: "category.create",
    entityType: "Category",
    entityId: category.id,
  });
  revalidatePath("/categories");
}

export async function deleteCategory(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.category.delete({ where: { id } });
  await logAudit({
    userId: user.id,
    action: "category.delete",
    entityType: "Category",
    entityId: id,
  });
  revalidatePath("/categories");
}
