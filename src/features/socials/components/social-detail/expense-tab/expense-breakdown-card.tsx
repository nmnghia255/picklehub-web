import { ArrowRight } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

export function ExpenseBreakdownCard({
  totalCourtExpense,
  confirmedParticipants,
  extraExpense,
}: {
  totalCourtExpense: number
  confirmedParticipants: number
  extraExpense: number
}) {
  const { t } = useSocialsTranslation()

  return (
    <Card>
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">
          {t("expenses.breakdown.title")}
        </CardTitle>
        <CardDescription className="mt-1">
          {t("expenses.breakdown.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {t("expenses.breakdown.totalExpense")}
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {formatCurrencyVnd(totalCourtExpense)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("expenses.breakdown.totalExpenseDescription")}
            </p>
          </div>

          <div className="flex items-center justify-center py-2 md:py-0">
            <ArrowRight className="hidden size-5 text-muted-foreground md:block" />
            <span className="rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground md:hidden">
              {t("expenses.breakdown.split")}
            </span>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {t("expenses.breakdown.confirmedParticipants")}
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {confirmedParticipants}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("expenses.breakdown.onlyConfirmedPlayers")}
            </p>
          </div>

          <div className="flex items-center justify-center py-2 md:py-0">
            <ArrowRight className="hidden size-5 text-muted-foreground md:block" />
            <span className="rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground md:hidden">
              {t("expenses.breakdown.calculate")}
            </span>
          </div>

          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {t("expenses.breakdown.extraExpense")}
            </p>
            <p className="mt-3 text-2xl font-semibold text-primary">
              {formatCurrencyVnd(extraExpense)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("expenses.breakdown.extraExpenseDescription")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
