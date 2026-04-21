"use client"

import { Line, LineChart, XAxis, YAxis } from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const rankingHistory = [
  { period: "W1", rating: 4.1 },
  { period: "W2", rating: 4.0 },
  { period: "W3", rating: 4.2 },
  { period: "W4", rating: 4.3 },
  { period: "W5", rating: 4.4 },
  { period: "Now", rating: 4.5 },
]

const chartConfig = {
  rating: {
    label: "Rating",
    color: "#16a34a",
  },
} satisfies ChartConfig

export function RankingCard() {
  return (
    <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow">
      <h3 className="mb-4 font-semibold">Điểm và xếp hạng</h3>

      <div className="mb-6">
        <p className="mb-2 text-sm text-muted-foreground">Biến động xếp hạng</p>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-40 w-full"
        >
          <LineChart
            data={rankingHistory}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <XAxis dataKey="period" tickLine={false} axisLine={false} />
            <YAxis
              domain={[3.8, 4.6]}
              tickLine={false}
              axisLine={false}
              tickCount={5}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="rating"
              type="monotone"
              stroke="var(--color-rating)"
              strokeWidth={3}
              dot={{ r: 3, fill: "var(--color-rating)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </div>

      <div className="mb-4 grid grid-cols-3 text-center">
        <div>
          <p className="text-2xl font-bold">4.5</p>
          <p className="text-muted-foreground">Đánh giá hiện tại</p>
        </div>
        <div>
          <p className="text-2xl font-bold">4.2</p>
          <p className="text-muted-foreground">Đánh giá cao nhất</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600">+0.3</p>
          <p className="text-muted-foreground">Last 30 Days</p>
        </div>
      </div>
    </div>
  )
}
