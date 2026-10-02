import Link from "next/link";
import { CheckCircle2, Hourglass } from "lucide-react";
import { formatPaisa } from "@/lib/money";

export type CollectionItem = {
  id: string;
  projectName: string;
  clientName: string;
  statusLabel: string;
  due: number;
  total: number;
  // Days since money last came in (last payment, or deal creation if none).
  daysWaiting: number;
  href: string | null;
};

// Aging buckets, keyed off days since the last payment.
const BUCKETS = [
  { key: "fresh", label: "Under 15d", max: 14, bar: "bg-accent", badge: "bg-accent-soft text-accent" },
  { key: "aging", label: "15–30d", max: 30, bar: "bg-pending", badge: "bg-pending-soft text-pending" },
  { key: "overdue", label: "30d+", max: Infinity, bar: "bg-cost", badge: "bg-cost-soft text-cost" },
] as const;

function bucketFor(days: number) {
  return BUCKETS.find((b) => days <= b.max)!;
}

export function CollectionsList({
  items,
  totalDue,
  dealCount,
  viewAllHref,
  limit = 6,
}: {
  items: CollectionItem[];
  totalDue: number;
  dealCount: number;
  viewAllHref: string | null;
  limit?: number;
}) {
  const byBucket = BUCKETS.map((b) => ({
    ...b,
    amount: items.filter((i) => bucketFor(i.daysWaiting).key === b.key).reduce((s, i) => s + i.due, 0),
  }));
  const shown = items.slice(0, limit);

  return (
    <div className="flex flex-col flex-1 min-h-0 border-t border-border mt-5 pt-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="flex items-center gap-2 text-lg font-semibold">
            <Hourglass size={16} className="text-pending" />
            Collections
          </p>
          <p className="text-sm text-text-muted mt-0.5">
            {dealCount > 0 ? (
              <>
                <span className="font-mono font-semibold text-text">{formatPaisa(totalDue)}</span> still to
                come in across {dealCount} deal{dealCount === 1 ? "" : "s"}
              </>
            ) : (
              "Money still to come in from clients"
            )}
          </p>
        </div>
        {viewAllHref && dealCount > 0 && (
          <Link href={viewAllHref} className="text-sm text-dev hover:underline shrink-0 mt-1">
            View all
          </Link>
        )}
      </div>

      {dealCount === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 rounded-card border border-dashed border-border">
          <CheckCircle2 size={28} className="text-accent mb-2" />
          <p className="font-medium">All caught up</p>
          <p className="text-sm text-text-faint">Every deal is fully collected.</p>
        </div>
      ) : (
        <>
          {/* Aging split of the outstanding amount */}
          <div className="mb-4">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-2 gap-0.5">
              {byBucket
                .filter((b) => b.amount > 0)
                .map((b) => (
                  <div
                    key={b.key}
                    className={`${b.bar} h-full first:rounded-l-full last:rounded-r-full`}
                    style={{ width: `${(b.amount / totalDue) * 100}%` }}
                    title={`${b.label}: ${formatPaisa(b.amount)}`}
                  />
                ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
              {byBucket.map((b) => (
                <span key={b.key} className="flex items-center gap-1.5 text-xs text-text-muted">
                  <span className={`w-2 h-2 rounded-full ${b.bar}`} />
                  {b.label}
                  <span className="font-mono text-text">{formatPaisa(b.amount)}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col -mx-2">
            {shown.map((item) => {
              const bucket = bucketFor(item.daysWaiting);
              const collected = item.total > 0 ? Math.round(((item.total - item.due) / item.total) * 100) : 0;
              const row = (
                <>
                  <div
                    className={`w-11 h-11 rounded-btn flex flex-col items-center justify-center shrink-0 leading-none ${bucket.badge}`}
                    title={`${item.daysWaiting} days since last payment`}
                  >
                    <span className="font-mono text-sm font-semibold">{item.daysWaiting}</span>
                    <span className="text-[9px] uppercase tracking-label mt-0.5 opacity-80">days</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{item.projectName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1 flex-1 max-w-40 rounded-full bg-surface-2 overflow-hidden">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${collected}%` }} />
                      </div>
                      <span className="text-2xs text-text-faint whitespace-nowrap truncate">
                        {collected}% collected · {item.clientName} · {item.statusLabel}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-semibold">{formatPaisa(item.due)}</p>
                    <p className="text-2xs text-text-faint font-mono">of {formatPaisa(item.total)}</p>
                  </div>
                </>
              );
              const className = "flex items-center gap-3 px-2 py-2.5 rounded-btn";
              return item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`${className} hover:bg-surface-2 transition-colors`}
                >
                  {row}
                </Link>
              ) : (
                <div key={item.id} className={className}>
                  {row}
                </div>
              );
            })}
          </div>

          {items.length > shown.length && (
            <p className="text-xs text-text-faint mt-2 px-0.5">
              +{items.length - shown.length} more deal{items.length - shown.length === 1 ? "" : "s"} with dues
            </p>
          )}
        </>
      )}
    </div>
  );
}
