"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { RevenueDailyStatistics, RevenueStatistics } from "../types"
import { formatCurrencyVnd, formatShortDate } from "../utils/format"
import { RevenueEmptyState } from "./revenue-empty-state"

export function RevenueDailyChart({
  daily,
  statistics,
  loading,
}: {
  daily: RevenueDailyStatistics | null
  statistics: RevenueStatistics | null
  loading: boolean
}) {
  const { t } = useSportCenterManagementTranslation()
  const chartConfig = {
    settledRevenue: {
      label: t("revenue.dailyChart.settledRevenue"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig
  const chartData = daily?.byDay?.map((item) => ({
    date: item.date,
    settledRevenue: item.settledCashRevenue,
  }))

  if ((!chartData || chartData.length === 0) && !loading) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>{t("revenue.dailyChart.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueEmptyState title={t("revenue.empty.dailyChart")} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle>{t("revenue.dailyChart.title")}</CardTitle>
        {statistics?.grossRevenue?.totalRevenue ? (
          <p className="text-xs text-muted-foreground">
            {t("revenue.dailyChart.grossRevenue")}:{" "}
            {formatCurrencyVnd(statistics.grossRevenue.totalRevenue)}
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatShortDate(String(value))}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => (
                    <span className="font-medium">
                      {formatCurrencyVnd(Number(value))}
                    </span>
                  )}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="settledRevenue"
              stroke="var(--color-settledRevenue)"
              strokeWidth={2}
              dot={{ fill: "var(--color-settledRevenue)", r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
