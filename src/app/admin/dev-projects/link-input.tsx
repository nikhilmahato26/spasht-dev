"use client";

import { useState, useTransition } from "react";
import { updateDealLink } from "./actions";
import { Check, Loader2 } from "lucide-react";

export function LinkInput({ dealId, initialLink }: { dealId: string; initialLink: string | null }) {
  const [link, setLink] = useState(initialLink || "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (link === (initialLink || "")) return;
    
    startTransition(async () => {
      try {
        await updateDealLink(dealId, link);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error("Failed to update link", err);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
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
        className="border border-border rounded-input px-2 py-1 text-sm bg-surface w-full max-w-[200px]"
        disabled={isPending}
      />
      {isPending && <Loader2 size={14} className="animate-spin text-text-muted" />}
      {saved && !isPending && <Check size={14} className="text-green-500" />}
    </div>
  );
}
