import { Filter, FilterX, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { CustomerSportCenterSelector } from "./customer-sport-center-selector"

interface CustomerManagementFiltersProps {
  keyword: string
  onKeywordChange: (value: string) => void
  onResetFilters: () => void
}

export function CustomerManagementFilters({
  keyword,
  onKeywordChange,
  onResetFilters,
}: CustomerManagementFiltersProps) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="space-y-4 rounded-3xl border bg-card/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Filter className="size-4" />
        <span>{t("customer.filters.title")}</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(200px,1.3fr)_auto_auto]">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("customer.filters.keywordLabel")}
          </p>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder={t("customer.filters.keywordPlaceholder")}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("customer.filters.centerLabel")}
          </p>
          <CustomerSportCenterSelector />
        </div>

        <div className="flex items-end gap-2">
          <Button variant="outline" onClick={onResetFilters}>
            <FilterX className="size-4" />
            <span className="ml-2">{t("customer.filters.reset")}</span>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CustomerManagementFilters
