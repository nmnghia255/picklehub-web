"use client"

import { AlertTriangle, CreditCard, XCircle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

import type { RevenueCancellationAnalysis } from "../types"
import { formatCurrencyVnd } from "../utils/format"
import { RevenueEmptyState } from "./revenue-empty-state"

const CARD_CONFIG = [
  {
    key: "totalCancelledBookingCount",
    label: "Số lượt hủy",
    icon: XCircle,
    tone: "text-rose-600",
  },
  {
    key: "totalCancelledRevenue",
    label: "Doanh thu bị hủy",
    icon: AlertTriangle,
    tone: "text-amber-600",
  },
  {
    key: "totalRefundedCreditAmount",
    label: "Hoàn tiền/credit",
    icon: CreditCard,
    tone: "text-sky-600",
  },
] as const

export function RevenueCancellationsCards({
  cancellations,
  loading,
}: {
  cancellations: RevenueCancellationAnalysis | null
  loading: boolean
}) {
  if (!cancellations && !loading) {
    return <RevenueEmptyState title="Chưa có dữ liệu hủy/hoàn tiền" />
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon
        const rawValue = cancellations ? cancellations[card.key] : 0
        const value =
          card.key === "totalCancelledRevenue" ||
          card.key === "totalRefundedCreditAmount"
            ? formatCurrencyVnd(Number(rawValue))
            : String(rawValue ?? 0)

        return (
          <Card
            key={card.key}
            className="rounded-2xl border bg-card/95 shadow-sm"
          >
            <CardContent className="space-y-3 p-4">
              <div className="inline-flex rounded-2xl border bg-background p-3 shadow-sm">
                <Icon className={`size-5 ${card.tone}`} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-semibold tracking-tight">{value}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
