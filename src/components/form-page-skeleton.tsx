import { Skeleton } from "@/components/ui/skeleton";

export function FormPageSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-btn shrink-0" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="bg-surface border border-border rounded-card p-6 space-y-5 max-w-2xl">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-input" />
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-btn" />
      </div>
    </div>
  );
}
