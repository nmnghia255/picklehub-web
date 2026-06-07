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
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState(String(maxRefundAmount))

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      refundPaymentAction(socialId, participantId, Number(amount)),
    onSuccess: () => {
      toast.success("Refund processed successfully")
      queryClient.invalidateQueries({
        queryKey: ["socialParticipants", socialId],
      })
      queryClient.invalidateQueries({ queryKey: ["financeSummary", socialId] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process refund")
    },
  })

  const numericAmount = Number(amount)
  const isOverMax = numericAmount > maxRefundAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Issue Refund</DialogTitle>
          <DialogDescription>
            Confirm you have manually transferred the money back to the user,
            then record it here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount to Refund (VND)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={maxRefundAmount}
            />
            {isOverMax && (
              <p className="text-xs text-destructive">
                Amount cannot exceed available credit balance ({maxRefundAmount}
                )
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
            Cancel
          </Button>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !amount || isOverMax}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Confirm Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
