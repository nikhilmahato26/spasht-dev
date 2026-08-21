import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-64 mt-2.5" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-btn" />
          <Skeleton className="h-9 w-28 rounded-btn" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-border rounded-card p-4">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="w-10 h-10 rounded-btn shrink-0" />
            </div>
            <Skeleton className="h-6 w-20 mt-1" />
            <Skeleton className="h-8 w-full mt-3" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-border rounded-card p-5">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-border rounded-card p-4">
              <Skeleton className="h-4 w-28 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
