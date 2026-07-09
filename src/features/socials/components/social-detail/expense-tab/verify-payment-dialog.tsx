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
import type { PaymentStatus } from "@/features/socials/types/payment"
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
    mutationFn: (status: PaymentStatus) =>
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
      toast.error(
        error.message ||
          t("expenses.verifyPaymentDialog.error") ||
          "Failed to verify payment"
      )
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("expenses.verifyPaymentDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("expenses.verifyPaymentDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
            onClick={() => mutate("UNPAID")}
            disabled={isPending}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {t("expenses.verifyPaymentDialog.reject")}
          </Button>
          <Button
            onClick={() => mutate("PAID")}
            disabled={isPending || !amountPaid}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("expenses.verifyPaymentDialog.approve")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
