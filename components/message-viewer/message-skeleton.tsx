"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeleton for the message detail view. */
export function MessageSkeleton() {
  return (
    <div className="flex h-full flex-col gap-5 p-6">
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-6 w-2/3" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="mt-2 h-64 w-full rounded-xl" />
    </div>
  );
}
