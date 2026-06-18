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
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

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
  const { t } = useSocialsTranslation()
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
          ? t("expenses.expenseDialog.successUpdate", {
              defaultValue: "Expense updated successfully",
            })
          : t("expenses.expenseDialog.successAdd", {
              defaultValue: "Expense added successfully",
            })
      )
      queryClient.invalidateQueries({ queryKey: ["financeSummary", socialId] })
      queryClient.invalidateQueries({ queryKey: ["socialExpenses", socialId] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(
        error.message ||
          (expenseToEdit
            ? t("expenses.expenseDialog.errorUpdate", {
                defaultValue: "Failed to update expense",
              })
            : t("expenses.expenseDialog.errorAdd", {
                defaultValue: "Failed to add expense",
              }))
      )
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {expenseToEdit
              ? t("expenses.expenseDialog.editTitle", {
                  defaultValue: "Edit Expense",
                })
              : t("expenses.expenseDialog.addTitle", {
                  defaultValue: "Add Extra Expense",
                })}
          </DialogTitle>
          <DialogDescription>
            {expenseToEdit
              ? t("expenses.expenseDialog.editDescription", {
                  defaultValue: "Modify the details of this extra expense.",
                })
              : t("expenses.expenseDialog.addDescription", {
                  defaultValue:
                    "Add an extra expense like water, balls, ice, etc.",
                })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">
              {t("expenses.expenseDialog.titleLabel", {
                defaultValue: "Title",
              })}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("expenses.expenseDialog.titlePlaceholder", {
                defaultValue: "e.g., Water, Shuttlecocks",
              })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">
              {t("expenses.expenseDialog.amountLabel", {
                defaultValue: "Amount (VND)",
              })}
            </Label>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              value={amount ? Number(amount).toLocaleString("vi-VN") : ""}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "")
                setAmount(rawValue)
              }}
              placeholder={t("expenses.expenseDialog.amountPlaceholder", {
                defaultValue: "e.g., 50,000",
              })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">
              {t("expenses.expenseDialog.descriptionLabel", {
                defaultValue: "Description",
              })}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("expenses.expenseDialog.descriptionPlaceholder", {
                defaultValue: "Provide a brief description...",
              })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("expenses.expenseDialog.cancel", {
              defaultValue: "Cancel",
            })}
          </Button>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !title || !amount}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {expenseToEdit
              ? t("expenses.expenseDialog.update", {
                  defaultValue: "Update Expense",
                })
              : t("expenses.expenseDialog.save", {
                  defaultValue: "Add Expense",
                })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
