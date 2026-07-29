"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, ImageOff, Loader2, XCircle } from "lucide-react"
import React, { useState } from "react"
import { toast } from "sonner"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { verifyPaymentAction } from "@/features/socials/actions/payment-actions"
import {
  getEffectiveAmountDue,
  getPaymentStatusLabel,
} from "@/features/socials/utils"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { cn } from "@/lib/utils"
import { formatCurrencyVnd, getPaymentStatusTone } from "@/utils/expense-utils"

import type { VerifyPaymentAction } from "../../../types/payment"
import type { SocialParticipant } from "../../../types/social"

interface ParticipantDetailDialogProps {
  socialId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  participant: SocialParticipant
}

export function ParticipantDetailDialog({
  socialId,
  open,
  onOpenChange,
  participant,
}: ParticipantDetailDialogProps) {
  const { t } = useSocialsTranslation()
  const queryClient = useQueryClient()
  const [note, setNote] = useState("")
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set())

  const effectiveDue = getEffectiveAmountDue(participant)
  const isPendingReview = participant.paymentStatus === "PENDING_REVIEW"

  // ảnh mới nhất trước (reverse của mảng gốc)
  const receiptUrls = [...(participant.receiptUrls ?? [])].reverse()

  const { mutate, isPending } = useMutation({
    mutationFn: (action: VerifyPaymentAction | "REJECTED") => {
      if (action === "REJECTED") {
        return verifyPaymentAction(socialId, participant.id, "PAID", "REJECTED")
      }
      return verifyPaymentAction(socialId, participant.id, action, note)
    },
    onSuccess: (_, action) => {
      toast.success(
        action === "REJECTED"
          ? t("expenses.verifyPaymentDialog.rejectSuccess")
          : t("expenses.verifyPaymentDialog.success")
      )
      queryClient.invalidateQueries({
        queryKey: ["socialParticipants", socialId],
      })
      queryClient.invalidateQueries({ queryKey: ["financeSummary", socialId] })
      onOpenChange(false)
      setNote("")
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error(msg)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
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

        <div className="space-y-5 py-2">
          {/* Tóm tắt số tiền */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-4 text-sm">
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
                {formatCurrencyVnd(participant.amountPaid)}
              </span>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground">
                {t("expenses.tracking.headers.amountDue")}
              </span>
              <span
                className={cn(
                  "mt-1 block font-semibold",
                  effectiveDue > 0 ? "text-destructive" : ""
                )}
              >
                {effectiveDue > 0 ? formatCurrencyVnd(effectiveDue) : "0"}
              </span>
            </div>
          </div>

          {/* Ảnh minh chứng thanh toán */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {t("expenses.tracking.paymentHistory")}
              </h3>
              <span className="text-xs text-muted-foreground">
                {receiptUrls.length} {receiptUrls.length === 1 ? "ảnh" : "ảnh"}
              </span>
            </div>

            {receiptUrls.length === 0 ? (
              <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
                {t("expenses.tracking.noPaymentHistory")}
              </div>
            ) : (
              <div className="space-y-3">
                {receiptUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="overflow-hidden rounded-lg border bg-muted/30"
                  >
                    {failedUrls.has(url) ? (
                      <div className="flex h-24 items-center justify-center gap-2 text-xs text-muted-foreground">
                        <ImageOff className="size-4" />
                        {t("expenses.verifyPaymentDialog.imageLoadFailed")}
                      </div>
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block"
                      >
                        <img
                          src={url}
                          alt={`${t("expenses.tracking.paymentProof")} ${receiptUrls.length - index}`}
                          className="max-h-72 w-full object-contain transition-transform group-hover:scale-[1.01]"
                          onError={() =>
                            setFailedUrls((prev) => new Set(prev).add(url))
                          }
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="rounded-md bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
                            {t("expenses.tracking.viewFullImage")}
                          </span>
                        </div>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ghi chú xác nhận — chỉ khi PENDING_REVIEW */}
          {isPendingReview && (
            <div className="grid gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <Label
                htmlFor="detailVerifyNote"
                className="text-xs text-muted-foreground"
              >
                {t("expenses.verifyPaymentDialog.noteLabel")}
              </Label>
              <Input
                id="detailVerifyNote"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("expenses.verifyPaymentDialog.notePlaceholder")}
                className="h-8 text-sm"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="flex-1 sm:flex-initial"
          >
            {t("common.close", "Đóng")}
          </Button>

          {/* Từ chối + Xác nhận — chỉ khi PENDING_REVIEW */}
          {isPendingReview && (
            <>
              <Button
                variant="outline"
                onClick={() => mutate("REJECTED")}
                disabled={isPending}
                className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-initial"
              >
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 size-4" />
                )}
                {t("expenses.verifyPaymentDialog.reject", "Từ chối")}
              </Button>

              <Button
                onClick={() => mutate("PAID")}
                disabled={isPending}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 sm:flex-initial"
              >
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 size-4" />
                )}
                {t("expenses.verifyPaymentDialog.paidAction", "Xác nhận")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
