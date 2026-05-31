"use client"

import { CheckCircle2 } from "lucide-react"
import React from "react"

import { formatCurrencyVnd } from "@/utils/expense-utils"

type CreditPaymentInfoProps = {
  creditBalance: number | null
  totalAmount: number
  creditLoading?: boolean
  creditError?: string
}

export function CreditPaymentInfo({
  creditBalance,
  totalAmount,
  creditLoading = false,
  creditError = "",
}: CreditPaymentInfoProps) {
  const availableCredit = creditBalance ?? 0
  const remainingAmount = Math.max(totalAmount - availableCredit, 0)
  const isEnough = availableCredit >= totalAmount

  return (
    <div className="rounded-2xl border border-dashed p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckCircle2 className="size-4" />
        </div>
        <div className="space-y-2">
          <p className="font-semibold">Thanh toán bằng credit</p>
          <p className="text-sm text-muted-foreground">
            Hệ thống sẽ dùng số credit khả dụng của bạn để tạo booking.
          </p>
          <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm">
            {creditLoading ? (
              <p className="text-muted-foreground">Đang tải số dư credit...</p>
            ) : creditError ? (
              <p className="text-destructive">{creditError}</p>
            ) : isEnough ? (
              <p>
                Số dư credit của bạn là{" "}
                <span className="font-semibold">
                  {formatCurrencyVnd(availableCredit)}
                </span>{" "}
                và đã đủ để thanh toán.
              </p>
            ) : (
              <p>
                Số dư credit của bạn là{" "}
                <span className="font-semibold">
                  {formatCurrencyVnd(availableCredit)}
                </span>
                . Bạn cần thanh toán thêm{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrencyVnd(remainingAmount)}
                </span>{" "}
                để đủ tổng tiền.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreditPaymentInfo
