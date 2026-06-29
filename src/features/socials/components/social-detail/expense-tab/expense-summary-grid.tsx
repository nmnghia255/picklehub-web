import {
  AlertCircle,
  BadgeCheck,
  CircleDollarSign,
  CreditCard,
  Users,
  Wallet,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

function ExpenseStatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  iconClassName: string
}) {
  return (
    <Card className="border-border/60 bg-card/90 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col justify-between gap-3 p-4 lg:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground sm:text-sm">
              {label}
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight lg:text-2xl">
              {value}
            </p>
          </div>
          <div className={iconClassName}>
            <Icon className="size-4 lg:size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ExpenseSummaryGrid({
  totalCourtExpense,
  confirmedParticipants,
  extraExpense,
  paidMembers,
  collectedAmount,
  outstandingAmount,
}: {
  totalCourtExpense: number
  confirmedParticipants: number
  extraExpense: number
  paidMembers: number
  collectedAmount: number
  outstandingAmount: number
}) {
  const { t } = useSocialsTranslation()

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <ExpenseStatCard
        label={t("expenses.summary.totalExpense")}
        value={formatCurrencyVnd(totalCourtExpense)}
        iconClassName="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 lg:size-10"
        icon={Wallet}
      />
      <ExpenseStatCard
        label={t("expenses.summary.participants")}
        value={confirmedParticipants.toString()}
        iconClassName="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 lg:size-10"
        icon={Users}
      />
      <ExpenseStatCard
        label={t("expenses.summary.extraExpense", {
          defaultValue: "Extra Expense",
        })}
        value={formatCurrencyVnd(extraExpense)}
        iconClassName="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 lg:size-10"
        icon={CircleDollarSign}
      />
      <ExpenseStatCard
        label={t("expenses.summary.paidMembers")}
        value={String(paidMembers)}
        iconClassName="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 lg:size-10"
        icon={CreditCard}
      />
      <ExpenseStatCard
        label={t("expenses.summary.collectedAmount")}
        value={formatCurrencyVnd(collectedAmount)}
        iconClassName="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 lg:size-10"
        icon={BadgeCheck}
      />
      <ExpenseStatCard
        label={t("expenses.summary.outstandingAmount")}
        value={formatCurrencyVnd(outstandingAmount)}
        iconClassName="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 lg:size-10"
        icon={AlertCircle}
      />
    </div>
  )
}
