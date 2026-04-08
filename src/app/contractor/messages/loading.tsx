import { Skeleton } from "@shared/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-80 border-r border-border p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-sm shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4 rounded-sm" />
          <Skeleton className="h-12 w-1/2 rounded-sm ml-auto" />
          <Skeleton className="h-12 w-2/3 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
