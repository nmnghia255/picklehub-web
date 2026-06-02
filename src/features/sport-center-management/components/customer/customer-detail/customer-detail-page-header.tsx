"use client"

import { ArrowLeft, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CustomerDetailPageHeaderProps {
  customerName: string
  onBack: () => void
}

export function CustomerDetailPageHeader({
  customerName,
  onBack,
}: CustomerDetailPageHeaderProps) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          <UserRound className="size-3.5 text-sky-500" />
          Chi tiết khách hàng
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {customerName || "Đang tải khách hàng"}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Trang tổng quan khách hàng riêng, gọn hơn dialog để xem nhanh hồ sơ,
            thống kê và lịch sử gần đây.
          </p>
        </div>
      </div>

      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="size-4" />
        Quay lại
      </Button>
    </section>
  )
}

export default CustomerDetailPageHeader
