"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import type { RevenueDailyStatistics, RevenueStatistics } from "../types"
import { formatCurrencyVnd, formatShortDate } from "../utils/format"
import { RevenueEmptyState } from "./revenue-empty-state"

const chartConfig = {
  settledRevenue: {
    label: "Doanh thu đã quyết toán",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function RevenueDailyChart({
  daily,
  statistics,
  loading,
}: {
  daily: RevenueDailyStatistics | null
  statistics: RevenueStatistics | null
  loading: boolean
}) {
  const chartData = daily?.byDay?.map((item) => ({
    date: item.date,
    settledRevenue: item.settledCashRevenue,
  }))

  if ((!chartData || chartData.length === 0) && !loading) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Biểu đồ doanh thu theo ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueEmptyState title="Chưa có dữ liệu biểu đồ doanh thu" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle>Biểu đồ doanh thu theo ngày</CardTitle>
        {statistics?.grossRevenue?.totalRevenue ? (
          <p className="text-xs text-muted-foreground">
            Doanh thu gộp kỳ này:{" "}
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
