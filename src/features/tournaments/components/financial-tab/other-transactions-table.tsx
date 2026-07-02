"use client"

import { Trash2 } from "lucide-react"
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

import { useFinanceStore } from "../../stores/use-finance-store"
import type { Finance } from "../../types/finance"
import { AddTransactionDialog } from "./add-transaction-dialog"

const isRegistrationFee = (transaction: Finance) => {
  const desc = transaction.description.toLowerCase()
  return (
    desc.includes("registration") ||
    desc.includes("đăng ký") ||
    desc.includes("dang ky") ||
    desc.includes("lệ phí") ||
    desc.includes("le phi")
  )
}

export function OtherTransactionsTable() {
  const { t, i18n } = useTournamentTranslation()
  const { tournamentId, transactions, loadData, deleteTransaction } =
    useFinanceStore()

  const otherTransactions = transactions.filter((t) => !isRegistrationFee(t))

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

  const handleDelete = async (transactionId: string) => {
    if (
      !window.confirm(
        t("financials.transactions.deleteConfirm", {
          defaultValue: "Are you sure you want to delete this transaction?",
        })
      )
    ) {
      return
    }

    try {
      const res = await deleteTransaction(transactionId)
      if (res.success) {
        toast.success(
          t("financials.transactions.successDelete", {
            defaultValue: "Transaction deleted successfully!",
          })
        )
      } else {
        toast.error(
          res.error ||
            t("financials.transactions.failedDelete", {
              defaultValue: "Failed to delete transaction",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("financials.transactions.failedDelete", {
          defaultValue: "Failed to delete transaction",
        })
      )
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>
          {t("financials.transactions.otherTitle", {
            defaultValue: "Other Finance Transactions",
          })}
        </CardTitle>
        {tournamentId && (
          <AddTransactionDialog
            tournamentId={tournamentId}
            onSuccess={loadData}
          />
        )}
      </CardHeader>
      <CardContent>
        {otherTransactions.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-gray-500">
            <p>No other finance transactions found</p>
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
                <TableHead className="w-[80px] text-right">
                  {t("financials.transactions.actions", {
                    defaultValue: "Actions",
                  })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherTransactions.map((transaction) => {
                const isIncome = transaction.type === "income"
                const isRefund = transaction.type === "refund"
                const isExpense = transaction.type === "expense"
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm text-gray-600 dark:text-zinc-400">
                      {getDateOnly(transaction.date)}
                    </TableCell>
                    <TableCell className="font-medium wrap-break-word whitespace-normal text-gray-900 dark:text-zinc-100">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          isIncome
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : isExpense
                              ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
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
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isRefund
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isIncome ? "+" : ""}
                      {formatCurrency(transaction.amount, true)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          transaction.status === "completed"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
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
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
