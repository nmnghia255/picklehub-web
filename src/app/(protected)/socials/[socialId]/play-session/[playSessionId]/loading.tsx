import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main Content Area */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 pb-0">
              {/* Tabs List Skeleton */}
              <Skeleton className="h-10 w-[300px] rounded-md" />
            </div>
            <div className="p-6">
              {/* Content Skeleton */}
              <Skeleton className="h-64 w-full rounded-md" />
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="hidden lg:block">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
