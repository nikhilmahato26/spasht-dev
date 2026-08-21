"use client";

import { useState, useTransition } from "react";
import { updateDealLink, refreshDealPreview } from "./actions";
import { Check, Loader2, RotateCw, Image as ImageIcon } from "lucide-react";

export function LinkInput({
  dealId,
  initialLink,
  initialPreviewImage,
}: {
  dealId: string;
  initialLink: string | null;
  initialPreviewImage?: string | null;
}) {
  const [link, setLink] = useState(initialLink || "");
  const [hasPreview, setHasPreview] = useState(Boolean(initialPreviewImage));
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (link === (initialLink || "")) return;

    startTransition(async () => {
      try {
        await updateDealLink(dealId, link);
        setSaved(true);
        if (link.trim()) {
          setHasPreview(true);
        } else {
          setHasPreview(false);
        }
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error("Failed to update link", err);
      }
    });
  }

  function handleRefreshPreview() {
    if (!link.trim() || isPending || isRefreshing) return;

    startRefreshTransition(async () => {
      try {
        const res = await refreshDealPreview(dealId);
        if (res.success) {
          setHasPreview(true);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } catch (err) {
        console.error("Failed to refresh preview", err);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Enter domain (e.g. example.com)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="border border-border rounded-input px-2 py-1 pr-7 text-sm bg-surface w-full max-w-[200px]"
          disabled={isPending || isRefreshing}
        />
        {hasPreview && (
          <span
            title="Preview captured and saved to Cloudinary"
            className="absolute right-2 text-green-500/80 pointer-events-none"
          >
            <ImageIcon size={13} />
          </span>
        )}
      </div>

      {isPending && <Loader2 size={14} className="animate-spin text-text-muted" />}
      {saved && !isPending && !isRefreshing && <Check size={14} className="text-green-500" />}

      {link.trim() && !isPending && (
        <button
          type="button"
          onClick={handleRefreshPreview}
          disabled={isRefreshing}
          title="Re-capture screenshot and update Cloudinary"
          className="p-1 text-text-muted hover:text-text hover:bg-surface-2 rounded transition-colors disabled:opacity-50"
        >
          <RotateCw size={13} className={isRefreshing ? "animate-spin text-primary" : ""} />
        </button>
      )}
    </div>
  );
}
