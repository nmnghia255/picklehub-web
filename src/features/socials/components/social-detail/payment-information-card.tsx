"use client"

import { Copy, PenLine } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { paymentPlan } from "../../mock-data/expense-data"
import type { ListSocialResponse as Social } from "../../types/social"

export function PaymentInformationCard({
  social,
  showEditAction = true,
}: {
  social?: Social | null
  showEditAction?: boolean
}) {
  const { t } = useSocialsTranslation()
  const [copied, setCopied] = React.useState(false)

  const accountNumber = social?.paymentCode || paymentPlan.accountNumber
  const bankName = paymentPlan.bankName // Fallback since social doesn't have bank name
  const paymentNote = social?.paymentNote || paymentPlan.paymentNote
  const qrUrl = social?.paymentQrUrl

  const handleCopyPaymentCode = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">
          {t("expenses.paymentInfo.title")}
        </CardTitle>
        <CardDescription className="mt-1">
          {t("expenses.paymentInfo.description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_176px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {t("expenses.paymentInfo.bankName")}
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {bankName}
              </p>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {t("expenses.paymentInfo.accountNumber")}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <p className="mt-2 text-base font-semibold text-foreground">
                  {accountNumber}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {t("expenses.paymentInfo.paymentNote")}
              </p>
              <p className="mt-2 text-base font-medium text-foreground">
                {paymentNote}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-card p-4 text-center">
            <div className="relative flex size-32 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-4 shadow-inner">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Payment QR"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid w-full grid-cols-6 gap-1">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <span
                      key={index}
                      className={`aspect-square rounded-[3px] ${
                        index % 2 === 0 || index % 7 === 0
                          ? "bg-foreground"
                          : "bg-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {t("expenses.paymentInfo.qrPreviewLabel")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("expenses.paymentInfo.qrDescription")}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`grid gap-2 ${showEditAction ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}
        >
          {showEditAction && (
            <Button variant="outline" className="gap-2" type="button">
              <PenLine className="size-4" />
              {t("expenses.paymentInfo.edit")}
            </Button>
          )}
          {showEditAction && (
            <Button
              variant="secondary"
              className="gap-2"
              type="button"
              onClick={handleCopyPaymentCode}
            >
              <Copy className="size-4" />
              {copied
                ? t("expenses.paymentInfo.copied")
                : t("expenses.paymentInfo.copyAccountNumber")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
