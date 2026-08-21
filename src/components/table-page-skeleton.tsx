import { Skeleton } from "@/components/ui/skeleton";

export function TablePageSkeleton({
  rows = 8,
  columns = 5,
  showHeader = true,
  showFilters = true,
  showAction = true,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showFilters?: boolean;
  showAction?: boolean;
}) {
  return (
    <div>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-btn shrink-0" />
            <Skeleton className="h-8 w-40" />
          </div>
          {showAction && <Skeleton className="h-10 w-32 rounded-btn" />}
        </div>
      )}

      {showFilters && (
        <div className="flex gap-2 mb-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-32 rounded-input" />
          ))}
        </div>
      )}

      <div className="border border-border rounded-card overflow-hidden">
        <div className="flex gap-6 px-4 py-2.5 border-b border-border">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-6 px-4 py-3 border-b border-border last:border-0">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className={c === 0 ? "h-4 w-32" : "h-4 w-16"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-border rounded-card p-3.5">
          <Skeleton className="h-3 w-20 mb-2.5" />
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  );
}
