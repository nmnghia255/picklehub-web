"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Gift, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

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
import type { VerifyPaymentAction } from "@/features/socials/types/payment"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface VerifyPaymentDialogProps {
  socialId: string
  participantId: string
  participantName?: string
  receiptUrl?: string | null
  amountDue?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VerifyPaymentDialog({
  socialId,
  participantId,
  participantName,
  receiptUrl,
  amountDue = 0,
  open,
  onOpenChange,
}: VerifyPaymentDialogProps) {
  const { t } = useSocialsTranslation()
  const queryClient = useQueryClient()
  const [note, setNote] = useState("")

  const { mutate, isPending } = useMutation({
    mutationFn: (action: VerifyPaymentAction | "REJECTED") => {
      if (action === "REJECTED") {
        // If rejected, call verify payment or reject
        return verifyPaymentAction(socialId, participantId, "PAID", "REJECTED")
      }
      return verifyPaymentAction(socialId, participantId, action, note)
    },
    onSuccess: () => {
      toast.success(
        t("expenses.verifyPaymentDialog.success") || "Xác nhận thành công!"
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
      toast.error(msg || t("expenses.verifyPaymentDialog.error"))
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-500" />
            {t("expenses.verifyPaymentDialog.title", "Xác nhận thanh toán")}
          </DialogTitle>
          {participantName && (
            <DialogDescription>
              {t("expenses.verifyPaymentDialog.memberLabel", {
                name: participantName,
              })}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-4 pt-2">
          {/* Hiển thị ảnh bill nếu người chơi đã upload */}
          {receiptUrl ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {t("expenses.verifyPaymentDialog.receiptLabel")}
              </Label>
              <div className="flex justify-center rounded-xl border bg-muted/30 p-2">
                <img
                  src={receiptUrl}
                  alt={t("expenses.tracking.paymentProof")}
                  className="max-h-64 rounded-lg object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-center text-xs text-muted-foreground">
              {t("expenses.verifyPaymentDialog.noReceipt")}
            </div>
          )}

          {amountDue > 0 && (
            <div className="flex items-center justify-between rounded-xl border bg-card p-3 text-sm">
              <span className="text-muted-foreground">
                {t("expenses.verifyPaymentDialog.amountDueLabel")}
              </span>
              <span className="font-semibold text-destructive">
                {amountDue.toLocaleString("vi-VN")} đ
              </span>
            </div>
          )}

          {/* Ghi chú — chỉ hiện khi có bill để xác nhận */}
          {receiptUrl && (
            <div className="grid gap-1.5">
              <Label htmlFor="verifyNote" className="text-xs">
                {t("expenses.verifyPaymentDialog.noteLabel")}
              </Label>
              <Input
                id="verifyNote"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("expenses.verifyPaymentDialog.notePlaceholder")}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("common.cancel", "Hủy")}
          </Button>

          {/* Nếu có bill: Nút Từ Chối bill kém chất lượng / sai số tiền */}
          {receiptUrl ? (
            <Button
              variant="outline"
              onClick={() => mutate("REJECTED")}
              disabled={isPending}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {t("expenses.verifyPaymentDialog.reject", "Từ chối")}
            </Button>
          ) : (
            /* Nếu không có bill: Nút Miễn Phí (WAIVE) */
            <Button
              variant="outline"
              onClick={() => mutate("WAIVE")}
              disabled={isPending}
              className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400"
            >
              {isPending ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Gift className="mr-1.5 size-4" />
              )}
              {t("expenses.verifyPaymentDialog.waiveAction")}
            </Button>
          )}

          {/* Action chính: Duyệt Thu Tiền (PAID) */}
          <Button
            onClick={() => mutate("PAID")}
            disabled={isPending}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 size-4" />
            )}
            {t("expenses.verifyPaymentDialog.paidAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
