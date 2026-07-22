import type { User } from "./social"

export interface Expense {
  id: string
  socialId: string
  title: string
  description: string
  amount: number
  receiptUrl?: string
  expenseDate?: string
  createdById: string
  createdAt: string
}

export interface CreateExpenseRequest {
  title: string
  description: string
  amount: number
  receiptUrl?: string
  expenseDate?: string
}

export interface ListExpensesResponse extends Expense {
  createdBy: User
}
