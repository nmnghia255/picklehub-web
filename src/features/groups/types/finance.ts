export interface FinanceSummary {
  totalFunds: string | number
  totalCollected: string | number
  totalExpenses: string | number
  netBalance: string | number
  totalOwed: string | number
  totalPending: string | number
  fundCount: number
  expenseCount: number
}

export interface FinancePaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface FinanceUserSummary {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

export interface FundPayment {
  id: string
  fundId: string
  userId: string
  amountPaid: string | number
  paymentReceiptUrl?: string | null
  status: string
  verifiedById?: string | null
  paidAt?: string | null
}

export interface FundItem {
  id: string
  groupId: string
  title: string
  description?: string | null
  amount: string | number
  deadline?: string | null
  createdById: string
  createdAt: string
  updatedAt?: string
  createdBy?: FinanceUserSummary | null
  payments?: FundPayment[]
}

export interface ExpenseItem {
  id: string
  groupId: string
  title: string
  description?: string | null
  amount: string | number
  receiptUrl?: string | null
  expenseDate?: string | null
  createdById: string
  createdAt: string
  updatedAt?: string
  createdBy?: FinanceUserSummary | null
}

export interface ListFundsResult {
  data: FundItem[]
  meta: FinancePaginationMeta
  message?: string
}

export interface ListMyFundsResult {
  data: FundItem[]
  meta: FinancePaginationMeta
  message?: string
}

export interface ListExpensesResult {
  data: ExpenseItem[]
  meta: FinancePaginationMeta
  message?: string
}
