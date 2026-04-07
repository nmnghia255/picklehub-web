"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  revenuePoints,
  revenueTransactions,
} from "@/features/coach/data/mockRevenue"

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ"
}

export function CoachIncomeOverview() {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Select defaultValue="month">
            <SelectTrigger>
              <SelectValue placeholder="Theo thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Ngày</SelectItem>
              <SelectItem value="month">Tháng</SelectItem>
              <SelectItem value="year">Năm</SelectItem>
            </SelectContent>
          </Select>
          <Input defaultValue="2026-04" />
          <Input defaultValue="PickleHub Center" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Tổng thu nhập" value="42.500.000đ" />
        <InfoCard label="Số buổi đã dạy" value="120" />
        <InfoCard label="Thu nhập trung bình/buổi" value="354.167đ" />
      </div>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Biểu đồ thu nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <LineChart data={revenuePoints}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={{ fill: "var(--color-revenue)", r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Danh sách giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-t-2">
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead>Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.student}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}
