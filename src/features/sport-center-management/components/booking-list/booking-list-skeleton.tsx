import { Skeleton } from "@/components/ui/skeleton"

export function BookingListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-3xl border bg-background/90 p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,220px))_auto]">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="hidden h-10 rounded-md lg:block" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-4 w-56 rounded-md" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>

              <Skeleton className="h-20 rounded-xl" />

              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
