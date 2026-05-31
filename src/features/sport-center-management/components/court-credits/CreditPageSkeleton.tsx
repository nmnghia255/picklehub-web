"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function CreditPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-48 rounded-full" />
        <Skeleton className="h-12 w-2/3 rounded-2xl" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-3xl border bg-card p-4 shadow-sm">
            <div className="space-y-4">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border bg-background p-4 shadow-sm">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>
        <div className="mt-6 hidden gap-3 md:grid">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-10 gap-3 rounded-2xl border p-4"
            >
              {Array.from({ length: 10 }).map((__, cellIndex) => (
                <Skeleton key={cellIndex} className="h-5 rounded-full" />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-3xl border p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-32 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-5/6 rounded-full" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
