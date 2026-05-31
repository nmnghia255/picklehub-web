"use client"

import { CalendarDays, Coins, Wallet } from "lucide-react"

import { formatCurrency } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import type { CustomerCenter } from "@/features/sport-center-management/types/customer"

import { formatDateTimeLong } from "../customer-management.utils"
import { CustomerDetailEmptyState } from "./customer-detail-empty-state"
import { CustomerDetailSectionTitle } from "./customer-detail-section-title"
import { CustomerDetailValueCard } from "./customer-detail-value-card"

interface CustomerDetailCenterSectionProps {
  centers: CustomerCenter[]
}

export function CustomerDetailCenterSection({
  centers,
}: CustomerDetailCenterSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <CustomerDetailSectionTitle
        icon={Coins}
        title="Theo trung tâm"
        toneClassName="text-emerald-500"
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {centers.length > 0 ? (
          centers.map((center) => (
            <CenterCard key={center.centerId} center={center} />
          ))
        ) : (
          <CustomerDetailEmptyState text="Chưa có thống kê theo trung tâm." />
        )}
      </div>
    </section>
  )
}

function CenterCard({ center }: { center: CustomerCenter }) {
  return (
    <div className="space-y-3 rounded-2xl border bg-background/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{center.centerName}</p>
          <p className="text-xs text-muted-foreground">
            Mã trung tâm: {center.centerId}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-foreground">
          {center.visitCount} lượt
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CustomerDetailValueCard
          label="Chi tiêu"
          value={formatCurrency(center.totalSpend)}
          icon={Coins}
          toneClassName="text-emerald-500"
        />
        <CustomerDetailValueCard
          label="Credit còn lại"
          value={formatCurrency(center.creditBalance)}
          icon={Wallet}
          toneClassName="text-orange-500"
        />
      </div>

      <CustomerDetailValueCard
        label="Lần ghé gần nhất"
        value={formatDateTimeLong(center.lastVisitAt)}
        icon={CalendarDays}
        toneClassName="text-violet-500"
      />
    </div>
  )
}

export default CustomerDetailCenterSection
