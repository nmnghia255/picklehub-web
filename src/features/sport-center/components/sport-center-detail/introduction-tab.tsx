"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { CourtResponse } from "@/features/sport-center/types/court"

interface IntroductionTabProps {
  description: string
  courts: CourtResponse[]
}

function getCourtStatusLabel(court: CourtResponse) {
  return court.status === "ACTIVE" ? "Đang hoạt động" : "Tạm ngưng"
}

function getCourtStatusVariant(court: CourtResponse) {
  return court.status === "ACTIVE" ? "secondary" : "outline"
}

function getCourtStatusBadgeClassName(court: CourtResponse) {
  return court.status === "ACTIVE"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
}

function getCourtTypeBadgeClassName(court: CourtResponse) {
  return court.type === "INDOOR"
    ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
}

export function IntroductionTab({ description, courts }: IntroductionTabProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Giới thiệu</h2>
          <p className="text-md leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="space-y-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Danh sách sân
            </h2>
            <span className="text-sm text-muted-foreground">
              {courts.length} sân
            </span>
          </div>

          {courts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {courts.map((court) => (
                <div key={court.id} className="rounded-lg border bg-card p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="leading-none font-medium">{court.name}</p>
                      </div>

                      <Badge
                        variant={getCourtStatusVariant(court)}
                        className={getCourtStatusBadgeClassName(court)}
                      >
                        {getCourtStatusLabel(court)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={getCourtTypeBadgeClassName(court)}
                      >
                        {court.type === "INDOOR" ? "Indoor" : "Outdoor"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Chưa có thông tin sân.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function IntroductionTabSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-3/4 max-w-xl" />
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border bg-card p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
