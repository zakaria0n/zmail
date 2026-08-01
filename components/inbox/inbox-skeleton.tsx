"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeleton for the inbox list. */
export function InboxSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2 p-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border border-transparent bg-white/[0.02] p-3"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
