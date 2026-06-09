import {
  DollarSign,
  Download,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { memo, useMemo } from "react"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { ExpenseData, RevenueData } from "../types/dashboard"

const RevenueBarChart = memo(({ data }: { data: RevenueData[] }) => (
  <div style={{ width: "100%", height: 300 }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`$${value}`, "Revenue"]}
        />
        <Bar dataKey="revenue" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  </div>
))

RevenueBarChart.displayName = "RevenueBarChart"

const ExpensePieChart = memo(({ data }: { data: ExpenseData[] }) => (
  <div style={{ width: "100%", height: 300 }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry) => (
            <Cell key={`cell-${entry.id}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(
            value: number,
            name: string,
            props: { payload?: { name?: string } }
          ) => [`$${value}`, props?.payload?.name || name]}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
))

ExpensePieChart.displayName = "ExpensePieChart"

// Suppress recharts duplicate key warning (known issue in recharts 2.15.2)
const originalConsoleError = console.error
if (typeof window !== "undefined") {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered two children with the same key")
    ) {
      return
    }
    originalConsoleError(...args)
  }
}

export function FinancialDashboard() {
  const { t } = useTournamentTranslation()
  const totalRevenue = 45280
  const totalExpenses = 12450
  const profitLoss = totalRevenue - totalExpenses

  const revenueData = useMemo(
    () => [
      { id: "jan-2026", month: "Jan", revenue: 12400 },
      { id: "feb-2026", month: "Feb", revenue: 19800 },
      { id: "mar-2026", month: "Mar", revenue: 24500 },
      { id: "apr-2026", month: "Apr", revenue: 18200 },
      { id: "may-2026", month: "May", revenue: 32800 },
      { id: "jun-2026", month: "Jun", revenue: 45280 },
    ],
    []
  )

  const expenseData = useMemo(
    () => [
      { id: "venue", name: "Venue Rental", value: 4500, color: "#3b82f6" },
      { id: "equipment", name: "Equipment", value: 1200, color: "#10b981" },
      { id: "referees", name: "Referees", value: 2400, color: "#f59e0b" },
      { id: "marketing", name: "Marketing", value: 1850, color: "#8b5cf6" },
      { id: "prizes", name: "Prizes", value: 2500, color: "#ec4899" },
    ],
    []
  )

  const transactions = useMemo(
    () => [
      {
        id: 1,
        date: "Jun 8, 2026",
        description: "Registration - Men's Doubles 4.0",
        type: "income",
        amount: 290,
        status: "completed",
      },
      {
        id: 2,
        date: "Jun 8, 2026",
        description: "Refund - Sarah Johnson",
        type: "refund",
        amount: -145,
        status: "completed",
      },
      {
        id: 3,
        date: "Jun 7, 2026",
        description: "Venue Rental Payment",
        type: "expense",
        amount: -1500,
        status: "completed",
      },
      {
        id: 4,
        date: "Jun 7, 2026",
        description: "Registration - Women's Singles Open",
        type: "income",
        amount: 195,
        status: "completed",
      },
      {
        id: 5,
        date: "Jun 6, 2026",
        description: "Referee Payment - Day 1",
        type: "expense",
        amount: -800,
        status: "completed",
      },
      {
        id: 6,
        date: "Jun 6, 2026",
        description: "Sponsorship - Pickleball Pro Shop",
        type: "income",
        amount: 5000,
        status: "completed",
      },
      {
        id: 7,
        date: "Jun 5, 2026",
        description: "Marketing Materials",
        type: "expense",
        amount: -650,
        status: "completed",
      },
      {
        id: 8,
        date: "Jun 5, 2026",
        description: "Registration - Mixed Doubles 4.5",
        type: "income",
        amount: 320,
        status: "pending",
      },
    ],
    []
  )

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-semibold text-gray-900">
                {t("financials.title")}
              </h1>
              <p className="text-gray-600">{t("financials.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                {t("financials.exportPdf")}
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="mr-2 h-4 w-4" />
                {t("financials.exportExcel")}
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <Badge className="bg-emerald-100 text-emerald-700">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +24%
                </Badge>
              </div>
              <div className="mb-1 text-3xl font-semibold text-gray-900">
                ${totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {t("financials.summary.totalRevenue")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <DollarSign className="h-5 w-5 text-red-600" />
                <Badge className="bg-red-100 text-red-700">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  +12%
                </Badge>
              </div>
              <div className="mb-1 text-3xl font-semibold text-gray-900">
                ${totalExpenses.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {t("financials.summary.totalExpenses")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <Badge className="bg-emerald-100 text-emerald-700">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +32%
                </Badge>
              </div>
              <div className="mb-1 text-3xl font-semibold text-emerald-600">
                ${profitLoss.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {t("financials.summary.netProfit")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t("financials.charts.revenueOverTime")}</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueBarChart data={revenueData} />
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>{t("financials.charts.expenseBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpensePieChart data={expenseData} />
              <div className="mt-4 space-y-2">
                {expenseData.map((item) => (
                  <div
                    key={`legend-${item.id}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      ${item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("financials.transactions.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("financials.transactions.date")}</TableHead>
                  <TableHead>
                    {t("financials.transactions.description")}
                  </TableHead>
                  <TableHead>{t("financials.transactions.type")}</TableHead>
                  <TableHead className="text-right">
                    {t("financials.transactions.amount")}
                  </TableHead>
                  <TableHead>{t("financials.transactions.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm text-gray-600">
                      {transaction.date}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          transaction.type === "income"
                            ? "bg-emerald-100 text-emerald-700"
                            : transaction.type === "expense"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        transaction.amount > 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}$
                      {Math.abs(transaction.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          transaction.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
