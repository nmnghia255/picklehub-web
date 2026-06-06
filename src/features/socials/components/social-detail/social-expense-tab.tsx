"use client"

import { Download, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import {
  expenseRows,
  participantRows,
  timelineRows,
} from "../../mock-data/expense-data"
import { CourtBookingExpensesCard } from "./court-booking-expenses-card"
import { ExpenseSummaryGrid } from "./expense-summary-grid"
import { FinancialTimelineCard } from "./financial-timeline-card"
import { ParticipantPaymentTrackingCard } from "./participant-payment-tracking-card"
import { PaymentInformationCard } from "./payment-information-card"
import { SocialExpenseTabSkeleton } from "./social-expense-tab-skeleton"

export default function SocialExpenseTab() {
  const { t } = useSocialsTranslation()
  const totalCourtExpense = expenseRows.reduce((sum, row) => sum + row.cost, 0)
  const confirmedParticipants = 12
  const totalParticipants = 16
  const paidMembers = participantRows.filter(
    (participant) => participant.paymentStatus === "paid"
  ).length
  const costPerParticipant = Math.round(
    totalCourtExpense / confirmedParticipants
  )
  const collectedAmount = 900000
  const outstandingAmount = totalCourtExpense - collectedAmount
  const collectionProgress = Math.min(
    100,
    Math.round((collectedAmount / totalCourtExpense) * 100)
  )

  const isLoading = false

  if (isLoading) {
    return <SocialExpenseTabSkeleton />
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/10 bg-linear-to-br from-background via-background to-primary/5 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div>
                <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t("expenses.title")}
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {t("expenses.subtitle")}
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-col flex-wrap gap-2">
              {/* <Button variant="outline" className="gap-2" type="button">
                <Plus className="size-4" />
                {t("expenses.actions.addExpense")}
              </Button> */}
              {/* <Button variant="secondary" className="gap-2" type="button">
                <RefreshCcw className="size-4" />
                Refresh Expenses
              </Button> */}
              <Button className="gap-2" type="button">
                <Download className="size-4" />
                {t("expenses.actions.exportReport")}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Expense Summary */}
        <CardContent className="space-y-5 p-6">
          <ExpenseSummaryGrid
            totalCourtExpense={totalCourtExpense}
            confirmedParticipants={confirmedParticipants}
            totalParticipants={totalParticipants}
            costPerParticipant={costPerParticipant}
            paidMembers={paidMembers}
            collectedAmount={collectedAmount}
            outstandingAmount={outstandingAmount}
          />

          <div className="grid gap-4 rounded-2xl border border-border/60 bg-background p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="size-4 text-primary" />
                {t("expenses.progress.title")}
              </div>
              <Progress value={collectionProgress} className="h-2.5" />
              <p className="text-xs text-muted-foreground">
                {t("expenses.progress.description", {
                  count: collectionProgress,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Details */}
      <section className="grid gap-6">
        <div className="space-y-6">
          <CourtBookingExpensesCard
            expenseRows={expenseRows}
            totalCourtExpense={totalCourtExpense}
          />

          {/* <ExpenseBreakdownCard
            totalCourtExpense={totalCourtExpense}
            confirmedParticipants={confirmedParticipants}
            costPerParticipant={costPerParticipant}
          /> */}

          <ParticipantPaymentTrackingCard participants={participantRows} />
        </div>

        <div className="space-y-6">
          <PaymentInformationCard />
          <FinancialTimelineCard timelineRows={timelineRows} />
        </div>
      </section>
    </div>
  )
}
