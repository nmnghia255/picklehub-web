"use client"

import { CalendarDays, Coins, Wallet } from "lucide-react"

import { formatCurrency } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import type { CustomerCenter } from "@/features/sport-center-management/types/customer"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { formatDateTimeLong } from "../customer.utils"
import { CustomerDetailEmptyState } from "./customer-detail-empty-state"
import { CustomerDetailSectionTitle } from "./customer-detail-section-title"
import { CustomerDetailValueCard } from "./customer-detail-value-card"

interface CustomerDetailCenterSectionProps {
  centers: CustomerCenter[]
}

export function CustomerDetailCenterSection({
  centers,
}: CustomerDetailCenterSectionProps) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
      <CustomerDetailSectionTitle
        icon={Coins}
        title={t("customer.detail.byCenterTitle")}
        toneClassName="text-emerald-500"
      />
      <div className="grid gap-2 lg:grid-cols-2">
        {centers.length > 0 ? (
          centers.map((center) => (
            <CenterCard key={center.centerId} center={center} />
          ))
        ) : (
          <CustomerDetailEmptyState text={t("customer.detail.noCenterStats")} />
        )}
      </div>
    </section>
  )
}

function CenterCard({ center }: { center: CustomerCenter }) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <div className="space-y-2 rounded-2xl border bg-background/80 p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{center.centerName}</p>
          <p className="text-sm text-muted-foreground">
            {t("customer.detail.centerCode")}: {center.centerId}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-foreground">
          {t("customer.detail.visitCount", { count: center.visitCount })}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <CustomerDetailValueCard
          label={t("customer.detail.spend")}
          value={formatCurrency(center.totalSpend)}
          icon={Coins}
          toneClassName="text-emerald-500"
        />
        <CustomerDetailValueCard
          label={t("customer.detail.creditBalance")}
          value={formatCurrency(center.creditBalance)}
          icon={Wallet}
          toneClassName="text-orange-500"
        />
      </div>

      <CustomerDetailValueCard
        label={t("customer.detail.lastVisit")}
        value={formatDateTimeLong(center.lastVisitAt)}
        icon={CalendarDays}
        toneClassName="text-violet-500"
      />
    </div>
  )
}

export default CustomerDetailCenterSection
