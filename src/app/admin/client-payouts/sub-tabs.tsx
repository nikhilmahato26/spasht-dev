import Link from "next/link";
import { Building2, Receipt, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubTabsProps {
  activeTab: "clients" | "payouts";
  clientsCount: number;
  payoutsCount: number;
  searchQuery?: string;
}

export function ClientPayoutsSubTabs({
  activeTab,
  clientsCount,
  payoutsCount,
  searchQuery,
}: SubTabsProps) {
  const querySuffix = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : "";

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5 border-b border-border pb-3">
      {/* Segmented Tab Buttons */}
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/client-payouts?tab=clients${querySuffix}`}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-btn text-xs font-medium transition-all cursor-pointer",
            activeTab === "clients"
              ? "bg-text text-bg shadow-sm"
              : "bg-surface text-text-muted hover:text-text border border-border hover:border-text-faint"
          )}
        >
          <Building2 size={14} />
          <span>Clients Directory</span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
              activeTab === "clients" ? "bg-bg/25 text-bg" : "bg-border/60 text-text-faint"
            )}
          >
            {clientsCount}
          </span>
        </Link>

        <Link
          href={`/admin/client-payouts?tab=payouts${querySuffix}`}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-btn text-xs font-medium transition-all cursor-pointer",
            activeTab === "payouts"
              ? "bg-text text-bg shadow-sm"
              : "bg-surface text-text-muted hover:text-text border border-border hover:border-text-faint"
          )}
        >
          <Receipt size={14} />
          <span>All Payouts Ledger</span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
              activeTab === "payouts" ? "bg-bg/25 text-bg" : "bg-border/60 text-text-faint"
            )}
          >
            {payoutsCount}
          </span>
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
        </Link>
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
            Select &quot;Ledger & Payouts&quot; to review client tree and disburse funds
          </span>
        )}
      </div>
    </div>
  );
}
