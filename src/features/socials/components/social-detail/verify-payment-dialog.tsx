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
  const queryClient = useQueryClient()
  const [amountPaid, setAmountPaid] = useState(String(amountDue))

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
      toast.success("Payment verified")
      queryClient.invalidateQueries({
        queryKey: ["socialParticipants", socialId],
      })
      queryClient.invalidateQueries({ queryKey: ["financeSummary", socialId] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to verify payment")
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Verify Payment Receipt</DialogTitle>
          <DialogDescription>
            Check the bank app to verify the transaction. Adjust the actual
            amount received if necessary.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {receiptUrl ? (
            <div className="flex justify-center">
              <img
                src={receiptUrl}
                alt="Receipt"
                className="max-h-64 rounded-md border object-contain"
              />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed bg-muted">
              No receipt uploaded
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="amountPaid">Amount Received (VND)</Label>
            <Input
              id="amountPaid"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => mutate("UNPAID")}
            disabled={isPending}
          >
            Reject
          </Button>
          <Button
            onClick={() => mutate("PAID")}
            disabled={isPending || !amountPaid}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
