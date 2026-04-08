import { Skeleton } from "@shared/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-9 w-20 rounded-sm" />
        <Skeleton className="h-9 w-24 rounded-sm" />
        <Skeleton className="h-9 w-20 rounded-sm" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-sm" />
        ))}
      </div>
    </div>
  );
}
