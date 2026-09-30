"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 15, 20, 25, 50, 100],
  itemLabel = "entries",
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const navigateTo = (page: number, newPageSize?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const targetPage = Math.max(1, Math.min(page, Math.max(1, totalPages)));
    params.set("page", String(targetPage));
    if (newPageSize) {
      params.set("pageSize", String(newPageSize));
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-bg/50 border-t border-border text-xs text-text-muted">
      {/* Range Info */}
      <div className="flex items-center gap-2 font-mono text-2xs sm:text-xs">
        <span>
          Showing <strong className="font-semibold text-text">{startItem}</strong>–
          <strong className="font-semibold text-text">{endItem}</strong> of{" "}
          <strong className="font-semibold text-text">{totalItems}</strong> {itemLabel}
        </span>
        {isPending && (
          <span className="w-3 h-3 border-2 border-text-muted border-t-transparent rounded-full animate-spin ml-1" />
        )}
      </div>

      {/* Controls Container */}
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
        {/* Page Size Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-2xs text-text-faint hidden xs:inline">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              navigateTo(1, newSize);
            }}
            className="bg-surface border border-border rounded-input px-2 py-1 text-xs text-text font-mono focus:outline-none focus:border-text-faint cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / page
              </option>
            ))}
          </select>
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            onClick={() => navigateTo(1)}
            disabled={currentPage <= 1 || isPending}
            title="First page"
            className="p-1.5 rounded border border-border bg-surface text-text hover:bg-bg disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft size={14} />
          </button>

          {/* Prev Page */}
          <button
            type="button"
            onClick={() => navigateTo(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
            title="Previous page"
            className="p-1.5 rounded border border-border bg-surface text-text hover:bg-bg disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 mx-0.5">
            {getPageNumbers().map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1.5 py-1 text-2xs text-text-faint font-mono select-none"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = p as number;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => navigateTo(pageNum)}
                  disabled={isPending}
                  className={cn(
                    "min-w-7 h-7 px-1.5 text-xs font-mono rounded transition-colors flex items-center justify-center font-medium",
                    isActive
                      ? "bg-text text-bg font-bold shadow-sm"
                      : "border border-border bg-surface text-text-muted hover:text-text hover:bg-bg"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => navigateTo(currentPage + 1)}
            disabled={currentPage >= totalPages || isPending}
            title="Next page"
            className="p-1.5 rounded border border-border bg-surface text-text hover:bg-bg disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => navigateTo(totalPages)}
            disabled={currentPage >= totalPages || isPending}
            title="Last page"
            className="p-1.5 rounded border border-border bg-surface text-text hover:bg-bg disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
