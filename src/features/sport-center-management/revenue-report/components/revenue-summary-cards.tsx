"use client"

import {
  BadgeDollarSign,
  Clock9,
  DollarSign,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { RevenueSummary } from "../types"
import { formatCurrencyVnd } from "../utils/format"
import { RevenueEmptyState } from "./revenue-empty-state"

const CARD_CONFIG = [
  {
    key: "totalSettledRevenue",
    labelKey: "revenue.summary.settledRevenue",
    icon: BadgeDollarSign,
    tone: "text-emerald-600",
  },
  {
    key: "totalPendingRevenue",
    labelKey: "revenue.summary.pendingRevenue",
    icon: Clock9,
    tone: "text-amber-600",
  },
  {
    key: "settledTransactionCount",
    labelKey: "revenue.summary.settledTransactions",
    icon: WalletCards,
    tone: "text-sky-600",
  },
  {
    key: "pendingTransactionCount",
    labelKey: "revenue.summary.pendingTransactions",
    icon: ReceiptText,
    tone: "text-orange-600",
  },
  {
    key: "courtCostVnd",
    labelKey: "revenue.summary.courtCost",
    icon: DollarSign,
    tone: "text-rose-600",
  },
  {
    key: "netRevenueVnd",
    labelKey: "revenue.summary.netRevenue",
    icon: TrendingUp,
    tone: "text-cyan-600",
  },
] as const

export function RevenueSummaryCards({
  summary,
  loading,
}: {
  summary: RevenueSummary | null
  loading: boolean
}) {
  const { t } = useSportCenterManagementTranslation()
  if (!summary && !loading) {
    return <RevenueEmptyState title={t("revenue.empty.summary")} />
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon
        const rawValue = summary ? summary[card.key] : 0
        const value =
          card.key === "totalSettledRevenue" ||
          card.key === "totalPendingRevenue" ||
          card.key === "courtCostVnd" ||
          card.key === "netRevenueVnd"
            ? formatCurrencyVnd(Number(rawValue))
            : String(rawValue ?? 0)

        return (
          <Card
            key={card.key}
            className="rounded-2xl border bg-card/95 shadow-sm"
          >
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between">
                <div className="inline-flex rounded-2xl border bg-background p-3 shadow-sm">
                  <Icon className={`size-5 ${card.tone}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t(card.labelKey)}
                </p>
                <p className="text-2xl font-semibold tracking-tight">{value}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
