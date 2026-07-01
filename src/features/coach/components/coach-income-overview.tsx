"use client"

import { DollarSign, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { useRevenueSummary } from "../hooks/use-coach-queries"

function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export function CoachIncomeOverview() {
  const { data, isLoading } = useRevenueSummary()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="mb-2 size-4" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu thu nhập. Vui lòng quay lại sau.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm">Doanh thu lớp học</span>
              <TrendingUp className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {formatVnd(data.classRevenueVnd)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm">Doanh thu đặt lịch</span>
              <DollarSign className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {formatVnd(data.bookingRevenueVnd)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm">Tổng doanh thu</span>
              <TrendingUp className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {formatVnd(data.totalRevenueVnd)}
            </p>
          </CardContent>
        </Card>
      </div>

      {data.buckets.length > 0 && (
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle>Chi tiết theo kỳ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {data.buckets.map((bucket, index) => (
                <div
                  key={bucket.periodLabel ?? index}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm font-medium">
                    {bucket.periodLabel}
                  </span>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>Lớp: {formatVnd(bucket.classRevenueVnd)}</span>
                    <span>Đặt lịch: {formatVnd(bucket.bookingRevenueVnd)}</span>
                    <span className="font-semibold text-foreground">
                      {formatVnd(bucket.totalRevenueVnd)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
