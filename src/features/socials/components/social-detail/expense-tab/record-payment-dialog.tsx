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
import { recordPaymentAction } from "@/features/socials/actions/payment-actions"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface RecordPaymentDialogProps {
  socialId: string
  participantId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultAmount?: number
}

export function RecordPaymentDialog({
  socialId,
  participantId,
  open,
  onOpenChange,
  defaultAmount,
}: RecordPaymentDialogProps) {
  const { t } = useSocialsTranslation()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState(
    defaultAmount ? String(defaultAmount) : ""
  )

  const formatDisplayValue = (val: string) => {
    if (!val) return ""
    const num = Number(val)
    if (isNaN(num)) return ""
    return new Intl.NumberFormat("vi-VN").format(num)
  }

  const handleAmountChange = (val: string) => {
    const rawVal = val.replace(/\D/g, "")
    setAmount(rawVal)
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      recordPaymentAction(socialId, participantId, Number(amount)),
    onSuccess: () => {
      toast.success(
        t("expenses.recordPaymentDialog.success") ||
          "Payment recorded successfully"
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
          t("expenses.recordPaymentDialog.error") ||
          "Failed to record payment"
      )
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("expenses.recordPaymentDialog.title", {
              defaultValue: "Record Cash Payment",
            })}
          </DialogTitle>
          <DialogDescription>
            {t("expenses.recordPaymentDialog.description", {
              defaultValue:
                "Manually record a cash payment for this participant.",
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">
              {t("expenses.recordPaymentDialog.amountLabel", {
                defaultValue: "Amount (VND)",
              })}
            </Label>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              value={formatDisplayValue(amount)}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="e.g. 50.000"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("expenses.recordPaymentDialog.cancel", {
              defaultValue: "Cancel",
            })}
          </Button>
          <Button onClick={() => mutate()} disabled={isPending || !amount}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("expenses.recordPaymentDialog.recordPayment", {
              defaultValue: "Record Payment",
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
