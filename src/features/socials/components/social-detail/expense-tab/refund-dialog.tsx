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
import { refundPaymentAction } from "@/features/socials/actions/payment-actions"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface RefundDialogProps {
  socialId: string
  participantId: string
  maxRefundAmount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RefundDialog({
  socialId,
  participantId,
  maxRefundAmount,
  open,
  onOpenChange,
}: RefundDialogProps) {
  const { t } = useSocialsTranslation()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState(String(maxRefundAmount))

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      refundPaymentAction(socialId, participantId, Number(amount)),
    onSuccess: () => {
      toast.success(t("expenses.refundDialog.success"))
      queryClient.invalidateQueries({
        queryKey: ["socialParticipants", socialId],
      })
      queryClient.invalidateQueries({ queryKey: ["financeSummary", socialId] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || t("expenses.refundDialog.error"))
    },
  })

  const numericAmount = Number(amount)
  const isOverMax = numericAmount > maxRefundAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("expenses.refundDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("expenses.refundDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">
              {t("expenses.refundDialog.amountLabel")}
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={maxRefundAmount}
            />
            {isOverMax && (
              <p className="text-xs text-destructive">
                {t("expenses.refundDialog.maxError", {
                  maxRefundAmount,
                })}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("expenses.refundDialog.cancel")}
          </Button>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !amount || isOverMax}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("expenses.refundDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
