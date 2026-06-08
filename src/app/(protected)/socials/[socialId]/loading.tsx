import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* SocialHero Skeleton */}
      <Skeleton className="h-64 w-full rounded-2xl" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Tabs List Skeleton */}
          <Skeleton className="h-10 w-[400px] rounded-md" />

          {/* Overview / Content Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="hidden lg:block">
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
