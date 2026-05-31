export type PaymentStatus = "paid" | "unpaid" | "refunded"

// Backwards-compatible alias used across the expense components
export function formatCurrencyVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export function getPaymentStatusTone(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "unpaid":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "refunded":
      return "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300"
  }
}
