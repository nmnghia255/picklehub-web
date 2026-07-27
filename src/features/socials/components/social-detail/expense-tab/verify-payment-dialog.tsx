"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
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
import type { TransactionStatus } from "@/features/socials/types/payment"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface VerifyPaymentDialogProps {
  socialId: string
  participantId: string
  paymentId: string
  receiptUrl?: string | null
  amountDue: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VerifyPaymentDialog({
  socialId,
  participantId,
  paymentId,
  receiptUrl,
  amountDue,
  open,
  onOpenChange,
}: VerifyPaymentDialogProps) {
  const { t } = useSocialsTranslation()
  const queryClient = useQueryClient()
  const [amountPaid, setAmountPaid] = useState(String(amountDue))

  const formatDisplayValue = (val: string) => {
    if (!val) return ""
    const num = Number(val)
    if (isNaN(num)) return ""
    return new Intl.NumberFormat("vi-VN").format(num)
  }

  const handleAmountChange = (val: string) => {
    const rawVal = val.replace(/\D/g, "")
    setAmountPaid(rawVal)
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (status: TransactionStatus) =>
      verifyPaymentAction(
        socialId,
        participantId,
        paymentId,
        status,
        Number(amountPaid)
      ),
    onSuccess: () => {
      toast.success(
        t("expenses.verifyPaymentDialog.success") || "Payment verified"
      )
      queryClient.invalidateQueries({
        queryKey: ["socialParticipants", socialId],
      })
      queryClient.invalidateQueries({ queryKey: ["financeSummary", socialId] })
      onOpenChange(false)
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : String(error)
      if (
        msg.includes("409") ||
        msg.toLowerCase().includes("conflict") ||
        msg.toLowerCase().includes("already")
      ) {
        toast.info("Giao dịch thanh toán này đã được xác nhận trước đó.")
        queryClient.invalidateQueries({
          queryKey: ["socialParticipants", socialId],
        })
        queryClient.invalidateQueries({
          queryKey: ["financeSummary", socialId],
        })
        onOpenChange(false)
        return
      }
      toast.error(msg || t("expenses.verifyPaymentDialog.error"))
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{t("expenses.verifyPaymentDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("expenses.verifyPaymentDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 pt-4">
          {!paymentId && (
            <div className="rounded-md bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              Không tìm thấy mã giao dịch thanh toán cần xác minh hoặc giao dịch
              đã được xử lý.
            </div>
          )}
          {receiptUrl ? (
            <div className="flex justify-center">
              <img
                src={receiptUrl}
                alt={t("expenses.tracking.paymentProof")}
                className="max-h-64 rounded-md border object-contain"
              />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed bg-muted text-sm text-muted-foreground">
              {t("expenses.verifyPaymentDialog.noReceipt")}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="amountPaid">
              {t("expenses.verifyPaymentDialog.amountLabel")}
            </Label>
            <Input
              id="amountPaid"
              type="text"
              inputMode="numeric"
              value={formatDisplayValue(amountPaid)}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder={t("expenses.verifyPaymentDialog.amountPlaceholder")}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("expenses.verifyPaymentDialog.cancel")}
          </Button>
          <Button
            variant="outline"
            onClick={() => mutate("REJECTED")}
            disabled={isPending || !paymentId}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {t("expenses.verifyPaymentDialog.reject")}
          </Button>
          <Button
            onClick={() => mutate("CONFIRMED")}
            disabled={isPending || !amountPaid || !paymentId}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("expenses.verifyPaymentDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
