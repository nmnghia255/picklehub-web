import { ShieldCheck, Users } from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

interface CustomerManagementPageHeaderProps {
  selectedCenterName: string
}

export function CustomerManagementPageHeader({
  selectedCenterName,
}: CustomerManagementPageHeaderProps) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            {t("customer.page.badge")}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("customer.page.title")}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {t("customer.page.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-2 shadow-sm backdrop-blur">
          <Users className="size-4 text-sky-500" />
          {selectedCenterName}
        </div>
      </div>
    </section>
  )
}

export default CustomerManagementPageHeader
