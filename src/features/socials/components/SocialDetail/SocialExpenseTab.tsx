"use client"

import { Download, Plus, RefreshCcw, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import { CourtBookingExpensesCard } from "./CourtBookingExpensesCard"
import { expenseRows, participantRows, timelineRows } from "./expense-data"
import { ExpenseBreakdownCard } from "./ExpenseBreakdownCard"
import { ExpenseSummaryGrid } from "./ExpenseSummaryGrid"
import { FinancialTimelineCard } from "./FinancialTimelineCard"
import { ParticipantPaymentTrackingCard } from "./ParticipantPaymentTrackingCard"
import { PaymentInformationCard } from "./PaymentInformationCard"
import { SocialExpenseTabSkeleton } from "./SocialExpenseTabSkeleton"

export default function SocialExpenseTab() {
  const totalCourtExpense = expenseRows.reduce((sum, row) => sum + row.cost, 0)
  const confirmedParticipants = 12
  const totalParticipants = 16
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
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  Court-booking only
                </Badge>
                <Badge className="rounded-full px-3 py-1">
                  Host financial view
                </Badge>
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Expense Management
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Review booking costs, calculate participant shares, track
                  payments, and keep the social event financially organized.
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" type="button">
                <Plus className="size-4" />
                Add Expense
              </Button>
              <Button variant="secondary" className="gap-2" type="button">
                <RefreshCcw className="size-4" />
                Refresh Expenses
              </Button>
              <Button className="gap-2" type="button">
                <Download className="size-4" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          <ExpenseSummaryGrid
            totalCourtExpense={totalCourtExpense}
            confirmedParticipants={confirmedParticipants}
            totalParticipants={totalParticipants}
            costPerParticipant={costPerParticipant}
            collectedAmount={collectedAmount}
            outstandingAmount={outstandingAmount}
          />

          <div className="grid gap-4 rounded-2xl border border-border/60 bg-background p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="size-4 text-primary" />
                Collection progress
              </div>
              <Progress value={collectionProgress} className="h-2.5" />
              <p className="text-xs text-muted-foreground">
                {collectionProgress}% of the current court-booking total has
                been collected.
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                Extensible expense model:
              </span>{" "}
              court bookings are the only source today, but the layout supports
              future expense types without changing the dashboard structure.
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
        <div className="space-y-6">
          <CourtBookingExpensesCard
            expenseRows={expenseRows}
            totalCourtExpense={totalCourtExpense}
          />

          <ExpenseBreakdownCard
            totalCourtExpense={totalCourtExpense}
            confirmedParticipants={confirmedParticipants}
            costPerParticipant={costPerParticipant}
          />

          <ParticipantPaymentTrackingCard participants={participantRows} />
        </div>

        <div className="space-y-6">
          <PaymentInformationCard collectionProgress={collectionProgress} />
          <FinancialTimelineCard timelineRows={timelineRows} />
        </div>
      </section>
    </div>
  )
}
