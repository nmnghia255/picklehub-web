"use client"

import { Badge } from "@/components/ui/badge"
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

export function RegistrationFeeTable() {
  const { t, i18n } = useTournamentTranslation()
  const { transactions } = useFinanceStore()

  const registrationTransactions = transactions.filter(isRegistrationFee)

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("financials.transactions.registrationTitle", {
            defaultValue: "Registration Fee Transactions",
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {registrationTransactions.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-gray-500">
            <p>
              {t("financials.transactions.emptyRegistration", {
                defaultValue: "No registration fee transactions found",
              })}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-30">
                  {t("financials.transactions.date")}
                </TableHead>
                <TableHead>
                  {t("financials.transactions.description")}
                </TableHead>
                <TableHead className="w-27.5">
                  {t("financials.transactions.type")}
                </TableHead>
                <TableHead className="w-35 text-right">
                  {t("financials.transactions.amount")}
                </TableHead>
                <TableHead className="w-30">
                  {t("financials.transactions.status")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrationTransactions.map((transaction) => {
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
