"use client"

import { ArrowLeft, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

interface CustomerDetailPageHeaderProps {
  customerName: string
  onBack: () => void
}

export function CustomerDetailPageHeader({
  customerName,
  onBack,
}: CustomerDetailPageHeaderProps) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          <UserRound className="size-3.5 text-sky-500" />
          {t("customer.detail.page.badge")}
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {customerName || t("customer.detail.page.loading")}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            {t("customer.detail.page.subtitle")}
          </p>
        </div>
      </div>

      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="size-4" />
        {t("common.back")}
      </Button>
    </section>
  )
}

export default CustomerDetailPageHeader
