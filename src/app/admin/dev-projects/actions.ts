"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { uploadWebsitePreview, deleteWebsitePreview } from "@/lib/cloudinary";

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

  if (formattedLink) {
    // 1. Update link first
    await db.deal.update({
      where: { id: dealId },
      data: { link: formattedLink },
    });

    // 2. Fetch and upload one-time compressed preview to Cloudinary (~25-35KB)
    try {
      const previewUrl = await uploadWebsitePreview(formattedLink, dealId);
      if (previewUrl) {
        await db.deal.update({
          where: { id: dealId },
          data: { previewImage: previewUrl },
        });
      }
    } catch (err) {
      console.error("[updateDealLink] Failed to capture Cloudinary preview:", err);
    }
  } else {
    // Link removed: clean up preview
    await deleteWebsitePreview(dealId);
    await db.deal.update({
      where: { id: dealId },
      data: { link: null, previewImage: null },
    });
  }

  revalidatePath("/admin/dev-projects");
  revalidatePath("/");
  return { success: true };
}

export async function refreshDealPreview(dealId: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.type !== "DEV") {
    throw new Error("Unauthorized");
  }

  const deal = await db.deal.findUnique({
    where: { id: dealId },
    select: { link: true },
  });

  if (!deal?.link) {
    return { success: false, error: "No domain link set for this project." };
  }

  const previewUrl = await uploadWebsitePreview(deal.link, dealId);
  if (previewUrl) {
    await db.deal.update({
      where: { id: dealId },
      data: { previewImage: previewUrl },
    });
  }

  revalidatePath("/admin/dev-projects");
  revalidatePath("/");
  return { success: true, previewUrl };
}
