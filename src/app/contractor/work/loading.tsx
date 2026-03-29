import { Skeleton } from "@shared/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-9 w-24 rounded-none" />
        <Skeleton className="h-9 w-24 rounded-none" />
        <Skeleton className="h-9 w-24 rounded-none" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-none" />
        ))}
      </div>
    </div>
  );
}
