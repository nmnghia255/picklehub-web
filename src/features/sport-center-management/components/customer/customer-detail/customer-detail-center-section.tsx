"use client"

import { CalendarDays, Coins, Wallet } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
    <section className="space-y-3">
      <CustomerDetailSectionTitle
        icon={Coins}
        title={t("customer.detail.byCenterTitle")}
        toneClassName="text-emerald-500"
      />
      <div className="grid gap-3 lg:grid-cols-2">
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
    <div className="space-y-3 rounded-2xl bg-muted/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{center.centerName}</p>
          <p className="text-xs text-muted-foreground">
            {t("customer.detail.centerCode")}: {center.centerId}
          </p>
        </div>
        <Badge variant="secondary" className="font-medium">
          {t("customer.detail.visitCount", { count: center.visitCount })}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <CustomerDetailValueCard
          label={t("customer.detail.spend")}
          value={formatCurrency(center.totalSpend)}
          icon={Coins}
          toneClassName="text-emerald-500"
          variant="ghost"
        />
        <CustomerDetailValueCard
          label={t("customer.detail.creditBalance")}
          value={formatCurrency(center.creditBalance)}
          icon={Wallet}
          toneClassName="text-orange-500"
          variant="ghost"
        />
        <CustomerDetailValueCard
          label={t("customer.detail.lastVisit")}
          value={formatDateTimeLong(center.lastVisitAt)}
          icon={CalendarDays}
          toneClassName="text-violet-500"
          variant="ghost"
        />
      </div>
    </div>
  )
}

export default CustomerDetailCenterSection
