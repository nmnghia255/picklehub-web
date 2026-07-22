"use client"

import { Check, HandCoins, Undo } from "lucide-react"
import React, { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getPaymentStatusLabel } from "@/features/socials/utils"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { cn } from "@/lib/utils"
import { formatCurrencyVnd, getPaymentStatusTone } from "@/utils/expense-utils"

import type { SocialParticipant } from "../../../types/social"

interface ParticipantDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participant: SocialParticipant
  onVerify: () => void
  onRecordCash: () => void
  onRefund: () => void
}

export function ParticipantDetailDialog({
  open,
  onOpenChange,
  participant,
  onVerify,
  onRecordCash,
  onRefund,
}: ParticipantDetailDialogProps) {
  const { t } = useSocialsTranslation()
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>(
    {}
  )

  const isPaid =
    participant.paymentStatus === "PAID" ||
    participant.paymentStatus === "OVERPAID"

  const payments = participant.payments ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-135">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            {participant.user.name || t("expenses.tracking.unknownUser")}
            {participant.isHost && (
              <Badge variant="outline" className="text-[10px]">
                {t("labels.host")}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {participant.user.email || t("expenses.tracking.noEmail")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Details summary */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-4 text-sm">
            <div>
              <span className="block text-xs font-medium text-muted-foreground">
                {t("expenses.tracking.headers.status")}
              </span>
              <Badge
                className={cn(
                  "mt-1",
                  getPaymentStatusTone(participant.paymentStatus)
                )}
              >
                {getPaymentStatusLabel(participant.paymentStatus, t)}
              </Badge>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground">
                {t("expenses.tracking.headers.totalFee")}
              </span>
              <span className="mt-1 block font-semibold">
                {formatCurrencyVnd(participant.totalFee)}
              </span>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground">
                {t("expenses.tracking.headers.amountPaid")}
              </span>
              <span className="mt-1 block font-semibold text-emerald-600">
                {formatCurrencyVnd(
                  Math.max(0, participant.totalFee - participant.amountDue)
                )}
              </span>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground">
                {t("expenses.tracking.headers.amountDue")}
              </span>
              <span
                className={cn(
                  "mt-1 block font-semibold",
                  participant.amountDue > 0
                    ? "text-destructive"
                    : participant.amountDue < 0
                      ? "text-emerald-600"
                      : ""
                )}
              >
                {participant.amountDue > 0 ? (
                  formatCurrencyVnd(participant.amountDue)
                ) : participant.amountDue < 0 ? (
                  <span>
                    {t("expenses.tracking.creditPrefix")}
                    {formatCurrencyVnd(Math.abs(participant.amountDue))}
                  </span>
                ) : (
                  "0"
                )}
              </span>
            </div>
          </div>

          {/* Payment History List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {t("expenses.tracking.paymentHistory")}
              </h3>
              <span className="text-xs text-muted-foreground">
                {t("expenses.tracking.results_other").replace(
                  "{{count}}",
                  String(payments.length)
                )}
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                {t("expenses.tracking.noPaymentHistory")}
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment, index) => {
                  const paymentKey = payment.id || `payment-${index}`
                  const isRefund = payment.transactionType === "REFUND"
                  const formattedDate = payment.createdAt
                    ? new Date(payment.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : null

                  return (
                    <div
                      key={paymentKey}
                      className="space-y-2 rounded-lg border bg-card p-3 text-sm shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isRefund ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {isRefund
                              ? t("expenses.tracking.transactionRefund")
                              : t("expenses.tracking.transactionPayment")}
                          </Badge>
                          <Badge
                            className={cn(
                              "text-[11px]",
                              getPaymentStatusTone(payment.status)
                            )}
                          >
                            {getPaymentStatusLabel(payment.status, t)}
                          </Badge>
                        </div>
                        <span
                          className={cn(
                            "font-semibold",
                            isRefund ? "text-destructive" : "text-emerald-600"
                          )}
                        >
                          {isRefund ? "-" : "+"}
                          {formatCurrencyVnd(payment.amount)}
                        </span>
                      </div>

                      {formattedDate && (
                        <div className="text-xs text-muted-foreground">
                          {formattedDate}
                        </div>
                      )}

                      {payment.receiptUrl && !failedImageIds[paymentKey] && (
                        <div className="mt-2 overflow-hidden rounded-md border bg-muted/30 p-1.5">
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block aspect-video w-full overflow-hidden rounded-md border bg-black/5"
                          >
                            <img
                              src={payment.receiptUrl}
                              alt={t("expenses.tracking.paymentProof")}
                              className="h-full w-full object-contain transition-transform group-hover:scale-[1.02]"
                              onError={() =>
                                setFailedImageIds((prev) => ({
                                  ...prev,
                                  [paymentKey]: true,
                                }))
                              }
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="rounded-md bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
                                {t("expenses.tracking.viewFullImage")}
                              </span>
                            </div>
                          </a>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-row flex-wrap justify-end gap-2">
          {!isPaid && (
            <>
              <Button
                variant="outline"
                onClick={onVerify}
                className="flex-1 sm:flex-initial"
              >
                <Check className="mr-2 size-4" />
                {t("expenses.tracking.actions.verifyReceipt")}
              </Button>
              <Button
                variant="outline"
                onClick={onRecordCash}
                className="flex-1 sm:flex-initial"
              >
                <HandCoins className="mr-2 size-4" />
                {t("expenses.tracking.actions.recordCash")}
              </Button>
            </>
          )}
          {participant.amountDue < 0 && (
            <Button
              variant="outline"
              onClick={onRefund}
              className="flex-1 text-destructive hover:bg-destructive/10 sm:flex-initial"
            >
              <Undo className="mr-2 size-4" />
              {t("expenses.tracking.actions.issueRefund")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
