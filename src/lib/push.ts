import webpush from "web-push";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { MemberType } from "@/generated/prisma/client";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const configured = Boolean(publicKey && privateKey);

if (configured) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@spasht.dev", publicKey!, privateKey!);
}

// The bell stores this browser's push endpoint in a cookie, so a server
// action knows which device the actor is using right now.
export const PUSH_DEVICE_COOKIE = "push_endpoint";

export async function currentDeviceEndpoint() {
  return (await cookies()).get(PUSH_DEVICE_COOKIE)?.value;
}

// Sends to every device the given users enabled notifications on, except
// `skipEndpoint` (the device that performed the action — its user already
// sees the result on screen, but their other devices should still ping).
// Never throws: a failed push must not undo the action that triggered it.
export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload,
  { skipEndpoint }: { skipEndpoint?: string } = {}
) {
  if (!configured || userIds.length === 0) return;

  const subscriptions = await db.pushSubscription.findMany({
    where: {
      userId: { in: userIds },
      user: { isActive: true },
      ...(skipEndpoint ? { endpoint: { not: skipEndpoint } } : {}),
    },
  });

  const body = JSON.stringify(payload);
  const expired: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
          { TTL: 60 * 60 * 24 }
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        // 404/410: the browser dropped this subscription (permission revoked,
        // site data cleared, app uninstalled) — stop sending to it.
        if (status === 404 || status === 410) expired.push(sub.id);
        else console.error("[push] send failed", status, err);
      }
    })
  );

  if (expired.length > 0) {
    await db.pushSubscription.deleteMany({ where: { id: { in: expired } } });
  }
}

// Who hears about a payout: every admin, plus either the members of the paid
// section or the individual member paid.
export async function payoutRecipients({
  team,
  memberId,
}: {
  team?: MemberType;
  memberId?: string;
}) {
  const users = await db.user.findMany({
    where: {
      isActive: true,
      OR: [
        { role: "ADMIN" },
        ...(team ? [{ type: team }] : []),
        ...(memberId ? [{ id: memberId }] : []),
      ],
    },
    select: { id: true },
  });
  return users.map((u) => u.id);
}
