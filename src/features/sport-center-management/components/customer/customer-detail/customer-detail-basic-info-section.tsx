"use client"

import { Coins, UserRound } from "lucide-react"

import { formatCurrency } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import type { CustomerDetailResponse } from "@/features/sport-center-management/types/customer"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { CustomerDetailSectionTitle } from "./customer-detail-section-title"
import { CustomerDetailValueCard } from "./customer-detail-value-card"

interface CustomerDetailBasicInfoSectionProps {
  detail: CustomerDetailResponse
}

export function CustomerDetailBasicInfoSection({
  detail,
}: CustomerDetailBasicInfoSectionProps) {
  const { customer } = detail
  const { t } = useSportCenterManagementTranslation()

  return (
    <section className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
      <CustomerDetailSectionTitle
        icon={UserRound}
        title={t("customer.detail.basicInfoTitle")}
        toneClassName="text-sky-500"
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <CustomerDetailValueCard
          label={t("customer.detail.fullName")}
          value={customer.name ?? t("common.notAvailable")}
          icon={UserRound}
          toneClassName="text-sky-500"
        />
        <CustomerDetailValueCard
          label="Email"
          value={customer.email || t("common.notUpdated")}
          icon={UserRound}
          toneClassName="text-sky-500"
        />
        <CustomerDetailValueCard
          label={t("customer.detail.phoneNumber")}
          value={customer.phoneNumber || t("common.notUpdated")}
          icon={UserRound}
          toneClassName="text-sky-500"
        />
        <CustomerDetailValueCard
          label={t("customer.detail.cancelledRefundAmount")}
          value={formatCurrency(detail.summary.cancelledRefundAmount)}
          icon={Coins}
          toneClassName="text-sky-500"
        />
      </div>
    </section>
  )
}

export default CustomerDetailBasicInfoSection
