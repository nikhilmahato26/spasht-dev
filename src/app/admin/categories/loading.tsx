import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-btn shrink-0" />
        <Skeleton className="h-8 w-36" />
      </div>
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-10 flex-1 rounded-input" />
        <Skeleton className="h-10 w-11 rounded-input" />
        <Skeleton className="h-10 w-16 rounded-btn" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[52px] rounded-card" />
        ))}
      </div>
    </div>
  );
}
