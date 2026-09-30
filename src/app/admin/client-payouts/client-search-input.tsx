"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
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

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term.trim()) {
      params.set("q", term.trim());
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    startTransition(() => {
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  const currentVal = searchParams.get("q") ?? defaultValue;

  return (
    <div className="relative flex-1 max-w-md">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none"
      />
      <input
        type="text"
        placeholder={placeholder}
        defaultValue={currentVal}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full bg-surface border border-border rounded-input pl-10 pr-9 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-text-faint transition-colors"
      />
      {currentVal && (
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
