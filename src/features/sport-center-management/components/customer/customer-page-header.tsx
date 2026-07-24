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
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("customer.page.title")}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("customer.page.subtitle")}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CustomerManagementPageHeader
