"use client"

import { DollarSign } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useFinanceStore } from "../../stores/use-finance-store"

export function SummaryCards() {
  const { t, i18n } = useTournamentTranslation()
  const { summary } = useFinanceStore()

  const formatCurrency = (amount: number) => {
    if (i18n.language === "vi") {
      return `${amount.toLocaleString("vi-VN")} VND`
    }
    if (amount < 0) {
      return `-$${Math.abs(amount).toLocaleString()}`
    }
    return `$${amount.toLocaleString()}`
  }

  const totalRevenue = summary?.summary.totalIncome ?? 0
  const totalExpenses = summary?.summary.totalExpense ?? 0
  const profitLoss = summary?.summary.netProfit ?? 0

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mb-1 text-3xl font-semibold text-gray-900 dark:text-zinc-100">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-sm text-gray-600 dark:text-zinc-400">
            {t("financials.summary.totalRevenue")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <DollarSign className="h-5 w-5 text-red-600" />
          </div>
          <div className="mb-1 text-3xl font-semibold text-gray-900 dark:text-zinc-100">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="text-sm text-gray-600 dark:text-zinc-400">
            {t("financials.summary.totalExpenses")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mb-1 text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(profitLoss)}
          </div>
          <div className="text-sm text-gray-600 dark:text-zinc-400">
            {t("financials.summary.netProfit")}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
