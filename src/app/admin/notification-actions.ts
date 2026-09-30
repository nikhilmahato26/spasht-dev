"use server";

import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { sendPushToUsers } from "@/lib/push";

type SerializedSubscription = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

export async function savePushSubscription(sub: SerializedSubscription) {
  const user = await requireUser();

  const endpoint = String(sub?.endpoint ?? "");
  const p256dh = String(sub?.keys?.p256dh ?? "");
  const auth = String(sub?.keys?.auth ?? "");
  if (!endpoint.startsWith("https://") || !p256dh || !auth) {
    throw new Error("Invalid push subscription");
  }

  // An endpoint identifies one browser install; if someone else was logged in
  // on this device before, it now belongs to the current user.
  await db.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, p256dh, auth, userId: user.id },
    update: { p256dh, auth, userId: user.id },
  });
}

export async function removePushSubscription(endpoint: string) {
  const user = await requireUser();
  await db.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
}

export async function sendTestPush() {
  const user = await requireUser();
  await sendPushToUsers([user.id], {
    title: "Notifications are on",
    body: "You'll get alerts here for payouts and team activity.",
    url: "/admin",
    tag: "test",
  });
}
