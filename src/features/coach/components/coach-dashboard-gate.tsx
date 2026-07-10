"use client"

import { Shield } from "lucide-react"
import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { useCoachProfile } from "@/features/coach/hooks/use-coach-queries"

import { CoachDetailTabs } from "./coach-detail-tabs"
import { CoachOnboarding } from "./coach-onboarding"

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-xl" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function CoachDashboardGateInner() {
  const { isLoading, exists, isError, error } = useCoachProfile()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Shield className="size-12 text-muted-foreground/40" />
        <div className="text-center">
          <p className="text-lg font-medium">Không thể tải hồ sơ HLV</p>
          <p className="text-sm text-muted-foreground">
            {error?.message ?? "Đã có lỗi xảy ra. Vui lòng thử lại sau."}
          </p>
        </div>
      </div>
    )
  }

  if (!exists) {
    return <CoachOnboarding />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Huấn luyện viên
        </h1>
        <p className="text-sm text-muted-foreground">
          Quản lý hồ sơ, học viên, lịch tập và thu chi của huấn luyện viên.
        </p>
      </div>
      <CoachDetailTabs />
    </div>
  )
}

export function CoachDashboardGate() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CoachDashboardGateInner />
    </Suspense>
  )
}
