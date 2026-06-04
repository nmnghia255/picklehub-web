"use client"

import { CheckCircle2 } from "lucide-react"
import React from "react"

import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"
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
  const { t } = useSportCenterTranslation()
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
          <p className="font-semibold">{t("booking.payment.payWithCredit")}</p>
          <p className="text-sm text-muted-foreground">
            {t("booking.payment.payWithCreditDesc")}
          </p>
          <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm">
            {creditLoading ? (
              <p className="text-muted-foreground">
                {t("booking.payment.loadingCredit")}
              </p>
            ) : creditError ? (
              <p className="text-destructive">{creditError}</p>
            ) : isEnough ? (
              <p>
                {t("booking.payment.creditBalanceIs")}
                <span className="font-semibold">
                  {formatCurrencyVnd(availableCredit)}
                </span>
                {t("booking.payment.andEnough")}
              </p>
            ) : (
              <p>
                {t("booking.payment.creditBalanceIs")}
                <span className="font-semibold">
                  {formatCurrencyVnd(availableCredit)}
                </span>
                {t("booking.payment.needToPayMore")}
                <span className="font-semibold text-foreground">
                  {formatCurrencyVnd(remainingAmount)}
                </span>
                {t("booking.payment.toCompleteTotal")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreditPaymentInfo
