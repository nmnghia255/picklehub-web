import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/features/sport-center-management/components/booking-list/booking-list.utils"

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
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="border bg-background/90 shadow-sm backdrop-blur">
        <CardContent className="space-y-1 p-5">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Tổng khách hàng
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {stats.totalCustomers}
          </p>
          <p className="text-sm text-muted-foreground">
            Đang hiển thị {stats.visibleCustomers} khách
          </p>
        </CardContent>
      </Card>

      <Card className="border bg-background/90 shadow-sm backdrop-blur">
        <CardContent className="space-y-1 p-5">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Lượt ghé thăm
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {stats.totalVisits}
          </p>
          <p className="text-sm text-muted-foreground">Trong trang hiện tại</p>
        </CardContent>
      </Card>

      <Card className="border bg-background/90 shadow-sm backdrop-blur">
        <CardContent className="space-y-1 p-5">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Tổng chi tiêu
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(stats.totalSpend)}
          </p>
          <p className="text-sm text-muted-foreground">
            Cộng trên các khách hiển thị
          </p>
        </CardContent>
      </Card>

      <Card className="border bg-background/90 shadow-sm backdrop-blur">
        <CardContent className="space-y-1 p-5">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Dư credit
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(stats.totalCreditBalance)}
          </p>
          <p className="text-sm text-muted-foreground">Trong trang hiện tại</p>
        </CardContent>
      </Card>
    </section>
  )
}

export default CustomerManagementStatsCards
