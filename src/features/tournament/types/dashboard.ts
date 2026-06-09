import type { ElementType } from "react"

export interface DashboardStat {
  label: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: ElementType
}

export interface RecentActivity {
  id: number
  type: "registration" | "match" | "payment" | "update"
  message: string
  time: string
}

export interface FinancialTransaction {
  id: number
  date: string
  description: string
  type: "income" | "expense" | "refund"
  amount: number
  status: "completed" | "pending"
}

export interface RevenueData {
  id: string
  month: string
  revenue: number
}

export interface ExpenseData {
  id: string
  name: string
  value: number
  color: string
}
