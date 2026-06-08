export type PaymentStatus = "paid" | "unpaid" | "refunded"

// Backwards-compatible alias used across the expense components
export function formatCurrencyVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/[\u202f\u00a0\s]/g, " ")
}

export function getPaymentStatusTone(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
    case "overpaid":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "unpaid":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "partially_paid":
      return "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300"
    case "refunded":
      return "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300"
    default:
      return "border-muted/20 bg-muted/10 text-muted-foreground"
  }
}
