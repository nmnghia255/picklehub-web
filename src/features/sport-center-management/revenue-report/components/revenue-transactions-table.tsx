"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"
import { cn } from "@/lib/utils"

import type {
  RevenueTransaction,
  RevenueTransactionsPagination,
} from "../types"
import { formatCurrencyVnd, formatDate } from "../utils/format"
import { RevenueEmptyState } from "./revenue-empty-state"

function resolveStatusTone(status: RevenueTransaction["status"]) {
  switch (status) {
    case "SETTLED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
    case "PENDING_REVIEW":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700"
    case "REJECTED":
      return "border-rose-500/20 bg-rose-500/10 text-rose-700"
    case "VOIDED":
      return "border-slate-500/20 bg-slate-500/10 text-slate-700"
    default:
      return "border-border bg-muted text-foreground"
  }
}

function resolveTransactionDate(transaction: RevenueTransaction) {
  return (
    transaction.receivedAt ||
    transaction.reviewedAt ||
    transaction.createdAt ||
    ""
  )
}

function resolveFee(transaction: RevenueTransaction) {
  return transaction.fee ?? transaction.platformFee ?? null
}

export function RevenueTransactionsTable({
  transactions,
  pagination,
  limit,
  offset,
  loading,
  onRowClick,
  onOffsetChange,
}: {
  transactions: RevenueTransaction[]
  pagination: RevenueTransactionsPagination | null
  limit: number
  offset: number
  loading: boolean
  onRowClick: (transaction: RevenueTransaction) => void
  onOffsetChange: (nextOffset: number) => void
}) {
  const { t } = useSportCenterManagementTranslation()
  const resolveStatusLabel = (status: RevenueTransaction["status"]) => {
    switch (status) {
      case "SETTLED":
        return t("revenue.status.settled")
      case "PENDING_REVIEW":
        return t("revenue.status.pendingReview")
      case "REJECTED":
        return t("revenue.status.rejected")
      case "VOIDED":
        return t("revenue.status.voided")
      default:
        return status
    }
  }
  if (transactions.length === 0 && !loading) {
    return <RevenueEmptyState title={t("revenue.empty.transactions")} />
  }

  const total = pagination?.total ?? transactions.length
  const start = total === 0 ? 0 : offset + 1
  const end = Math.min(offset + limit, total)
  const canPrev = offset > 0
  const canNext = offset + limit < total

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <Table className="table-auto">
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
            <TableRow>
              <TableHead>{t("revenue.transactions.id")}</TableHead>
              <TableHead>{t("revenue.transactions.center")}</TableHead>
              <TableHead>{t("revenue.transactions.paidAt")}</TableHead>
              <TableHead>{t("revenue.transactions.status")}</TableHead>
              <TableHead className="text-right">
                {t("revenue.transactions.total")}
              </TableHead>
              <TableHead className="text-right">
                {t("revenue.transactions.fee")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const fee = resolveFee(transaction)
              return (
                <TableRow
                  key={transaction.id}
                  className={cn(
                    "group cursor-pointer transition-colors hover:bg-accent/50"
                  )}
                  onClick={() => onRowClick(transaction)}
                >
                  <TableCell className="font-medium text-foreground">
                    {transaction.id}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {transaction.center?.name ?? transaction.centerId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.bookingId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(resolveTransactionDate(transaction))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={resolveStatusTone(transaction.status)}
                    >
                      {resolveStatusLabel(transaction.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrencyVnd(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {fee === null ? "-" : formatCurrencyVnd(fee)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/60 px-4 py-3 text-sm text-muted-foreground">
        <span>{t("revenue.transactions.showing", { start, end, total })}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOffsetChange(Math.max(offset - limit, 0))}
            disabled={!canPrev}
          >
            <ChevronLeft className="size-4" />
            {t("common.previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOffsetChange(offset + limit)}
            disabled={!canNext}
          >
            {t("common.next")}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
