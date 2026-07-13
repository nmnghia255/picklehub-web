"use client"

import { Activity, Clock, Coins, TrendingUp, Trophy, Users } from "lucide-react"
import React from "react"

import { Card } from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

interface SocialStatisticsCardsProps {
  collectedRevenue: number
  totalExpectedRevenue: number
  outstandingAmount: number
  totalExpense: number
  estimatedProfit: number
  displayMatchesCount: number
  displayActivePlayers: number
  courtHours?: string
}

export function SocialStatisticsCards({
  collectedRevenue,
  totalExpectedRevenue,
  outstandingAmount,
  totalExpense,
  estimatedProfit,
  displayMatchesCount,
  displayActivePlayers,
  courtHours,
}: SocialStatisticsCardsProps) {
  const { t } = useSocialsTranslation()

  return (
    <div className="space-y-6">
      {/* Row 1: Financial Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Spent Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
          <div className="pointer-events-none absolute -top-6 -right-6 opacity-5">
            <Coins className="size-24 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {t("statistics.revenue")}
            </p>
            <Coins className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrencyVnd(collectedRevenue)}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span>{t("statistics.revenueDescription")}:</span>
              <span className="font-semibold text-foreground">
                {formatCurrencyVnd(totalExpectedRevenue)}
              </span>
            </div>
            {outstandingAmount > 0 && (
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <span>{t("statistics.outstanding")}:</span>
                <span className="font-semibold">
                  {formatCurrencyVnd(outstandingAmount)}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Expense Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
          <div className="pointer-events-none absolute -top-6 -right-6 opacity-5">
            <TrendingUp className="size-24 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {t("statistics.expense")}
            </p>
            <TrendingUp className="size-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrencyVnd(totalExpense)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("expenses.summary.totalExpenseDescription")}
            </p>
          </div>
        </Card>

        {/* Net Profit Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
          <div className="pointer-events-none absolute -top-6 -right-6 opacity-5">
            <Trophy className="size-24 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {t("statistics.profit")}
            </p>
            <Trophy
              className={`size-4 ${estimatedProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
            />
          </div>
          <div className="mt-2">
            <p
              className={`text-2xl font-bold tracking-tight ${estimatedProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
            >
              {formatCurrencyVnd(estimatedProfit)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {estimatedProfit >= 0
                ? t("statistics.estimated")
                : t("statistics.estimatedLoss")}
            </p>
          </div>
        </Card>
      </div>

      {/* Row 2: Play & Match Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Matches Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
          <div className="pointer-events-none absolute -top-6 -right-6 opacity-5">
            <Activity className="size-24 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {t("statistics.totalMatches")}
            </p>
            <Activity className="size-4 text-primary" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {displayMatchesCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("matches.statistics.playerMatchesTitle", {})}
            </p>
          </div>
        </Card>

        {/* Court Hours Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
          <div className="pointer-events-none absolute -top-6 -right-6 opacity-5">
            <Clock className="size-24 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {t("statistics.courtHours")}
            </p>
            <Clock className="size-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {courtHours || t("common.na")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("statistics.courtHoursDescription")}
            </p>
          </div>
        </Card>

        {/* Active Players Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
          <div className="pointer-events-none absolute -top-6 -right-6 opacity-5">
            <Users className="size-24 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {t("statistics.activePlayers")}
            </p>
            <Users className="size-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {displayActivePlayers}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("statistics.activePlayersDescription")}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
