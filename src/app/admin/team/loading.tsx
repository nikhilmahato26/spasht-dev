import { TablePageSkeleton } from "@/components/table-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-btn shrink-0" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6 bg-surface border border-border rounded-card p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 rounded-input" />
        ))}
      </div>
      <TablePageSkeleton columns={5} showHeader={false} showFilters={false} />
    </div>
  );
}
