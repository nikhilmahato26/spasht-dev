"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { revalidatePath } from "next/cache";

export async function updateDealLink(dealId: string, link: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.type !== "DEV") {
    throw new Error("Unauthorized");
  }

  // Ensure link starts with http or https if not empty
  let formattedLink = link.trim();
  if (formattedLink && !/^https?:\/\//i.test(formattedLink)) {
    formattedLink = `https://${formattedLink}`;
  }

  await db.deal.update({
    where: { id: dealId },
    data: { link: formattedLink || null },
  });

  revalidatePath("/admin/dev-projects");
  revalidatePath("/");
  return { success: true };
}
