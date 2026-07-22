"use client"

import { useQuery } from "@tanstack/react-query"
import { Calculator, TrendingUp } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { isConfirmedLikeSocialParticipantStatus } from "@/features/socials/utils"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { listExpensesAction } from "../../../actions/expense-actions"
import {
  getFinanceSummaryAction,
  listCourtBookingsAction,
} from "../../../actions/finance-actions"
import type { SocialDetail } from "../../../types/social"
import type { SocialParticipant } from "../../../types/social"
import { CourtBookingExpensesCard } from "./court-booking-expenses-card"
import { ExpenseSummaryGrid } from "./expense-summary-grid"
import { ExtraExpensesCard } from "./extra-expenses-card"
import { ParticipantPaymentTrackingCard } from "./participant-payment-tracking-card"
import { PricingCalculatorDialog } from "./pricing-calculator-dialog"
import { SocialExpenseTabSkeleton } from "./social-expense-tab-skeleton"

export default function SocialExpenseTab({
  social,
  initialParticipants,
}: {
  social: SocialDetail | null
  initialParticipants: SocialParticipant[]
}) {
  const { t } = useSocialsTranslation()
  const socialId = social?.id || ""

  const [isPricingOpen, setIsPricingOpen] = useState(false)

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["financeSummary", socialId],
    queryFn: () => getFinanceSummaryAction(socialId),
    enabled: !!socialId,
  })

  const { data: courtBookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["courtBookings", socialId],
    queryFn: () => listCourtBookingsAction(socialId),
    enabled: !!socialId,
  })

  const { data: manualExpenses } = useQuery({
    queryKey: ["socialExpenses", socialId],
    queryFn: () => listExpensesAction(socialId),
    enabled: !!socialId,
  })
  const courtBookingRows = Array.isArray(courtBookings) ? courtBookings : []
  const manualExpenseRows = Array.isArray(manualExpenses) ? manualExpenses : []

  const isLoading = isLoadingSummary || isLoadingBookings

  if (isLoading || !summary) {
    return <SocialExpenseTabSkeleton />
  }

  const totalCourtBookingsCost = courtBookingRows.reduce(
    (acc, curr) => acc + curr.bookingCost,
    0
  )
  const totalExtraExpensesCost = manualExpenseRows.reduce(
    (acc, curr) => acc + curr.amount,
    0
  )
  const calculatedTotalExpense =
    totalCourtBookingsCost > 0 || totalExtraExpensesCost > 0
      ? totalCourtBookingsCost + totalExtraExpensesCost
      : summary.totalExpense

  const collectionProgress =
    calculatedTotalExpense > 0
      ? Math.min(
          100,
          Math.round((summary.collectedAmount / calculatedTotalExpense) * 100)
        )
      : summary.collectionProgress

  const confirmedParticipantsCount =
    initialParticipants.length > 0
      ? initialParticipants.filter((p) =>
          isConfirmedLikeSocialParticipantStatus(p.status)
        ).length
      : summary.participants.joinedCount

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

            <div className="flex flex-col flex-wrap gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="gap-2"
                type="button"
                onClick={() => setIsPricingOpen(true)}
                disabled={social?.status !== "DRAFT"}
              >
                <Calculator className="size-4" />
                {t("expenses.actions.setPricing")}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Expense Summary */}
        <CardContent className="space-y-5 p-6">
          <ExpenseSummaryGrid
            totalExpense={calculatedTotalExpense}
            confirmedParticipants={confirmedParticipantsCount}
            extraExpense={totalExtraExpensesCost}
            paidMembers={summary.paidMembersCount}
            collectedAmount={summary.collectedAmount}
            outstandingAmount={summary.outstandingAmount}
          />

          <div className="grid gap-4 rounded-2xl border border-border/60 bg-background p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="size-4 text-primary" />
                {t("expenses.progress.title")}
              </div>
              <Progress value={collectionProgress} className="h-2.5" />
              <p className="text-sm text-muted-foreground">
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
            expenseRows={courtBookingRows}
            totalCourtExpense={
              courtBookingRows.reduce(
                (acc, curr) => acc + curr.bookingCost,
                0
              ) || 0
            }
          />
          <ExtraExpensesCard
            socialId={socialId}
            expenses={manualExpenseRows}
            isLocked={social?.status !== "DRAFT"}
          />
        </div>

        <ParticipantPaymentTrackingCard
          socialId={socialId}
          isCompleted={social?.status === "COMPLETED"}
          initialParticipants={initialParticipants}
        />
      </section>

      <PricingCalculatorDialog
        socialId={socialId}
        open={isPricingOpen}
        onOpenChange={setIsPricingOpen}
      />
    </div>
  )
}
