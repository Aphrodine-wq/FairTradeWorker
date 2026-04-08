import { Skeleton } from "@shared/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 rounded-sm" />
          <Skeleton className="h-10 w-36 rounded-sm" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-56 rounded-sm" />
        <Skeleton className="h-56 rounded-sm" />
        <Skeleton className="h-56 rounded-sm" />
        <Skeleton className="h-56 rounded-sm" />
      </div>
    </div>
  );
}
