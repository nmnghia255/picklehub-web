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
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState(
    defaultAmount ? String(defaultAmount) : ""
  )

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      recordPaymentAction(socialId, participantId, Number(amount)),
    onSuccess: () => {
      toast.success("Payment recorded successfully")
      queryClient.invalidateQueries({
        queryKey: ["socialParticipants", socialId],
      })
      queryClient.invalidateQueries({ queryKey: ["financeSummary", socialId] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record payment")
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Cash Payment</DialogTitle>
          <DialogDescription>
            Record a cash payment collected at the court.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (VND)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50000"
            />
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
          <Button onClick={() => mutate()} disabled={isPending || !amount}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
