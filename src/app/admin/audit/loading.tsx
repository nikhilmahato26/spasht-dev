import { TablePageSkeleton } from "@/components/table-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLoading() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-btn shrink-0" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex gap-2 mb-5">
        <Skeleton className="h-9 w-40 rounded-input" />
        <Skeleton className="h-9 w-20 rounded-btn" />
      </div>
      <TablePageSkeleton columns={4} rows={10} showHeader={false} showFilters={false} />
    </div>
  );
}
