import { DollarSign, Download, FileText, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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
import { getDateOnly } from "@/utils/time-helper"

import {
  exportFinanceReportAction,
  getFinanceSummaryAction,
  getFinanceTransactionsAction,
} from "../../actions/finance-actions"
import type { Finance, FinanceSummary } from "../../types/finance"

interface FinancialDashboardProps {
  tournamentId: string
}

export function FinancialDashboard({ tournamentId }: FinancialDashboardProps) {
  const { t, i18n } = useTournamentTranslation()
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [transactions, setTransactions] = useState<Finance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const formatCurrency = (amount: number, forcePositive = false) => {
    const value = forcePositive ? Math.abs(amount) : amount
    if (i18n.language === "vi") {
      return `${value.toLocaleString("vi-VN")} VND`
    }
    if (value < 0) {
      return `-$${Math.abs(value).toLocaleString()}`
    }
    return `$${value.toLocaleString()}`
  }

  useEffect(() => {
    async function loadData() {
      if (!tournamentId) return
      setIsLoading(true)
      try {
        const [summaryRes, transactionsRes] = await Promise.all([
          getFinanceSummaryAction(tournamentId),
          getFinanceTransactionsAction(tournamentId),
        ])

        if (summaryRes.success && summaryRes.data) {
          setSummary(summaryRes.data)
        } else if (!summaryRes.success) {
          toast.error(summaryRes.error || "Failed to load summary")
        }

        if (transactionsRes.success && transactionsRes.data) {
          setTransactions(transactionsRes.data)
        } else if (!transactionsRes.success) {
          toast.error(transactionsRes.error || "Failed to load transactions")
        }
      } catch (error) {
        console.error("Error loading financial data:", error)
        toast.error("Failed to load financial data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [tournamentId])

  const handleExport = async (format: "pdf" | "excel") => {
    setIsExporting(true)
    try {
      const res = await exportFinanceReportAction(tournamentId, format)
      if (res.success && res.base64) {
        const byteCharacters = atob(res.base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const contentType =
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        const fileBlob = new Blob([byteArray], { type: contentType })
        const url = window.URL.createObjectURL(fileBlob)
        const a = document.createElement("a")
        a.href = url
        a.download = `finance-report-${tournamentId}.${
          format === "pdf" ? "pdf" : "xlsx"
        }`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        toast.success(
          t("financials.exportSuccess", {
            format: format.toUpperCase(),
            defaultValue: `Exported ${format.toUpperCase()} report successfully!`,
          })
        )
      } else {
        toast.error(res.error || "Failed to export report")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to export report")
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  const totalRevenue = summary?.summary.totalIncome ?? 0
  const totalExpenses = summary?.summary.totalExpense ?? 0
  const profitLoss = summary?.summary.netProfit ?? 0

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
              <Button
                variant="outline"
                disabled={isExporting}
                onClick={() => handleExport("pdf")}
              >
                <FileText className="mr-2 h-4 w-4" />
                {t("financials.exportPdf")}
              </Button>
              <Button
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={isExporting}
                onClick={() => handleExport("excel")}
              >
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
              </div>
              <div className="mb-1 text-3xl font-semibold text-gray-900">
                {formatCurrency(totalRevenue)}
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
              </div>
              <div className="mb-1 text-3xl font-semibold text-gray-900">
                {formatCurrency(totalExpenses)}
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
              </div>
              <div className="mb-1 text-3xl font-semibold text-emerald-600">
                {formatCurrency(profitLoss)}
              </div>
              <div className="text-sm text-gray-600">
                {t("financials.summary.netProfit")}
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
            {transactions.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-gray-500">
                <p>No transactions found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">
                      {t("financials.transactions.date")}
                    </TableHead>
                    <TableHead>
                      {t("financials.transactions.description")}
                    </TableHead>
                    <TableHead className="w-[110px]">
                      {t("financials.transactions.type")}
                    </TableHead>
                    <TableHead className="w-[140px] text-right">
                      {t("financials.transactions.amount")}
                    </TableHead>
                    <TableHead className="w-[120px]">
                      {t("financials.transactions.status")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const isIncome = transaction.type === "income"
                    const isRefund = transaction.type === "refund"
                    const isExpense = transaction.type === "expense"
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-sm text-gray-600">
                          {getDateOnly(transaction.date)}
                        </TableCell>
                        <TableCell className="font-medium wrap-break-word whitespace-normal text-gray-900">
                          {transaction.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              isIncome
                                ? "bg-emerald-100 text-emerald-700"
                                : isExpense
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {t(
                              `financials.transactions.types.${transaction.type}`,
                              {
                                defaultValue:
                                  transaction.type.charAt(0).toUpperCase() +
                                  transaction.type.slice(1),
                              }
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            isIncome
                              ? "text-emerald-600"
                              : isRefund
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {isIncome ? "+" : ""}
                          {formatCurrency(transaction.amount, true)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              transaction.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {t(
                              `financials.transactions.statuses.${transaction.status}`,
                              {
                                defaultValue:
                                  transaction.status.charAt(0).toUpperCase() +
                                  transaction.status.slice(1),
                              }
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
