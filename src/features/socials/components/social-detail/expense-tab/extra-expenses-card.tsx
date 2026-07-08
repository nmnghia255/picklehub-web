"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Edit, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteExpenseAction } from "@/features/socials/actions/expense-actions"
import type { Expense } from "@/features/socials/types/expense"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import { AddExpenseDialog } from "./add-expense-dialog"

export function ExtraExpensesCard({
  socialId,
  expenses,
  isLocked,
}: {
  socialId: string
  expenses: Expense[]
  isLocked?: boolean
}) {
  const { t } = useSocialsTranslation()
  const queryClient = useQueryClient()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)

  const { mutate: deleteExpense, isPending: isDeleting } = useMutation({
    mutationFn: (expenseId: string) => deleteExpenseAction(socialId, expenseId),
    onSuccess: () => {
      toast.success(
        t("expenses.extra.deleteConfirm.success", {
          defaultValue: "Expense deleted successfully",
        })
      )
      queryClient.invalidateQueries({ queryKey: ["socialExpenses", socialId] })
      queryClient.invalidateQueries({ queryKey: ["financeSummary", socialId] })
      setExpenseToDelete(null)
    },
    onError: (error) => {
      toast.error(
        error.message ||
          t("expenses.extra.deleteConfirm.error", {
            defaultValue: "Failed to delete expense",
          })
      )
    },
  })

  const openAdd = () => {
    setExpenseToEdit(null)
    setIsDialogOpen(true)
  }

  const openEdit = (expense: Expense) => {
    setExpenseToEdit(expense)
    setIsDialogOpen(true)
  }

  const confirmDelete = (expenseId: string) => {
    setExpenseToDelete(expenseId)
  }

  return (
    <>
      <Card className="gap-0 overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-xl">
                {t("expenses.extra.title", { defaultValue: "Extra Expenses" })}
              </CardTitle>
              <CardDescription className="mt-1">
                {t("expenses.extra.description", {
                  defaultValue:
                    "Additional manual expenses for this event (water, balls, etc.)",
                })}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={openAdd}
              disabled={isLocked}
            >
              <Plus className="size-4" />
              {t("expenses.actions.addExpense", {
                defaultValue: "Add Expense",
              })}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-110 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
                <TableRow>
                  <TableHead className="px-6 py-4">
                    {t("expenses.extra.headers.title", {
                      defaultValue: "Title",
                    })}
                  </TableHead>
                  <TableHead className="px-6 py-4">
                    {t("expenses.extra.headers.description", {
                      defaultValue: "Description",
                    })}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right">
                    {t("expenses.extra.headers.amount", {
                      defaultValue: "Amount",
                    })}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right">
                    {t("expenses.extra.headers.actions", {
                      defaultValue: "Actions",
                    })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="px-6 py-4 font-medium">
                        {expense.title}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">
                        {expense.description || "-"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right font-medium">
                        {formatCurrencyVnd(expense.amount)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(expense)}
                          disabled={isLocked}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => confirmDelete(expense.id)}
                          disabled={
                            isLocked ||
                            (isDeleting && expenseToDelete === expense.id)
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      {t("expenses.extra.empty", {
                        defaultValue: "No extra expenses logged.",
                      })}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddExpenseDialog
        socialId={socialId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        expenseToEdit={expenseToEdit}
      />

      <AlertDialog
        open={!!expenseToDelete}
        onOpenChange={(open) => !open && setExpenseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("expenses.extra.deleteConfirm.title", {
                defaultValue: "Are you sure?",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("expenses.extra.deleteConfirm.description", {
                defaultValue:
                  "This action cannot be undone. This will permanently delete the expense from the event.",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("expenses.extra.deleteConfirm.cancel", {
                defaultValue: "Cancel",
              })}
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault()
                if (expenseToDelete) {
                  deleteExpense(expenseToDelete)
                }
              }}
            >
              {isDeleting
                ? t("expenses.extra.deleteConfirm.deleting", {
                    defaultValue: "Deleting...",
                  })
                : t("expenses.extra.deleteConfirm.delete", {
                    defaultValue: "Delete",
                  })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
