"use client"

import { Coins, UserRound } from "lucide-react"

import { formatCurrency } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import type { CustomerDetailResponse } from "@/features/sport-center-management/types/customer"

import { CustomerDetailSectionTitle } from "./customer-detail-section-title"
import { CustomerDetailValueCard } from "./customer-detail-value-card"

interface CustomerDetailBasicInfoSectionProps {
  detail: CustomerDetailResponse
}

export function CustomerDetailBasicInfoSection({
  detail,
}: CustomerDetailBasicInfoSectionProps) {
  const { customer } = detail

  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <CustomerDetailSectionTitle
        icon={UserRound}
        title="Thông tin cơ bản"
        toneClassName="text-sky-500"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <CustomerDetailValueCard
          label="Họ và tên"
          value={customer.name ?? "—"}
          icon={UserRound}
          toneClassName="text-sky-500"
        />
        <CustomerDetailValueCard
          label="Email"
          value={customer.email || "Chưa cập nhật"}
          icon={UserRound}
          toneClassName="text-sky-500"
        />
        <CustomerDetailValueCard
          label="Số điện thoại"
          value={customer.phoneNumber || "Chưa cập nhật"}
          icon={UserRound}
          toneClassName="text-sky-500"
        />
        <CustomerDetailValueCard
          label="Hoàn tiền credit hủy"
          value={formatCurrency(detail.summary.cancelledRefundAmount)}
          icon={Coins}
          toneClassName="text-sky-500"
        />
      </div>
    </section>
  )
}

export default CustomerDetailBasicInfoSection
