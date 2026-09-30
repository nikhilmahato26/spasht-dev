"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff, BellRing, Share, SquarePlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  removePushSubscription,
  savePushSubscription,
  sendTestPush,
} from "@/app/admin/notification-actions";

type Status = "loading" | "unsupported" | "ios-install" | "denied" | "off" | "on";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

const COPY: Record<Status, { title: string; body: string }> = {
  loading: { title: "Notifications", body: "Checking this browser..." },
  unsupported: {
    title: "Not available here",
    body: "This browser can't receive push notifications. Try Chrome on desktop or Android.",
  },
  "ios-install": {
    title: "Add Spasht to your Home Screen",
    body: "On iPhone, notifications only work from the installed app.",
  },
  denied: {
    title: "Notifications are blocked",
    body: "Allow notifications for this site in your browser settings, then reload.",
  },
  off: {
    title: "Payout alerts are off",
    body: "Get a notification on this device whenever a payout is recorded.",
  },
  on: {
    title: "Payout alerts are on",
    body: "This device gets a notification whenever a payout is recorded.",
  },
};

export function NotificationBell() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!supported) {
        if (!cancelled) setStatus(isIOS() && !isStandalone() ? "ios-install" : "unsupported");
        return;
      }
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        if (!cancelled) setStatus("unsupported");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const existing = await registration.pushManager.getSubscription();

      if (existing) {
        // Re-link on every visit so a shared device follows whoever is logged in.
        await savePushSubscription(JSON.parse(JSON.stringify(existing))).catch(() => {});
      }
      if (cancelled) return;
      if (Notification.permission === "denied") setStatus("denied");
      else setStatus(existing ? "on" : "off");
    })().catch(() => {
      if (!cancelled) setStatus("unsupported");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const turnOn = () =>
    startTransition(async () => {
      setError(null);
      setNotice(null);
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setStatus(permission === "denied" ? "denied" : "off");
          return;
        }
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });
        await savePushSubscription(JSON.parse(JSON.stringify(sub)));
        setStatus("on");
      } catch {
        setError("Couldn't turn on notifications. Please try again.");
      }
    });

  const turnOff = () =>
    startTransition(async () => {
      setError(null);
      setNotice(null);
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await removePushSubscription(sub.endpoint);
          await sub.unsubscribe();
        }
        setStatus("off");
      } catch {
        setError("Couldn't turn off notifications. Please try again.");
      }
    });

  const test = () =>
    startTransition(async () => {
      setError(null);
      try {
        await sendTestPush();
        setNotice("Test sent. It should appear in a few seconds.");
      } catch {
        setError("Couldn't send a test notification.");
      }
    });

  const Icon = status === "on" ? BellRing : status === "denied" ? BellOff : Bell;
  const copy = COPY[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={copy.title}
          aria-label={copy.title}
          className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
            status === "on"
              ? "border-accent/40 bg-accent-soft text-accent"
              : "border-border text-text-muted hover:text-text hover:border-text-faint"
          }`}
        >
          <Icon size={16} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-72 p-0">
        <div className="px-4 pt-3.5 pb-3">
          <p className="text-sm font-semibold text-text">{copy.title}</p>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">{copy.body}</p>

          {status === "ios-install" && (
            <ol className="mt-3 space-y-2 text-xs text-text">
              <li className="flex items-center gap-2">
                <Share size={14} className="text-text-muted shrink-0" />
                Tap Share in Safari
              </li>
              <li className="flex items-center gap-2">
                <SquarePlus size={14} className="text-text-muted shrink-0" />
                Choose Add to Home Screen, then open Spasht from there
              </li>
            </ol>
          )}

          {error && <p className="mt-2.5 text-xs text-danger">{error}</p>}
          {notice && <p className="mt-2.5 text-xs text-accent">{notice}</p>}
        </div>

        {(status === "off" || status === "on") && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <div className="p-1.5">
              {status === "off" ? (
                <DropdownMenuItem
                  disabled={isPending}
                  onSelect={(e) => {
                    e.preventDefault();
                    turnOn();
                  }}
                  className="font-medium"
                >
                  <BellRing size={14} />
                  {isPending ? "Turning on..." : "Turn on notifications"}
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    disabled={isPending}
                    onSelect={(e) => {
                      e.preventDefault();
                      test();
                    }}
                  >
                    <Bell size={14} />
                    Send a test notification
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={isPending}
                    onSelect={(e) => {
                      e.preventDefault();
                      turnOff();
                    }}
                    className="text-text-muted"
                  >
                    <BellOff size={14} />
                    Turn off on this device
                  </DropdownMenuItem>
                </>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
