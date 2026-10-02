"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";

export function ClientSearchInput({
  defaultValue = "",
  placeholder = "Search clients by name, company, email or phone...",
}: {
  defaultValue?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  // Local value: the ledger page mounts one input per tab, and ?q only
  // belongs to whichever tab is active.
  const [value, setValue] = useState(defaultValue);

  const handleSearch = (term: string) => {
    setValue(term);
    const params = new URLSearchParams(searchParams.toString());
    if (term.trim()) {
      params.set("q", term.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  return (
    <div className="relative flex-1 max-w-md">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full bg-surface border border-border rounded-input pl-10 pr-9 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-text-faint transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          title="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-0.5 rounded transition-colors"
        >
          <X size={15} />
        </button>
      )}
      {isPending && (
        <div className="absolute right-9 top-1/2 -translate-y-1/2">
          <div className="w-3.5 h-3.5 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
