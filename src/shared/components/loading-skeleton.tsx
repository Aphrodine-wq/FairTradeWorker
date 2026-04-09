"use client";

import { cn } from "@shared/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-gray-200 rounded-sm animate-pulse",
        className
      )}
    />
  );
}

export function MessageListSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3.5">
          <Bone className="w-9 h-9 rounded-sm flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Bone className="h-3.5 w-24" />
              <Bone className="h-3 w-12" />
            </div>
            <Bone className="h-3 w-32" />
            <Bone className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationListSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-4">
          <Bone className="w-10 h-10 rounded-sm flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Bone className="h-4 w-48" />
              <Bone className="h-3 w-16" />
            </div>
            <Bone className="h-3 w-64" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-sm p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Bone className="w-10 h-10 rounded-sm" />
              <div className="space-y-1.5">
                <Bone className="h-4 w-28" />
                <Bone className="h-3 w-20" />
              </div>
            </div>
            <Bone className="h-4 w-20" />
          </div>
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-sm p-5 space-y-3">
          <Bone className="h-5 w-48" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
