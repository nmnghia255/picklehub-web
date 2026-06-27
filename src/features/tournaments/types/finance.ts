export type FinanceStatus = "completed" | "pending"

export type FinanceType = "income" | "expense" | "refund"

export interface FinanceRequest {
  description: string
  type: FinanceType
  amount: number
  status: FinanceStatus
}

export interface Finance extends FinanceRequest {
  id: string
  tournamentId: string
  date: string
}

export interface FinanceSummary {
  summary: {
    totalIncome: number
    totalExpense: number
    totalRefund: number
    netProfit: number
  }
  transactionCount: number
}
