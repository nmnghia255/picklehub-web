"use client"

import { CalendarDays, Coins, Wallet } from "lucide-react"

import { formatCurrency } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import type { CustomerDetailResponse } from "@/features/sport-center-management/types/customer"

import { formatDateTimeLong } from "../customer-management.utils"
import { CustomerDetailValueCard } from "./customer-detail-value-card"

interface CustomerDetailSummaryGridProps {
  detail: CustomerDetailResponse
}

export function CustomerDetailSummaryGrid({
  detail,
}: CustomerDetailSummaryGridProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <CustomerDetailValueCard
        label="Lượt ghé thăm"
        value={String(detail.summary.visitCount)}
        icon={CalendarDays}
        toneClassName="text-sky-500"
      />
      <CustomerDetailValueCard
        label="Chi tiêu"
        value={formatCurrency(detail.summary.totalSpend)}
        icon={Coins}
        toneClassName="text-emerald-500"
      />
      <CustomerDetailValueCard
        label="Credit còn lại"
        value={formatCurrency(detail.summary.creditBalance)}
        icon={Wallet}
        toneClassName="text-orange-500"
      />
      <CustomerDetailValueCard
        label="Lần ghé gần nhất"
        value={formatDateTimeLong(detail.summary.lastVisitAt)}
        icon={CalendarDays}
        toneClassName="text-violet-500"
      />
    </section>
  )
}

export default CustomerDetailSummaryGrid
