"use client"

import { Loader2, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { createFinanceTransactionAction } from "../../actions/finance-actions"
import type { FinanceStatus, FinanceType } from "../../types/finance"

interface AddTransactionDialogProps {
  tournamentId: string
  onSuccess: () => void
}

export function AddTransactionDialog({
  tournamentId,
  onSuccess,
}: AddTransactionDialogProps) {
  const { t, i18n } = useTournamentTranslation()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [type, setType] = useState<FinanceType>("expense")
  const [amountStr, setAmountStr] = useState("")
  const [status, setStatus] = useState<FinanceStatus>("completed")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAmountChange = (val: string) => {
    // Remove non-digit characters
    const digitsOnly = val.replace(/\D/g, "")
    if (digitsOnly === "") {
      setAmountStr("")
      return
    }
    const num = parseInt(digitsOnly, 10)
    const locale = i18n.language === "vi" ? "vi-VN" : "en-US"
    setAmountStr(num.toLocaleString(locale))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error(
        t("financials.transactions.validationDesc", {
          defaultValue: "Please enter a description",
        })
      )
      return
    }

    const parsedAmount = parseInt(amountStr.replace(/\D/g, ""), 10)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error(
        t("financials.transactions.validationAmount", {
          defaultValue: "Please enter a valid amount greater than 0",
        })
      )
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createFinanceTransactionAction(tournamentId, {
        description,
        type,
        amount: parsedAmount,
        status,
      })

      if (res.success) {
        toast.success(
          t("financials.transactions.successAdd", {
            defaultValue: "Transaction added successfully!",
          })
        )
        // Reset form
        setDescription("")
        setType("expense")
        setAmountStr("")
        setStatus("completed")
        setOpen(false)
        onSuccess()
      } else {
        toast.error(
          res.error ||
            t("financials.transactions.failedAdd", {
              defaultValue: "Failed to add transaction",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("financials.transactions.failedAdd", {
          defaultValue: "Failed to add transaction",
        })
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          {t("financials.transactions.add", {
            defaultValue: "Add Transaction",
          })}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("financials.transactions.dialogTitle", {
              defaultValue: "Add New Transaction",
            })}
          </DialogTitle>
          <DialogDescription>
            {t("financials.transactions.dialogDesc", {
              defaultValue: "Record a new financial entry for this tournament.",
            })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">
              {t("financials.transactions.fieldDesc", {
                defaultValue: "Description",
              })}
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("financials.transactions.descPlaceholder", {
                defaultValue: "e.g., Referee salaries, Balls purchase",
              })}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="w-full space-y-2">
              <Label htmlFor="type">
                {t("financials.transactions.fieldType", {
                  defaultValue: "Type",
                })}
              </Label>
              <Select
                value={type}
                onValueChange={(val) => setType(val as FinanceType)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">
                    {t("financials.transactions.types.expense", {
                      defaultValue: "Expense",
                    })}
                  </SelectItem>
                  <SelectItem value="income">
                    {t("financials.transactions.types.income", {
                      defaultValue: "Income",
                    })}
                  </SelectItem>
                  <SelectItem value="refund">
                    {t("financials.transactions.types.refund", {
                      defaultValue: "Refund",
                    })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                {t("financials.transactions.fieldStatus", {
                  defaultValue: "Status",
                })}
              </Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as FinanceStatus)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">
                    {t("financials.transactions.statuses.completed", {
                      defaultValue: "Completed",
                    })}
                  </SelectItem>
                  <SelectItem value="pending">
                    {t("financials.transactions.statuses.pending", {
                      defaultValue: "Pending",
                    })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              {t("financials.transactions.fieldAmount", {
                defaultValue: "Amount",
              })}
            </Label>
            <div className="relative flex items-center">
              <Input
                id="amount"
                type="text"
                value={amountStr}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="pr-12 text-left font-medium"
                disabled={isSubmitting}
              />
              <div className="pointer-events-none absolute right-3 text-sm font-semibold text-gray-400">
                VND
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              {t("financials.transactions.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("financials.transactions.submit", {
                defaultValue: "Save Transaction",
              })}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
