"use client"

import { Check, HandCoins, Undo } from "lucide-react"
import React from "react"

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
  const latestPayment = participant.payments?.[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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

        <div className="space-y-4 py-2">
          {/* Details list */}
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

          {/* Proof Image */}
          {participant.paymentStatus === "PAID" && (
            <div className="space-y-2">
              <span className="block text-sm font-medium text-muted-foreground">
                {t("expenses.tracking.paymentProof")}
              </span>
              {latestPayment?.receiptUrl ? (
                <div className="overflow-hidden rounded-lg border bg-muted/30 p-2">
                  <a
                    href={latestPayment.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-video w-full overflow-hidden rounded-md border bg-black/5"
                  >
                    <img
                      src={latestPayment.receiptUrl}
                      alt={t("expenses.tracking.paymentProof")}
                      className="h-full w-full object-contain transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-md bg-background/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
                        {t("expenses.tracking.viewFullImage")}
                      </span>
                    </div>
                  </a>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  {t("expenses.tracking.noReceiptImage")}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex flex-row flex-wrap justify-end gap-2 sm:space-x-0">
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
