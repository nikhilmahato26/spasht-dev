"use client";

import { useSearchParams } from "next/navigation";
import { Building2, Receipt, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "clients" | "payouts";

interface SubTabsProps {
  // The tab (and query string) the server rendered with. Only that panel
  // reflects ?q / ?page; the other one is rendered with defaults.
  serverActiveTab: Tab;
  serverSearch: string;
  clientsCount: number;
  payoutsCount: number;
  clientsPanel: React.ReactNode;
  payoutsPanel: React.ReactNode;
}

// Both panels are server-rendered up front, so switching tabs just flips
// visibility and shallow-updates the URL (no server round-trip).
export function ClientPayoutsTabs({
  serverActiveTab,
  serverSearch,
  clientsCount,
  payoutsCount,
  clientsPanel,
  payoutsPanel,
}: SubTabsProps) {
  const searchParams = useSearchParams();
  const activeTab: Tab = searchParams.get("tab") === "payouts" ? "payouts" : "clients";

  const switchTo = (tab: Tab) => {
    if (tab === activeTab) return;
    // Restore the exact query the panel was rendered with, so the URL keeps
    // matching what's on screen.
    const query = tab === serverActiveTab ? serverSearch : `tab=${tab}`;
    window.history.pushState(null, "", `?${query}`);
  };

  const tabClass = (tab: Tab) =>
    cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-btn text-xs font-medium transition-all cursor-pointer",
      activeTab === tab
        ? "bg-text text-bg shadow-sm"
        : "bg-surface text-text-muted hover:text-text border border-border hover:border-text-faint"
    );

  const countClass = (tab: Tab) =>
    cn(
      "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
      activeTab === tab ? "bg-bg/25 text-bg" : "bg-border/60 text-text-faint"
    );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5 border-b border-border pb-3">
        {/* Segmented Tab Buttons */}
        <div className="flex items-center gap-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "clients"}
            onClick={() => switchTo("clients")}
            className={tabClass("clients")}
          >
            <Building2 size={14} />
            <span>Clients</span>
            <span className={countClass("clients")}>{clientsCount}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "payouts"}
            onClick={() => switchTo("payouts")}
            className={tabClass("payouts")}
          >
            <Receipt size={14} />
            <span>All Payouts</span>
            <span className={countClass("payouts")}>{payoutsCount}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded",
                activeTab === "payouts"
                  ? "bg-bg/20 text-emerald-300 font-semibold"
                  : "bg-emerald-500/10 text-emerald-500"
              )}
            >
              <Lock size={10} />
              <span>Immutable</span>
            </span>
          </button>
        </div>

        {/* Info indicator */}
        <div className="text-xs text-text-muted flex items-center gap-2">
          {activeTab === "payouts" ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Audit Stream • Auto-Populated
            </span>
          ) : (
            <span className="text-text-faint text-xs">
              Open a client&apos;s ledger to review its transaction tree and disburse funds
            </span>
          )}
        </div>
      </div>

      <div hidden={activeTab !== "clients"}>{clientsPanel}</div>
      <div hidden={activeTab !== "payouts"}>{payoutsPanel}</div>
    </>
  );
}
