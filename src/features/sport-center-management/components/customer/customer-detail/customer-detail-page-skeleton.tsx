"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function CustomerDetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-72" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-40 rounded-full" />
              <Skeleton className="h-8 w-44 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>

      <div className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CustomerDetailPageSkeleton
