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

  const isLoading = isLoadingSummary || isLoadingBookings

  if (isLoading || !summary) {
    return <SocialExpenseTabSkeleton />
  }

  const collectionProgress = summary.collectionProgress

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/10 bg-linear-to-br from-background via-background to-primary/5 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div>
                <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t("expenses.title", { defaultValue: "Financial Dashboard" })}
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {t("expenses.subtitle", {
                    defaultValue: "Monitor event finances and expenses.",
                  })}
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
                {t("expenses.actions.setPricing", {
                  defaultValue: "Set Pricing",
                })}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Expense Summary */}
        <CardContent className="space-y-5 p-6">
          <ExpenseSummaryGrid
            totalCourtExpense={summary.totalExpense}
            confirmedParticipants={summary.participants.joinedCount}
            totalParticipants={summary.participants.maxSlots}
            extraExpense={
              courtBookings
                ? summary.totalExpense -
                  courtBookings.reduce((acc, curr) => acc + curr.bookingCost, 0)
                : 0
            }
            paidMembers={summary.paidMembersCount}
            collectedAmount={summary.collectedAmount}
            outstandingAmount={summary.outstandingAmount}
          />

          <div className="grid gap-4 rounded-2xl border border-border/60 bg-background p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="size-4 text-primary" />
                {t("expenses.progress.title", {
                  defaultValue: "Collection Progress",
                })}
              </div>
              <Progress value={collectionProgress} className="h-2.5" />
              <p className="text-sm text-muted-foreground">
                {t("expenses.progress.description", {
                  count: collectionProgress,
                  defaultValue: `${collectionProgress}% of target collected`,
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
            expenseRows={courtBookings || []}
            totalCourtExpense={
              courtBookings?.reduce((acc, curr) => acc + curr.bookingCost, 0) ||
              0
            }
          />
          <ExtraExpensesCard
            socialId={socialId}
            expenses={manualExpenses || []}
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
