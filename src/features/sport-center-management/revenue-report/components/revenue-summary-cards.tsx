"use client"

import { BadgeDollarSign, Clock9, ReceiptText, WalletCards } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

import type { RevenueSummary } from "../types"
import { formatCurrencyVnd } from "../utils/format"
import { RevenueEmptyState } from "./revenue-empty-state"

const CARD_CONFIG = [
  {
    key: "totalSettledRevenue",
    label: "Doanh thu đã quyết toán",
    icon: BadgeDollarSign,
    tone: "text-emerald-600",
  },
  {
    key: "totalPendingRevenue",
    label: "Doanh thu chờ duyệt",
    icon: Clock9,
    tone: "text-amber-600",
  },
  {
    key: "settledTransactionCount",
    label: "Giao dịch đã quyết toán",
    icon: WalletCards,
    tone: "text-sky-600",
  },
  {
    key: "pendingTransactionCount",
    label: "Giao dịch chờ duyệt",
    icon: ReceiptText,
    tone: "text-orange-600",
  },
] as const

export function RevenueSummaryCards({
  summary,
  loading,
}: {
  summary: RevenueSummary | null
  loading: boolean
}) {
  if (!summary && !loading) {
    return <RevenueEmptyState title="Chưa có dữ liệu doanh thu tổng quan" />
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon
        const rawValue = summary ? summary[card.key] : 0
        const value =
          card.key === "totalSettledRevenue" ||
          card.key === "totalPendingRevenue"
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
