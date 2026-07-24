"use client"

import { CalendarDays, Coins, Wallet } from "lucide-react"

import { formatCurrency } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import type { CustomerDetailResponse } from "@/features/sport-center-management/types/customer"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { formatDateTimeLong } from "../customer.utils"
import { CustomerDetailValueCard } from "./customer-detail-value-card"

interface CustomerDetailSummaryGridProps {
  detail: CustomerDetailResponse
}

export function CustomerDetailSummaryGrid({
  detail,
}: CustomerDetailSummaryGridProps) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <CustomerDetailValueCard
        label={t("customer.detail.visitCountLabel")}
        value={String(detail.summary.visitCount)}
        icon={CalendarDays}
        toneClassName="text-sky-500"
        variant="flat"
      />
      <CustomerDetailValueCard
        label={t("customer.detail.spend")}
        value={formatCurrency(detail.summary.totalSpend)}
        icon={Coins}
        toneClassName="text-emerald-500"
        variant="flat"
      />
      <CustomerDetailValueCard
        label={t("customer.detail.creditBalance")}
        value={formatCurrency(detail.summary.creditBalance)}
        icon={Wallet}
        toneClassName="text-orange-500"
        variant="flat"
      />
      <CustomerDetailValueCard
        label={t("customer.detail.lastVisit")}
        value={formatDateTimeLong(detail.summary.lastVisitAt)}
        icon={CalendarDays}
        toneClassName="text-violet-500"
        variant="flat"
      />
    </section>
  )
}

export default CustomerDetailSummaryGrid
