"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  createExpenseAction,
  updateExpenseAction,
} from "@/features/socials/actions/expense-actions"
import type { Expense } from "@/features/socials/types/expense"

interface AddExpenseDialogProps {
  socialId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseToEdit?: Expense | null
}

export function AddExpenseDialog({
  socialId,
  open,
  onOpenChange,
  expenseToEdit,
}: AddExpenseDialogProps) {
  const queryClient = useQueryClient()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")

  // Pre-fill when editing
  useEffect(() => {
    if (open) {
      if (expenseToEdit) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTitle(expenseToEdit.title)
        setDescription(expenseToEdit.description || "")
        setAmount(String(expenseToEdit.amount))
      } else {
        setTitle("")
        setDescription("")
        setAmount("")
      }
    }
  }, [open, expenseToEdit])

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        title,
        description,
        amount: Number(amount),
      }
      return expenseToEdit
        ? updateExpenseAction(socialId, expenseToEdit.id, payload)
        : createExpenseAction(socialId, payload)
    },
    onSuccess: () => {
      toast.success(
        expenseToEdit
          ? "Expense updated successfully"
          : "Expense added successfully"
      )
      queryClient.invalidateQueries({ queryKey: ["financeSummary", socialId] })
      queryClient.invalidateQueries({ queryKey: ["socialExpenses", socialId] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(
        error.message ||
          (expenseToEdit ? "Failed to update expense" : "Failed to add expense")
      )
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {expenseToEdit ? "Edit Expense" : "Add Manual Expense"}
          </DialogTitle>
          <DialogDescription>
            {expenseToEdit
              ? "Update the details of this extra expense."
              : "Add extra expenses like water, balls, or referee fees."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water and Snacks"
            />
          </div>
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
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about this expense..."
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
          <Button
            onClick={() => mutate()}
            disabled={isPending || !title || !amount}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {expenseToEdit ? "Update Expense" : "Save Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
