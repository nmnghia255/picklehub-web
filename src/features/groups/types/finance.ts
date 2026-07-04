export type TransactionStatus = "PENDING_REVIEW" | "VERIFIED" | "REJECTED"
export type DebtStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERPAID"

export interface GuestPayment {
  id: string
  guestId: string
  billedToId: string
  requiredFee: number
  amountPaid: number
  status: DebtStatus
  guest?: {
    id: string
    name: string
  } | null
  billedToUser?: {
    id: string
    name: string
    email: string
  } | null
}

export interface FinanceSummary {
  totalExpense: number
  totalRequiredCollection: number
  totalExpectedRevenue: number
  totalCollected: number
  outstandingAmount: number
  netBalance: number
  creditBalanceList: CreditBalanceEntry[]
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

export interface Transaction {
  id: string
  groupId: string
  userId: string
  amount: number
  receiptUrl?: string | null
  status: TransactionStatus
  verifiedById?: string | null
  verifiedAt?: string | null
  createdAt: string
  updatedAt: string
  user?: FinanceUserSummary | null
}

export interface Allocation {
  id: string
  expenseId: string
  userId: string
  requiredFee: number
  paidAmount: number
  status: DebtStatus
  user?: FinanceUserSummary | null
  guestCount?: number | null
  guestFee?: number | null
}

export interface ExpenseItem {
  id: string
  groupId: string
  title: string
  description?: string | null
  totalAmount: number
  receiptUrl?: string | null
  expenseDate: string
  createdById: string
  createdAt: string
  updatedAt: string
  createdBy?: FinanceUserSummary | null
  allocations?: Allocation[]
  guestPayments?: GuestPayment[]
}

export interface UnpaidPayment {
  id: string
  expenseTitle: string
  requiredFee: number
  amountPaid: number
  debt: number
  status: DebtStatus
  isGuestPayment?: boolean
  guestName?: string | null
}

export interface MyDebt {
  totalRequired: number
  totalPaid: number
  netBalance: number
  debt: number
  unpaidPayments: UnpaidPayment[]
}

export interface CreditBalanceEntry {
  userId: string
  creditBalance: number
  user?: FinanceUserSummary | null
}

export interface ListTransactionsResult {
  data: Transaction[]
  meta: FinancePaginationMeta
  message?: string
}

export interface ListExpensesResult {
  data: ExpenseItem[]
  meta: FinancePaginationMeta
  message?: string
}

export interface ListCreditBalancesResult {
  data: CreditBalanceEntry[]
  meta: FinancePaginationMeta
  message?: string
}

export interface UnpaidPaymentItem {
  id: string
  expenseTitle: string
  requiredFee: number
  amountPaid: number
  debt: number
  status: string
  createdAt: string
  isGuestPayment?: boolean
  guestName?: string | null
}

export interface GroupDebtItem {
  userId: string
  creditBalance: number
  totalRequired: number
  totalPaid: number
  netBalance: number
  debt: number
  unpaidPayments: UnpaidPaymentItem[]
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string
  }
}

export interface ListGroupDebtsResult {
  data: GroupDebtItem[]
  meta: FinancePaginationMeta
  message?: string
}
