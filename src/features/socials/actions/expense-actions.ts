"use server"

import { ExpenseService } from "../api/expense-service"
import type { CreateExpenseRequest } from "../types/expense"

export async function createExpenseAction(
  socialId: string,
  request: CreateExpenseRequest
) {
  return ExpenseService.createExpense(socialId, request)
}

export async function listExpensesAction(socialId: string) {
  return ExpenseService.listExpenses(socialId)
}

export async function getExpenseDetailAction(
  socialId: string,
  expenseId: string
) {
  return ExpenseService.getExpenseDetail(socialId, expenseId)
}

export async function updateExpenseAction(
  socialId: string,
  expenseId: string,
  request: CreateExpenseRequest
) {
  return ExpenseService.updateExpense(socialId, expenseId, request)
}

export async function deleteExpenseAction(socialId: string, expenseId: string) {
  return ExpenseService.deleteExpense(socialId, expenseId)
}
