import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

interface CustomerManagementStats {
  totalCustomers: number
  visibleCustomers: number
  totalVisits: number
  totalSpend: number
  totalCreditBalance: number
}

interface CustomerManagementStatsCardsProps {
  stats: CustomerManagementStats
}

export function CustomerManagementStatsCards({
  stats,
}: CustomerManagementStatsCardsProps) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="border bg-background/90 shadow-sm backdrop-blur">
        <CardContent className="space-y-1 p-5">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            {t("customer.detail.stats.totalCustomers")}
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {stats.totalCustomers}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("customer.detail.stats.visibleCustomers", {
              count: stats.visibleCustomers,
            })}
          </p>
        </CardContent>
      </Card>

      <Card className="border bg-background/90 shadow-sm backdrop-blur">
        <CardContent className="space-y-1 p-5">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            {t("customer.detail.stats.visits")}
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {stats.totalVisits}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("customer.detail.stats.currentPageVisits")}
          </p>
        </CardContent>
      </Card>

      <Card className="border bg-background/90 shadow-sm backdrop-blur">
        <CardContent className="space-y-1 p-5">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            {t("customer.detail.stats.totalSpend")}
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(stats.totalSpend)}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("customer.detail.stats.totalSpendDescription")}
          </p>
        </CardContent>
      </Card>

      <Card className="border bg-background/90 shadow-sm backdrop-blur">
        <CardContent className="space-y-1 p-5">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            {t("customer.detail.stats.creditBalance")}
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(stats.totalCreditBalance)}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("customer.detail.stats.creditBalanceDescription")}
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

export default CustomerManagementStatsCards
