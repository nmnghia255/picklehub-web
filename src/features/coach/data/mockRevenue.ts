export type RevenuePoint = {
  label: string
  revenue: number
}

export type RevenueTransaction = {
  id: string
  date: string
  student: string
  amount: number
}

export const revenuePoints: RevenuePoint[] = [
  { label: "01", revenue: 1200000 },
  { label: "02", revenue: 1650000 },
  { label: "03", revenue: 980000 },
  { label: "04", revenue: 2100000 },
  { label: "05", revenue: 1850000 },
  { label: "06", revenue: 2500000 },
  { label: "07", revenue: 1750000 },
]

export const revenueTransactions: RevenueTransaction[] = [
  { id: "rv-1", date: "2026-04-01", student: "An Nguyễn", amount: 1200000 },
  { id: "rv-2", date: "2026-04-02", student: "Linh Trần", amount: 1500000 },
  { id: "rv-3", date: "2026-04-03", student: "Phúc Lê", amount: 900000 },
  { id: "rv-4", date: "2026-04-04", student: "Khánh Bùi", amount: 1100000 },
]
