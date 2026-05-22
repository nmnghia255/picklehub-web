import { ArrowRight } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { formatVnd } from "./expense-utils"

export function ExpenseBreakdownCard({
  totalCourtExpense,
  confirmedParticipants,
  costPerParticipant,
}: {
  totalCourtExpense: number
  confirmedParticipants: number
  costPerParticipant: number
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">Expense Breakdown</CardTitle>
        <CardDescription className="mt-1">
          The host can see exactly how the per-participant amount is calculated.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Expense</p>
            <p className="mt-3 text-2xl font-semibold">
              {formatVnd(totalCourtExpense)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Sum of all booked court sessions.
            </p>
          </div>

          <div className="flex items-center justify-center py-2 md:py-0">
            <ArrowRight className="hidden size-5 text-muted-foreground md:block" />
            <span className="rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground md:hidden">
              Split
            </span>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Confirmed Participants
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {confirmedParticipants}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Only confirmed players are used in the calculation.
            </p>
          </div>

          <div className="flex items-center justify-center py-2 md:py-0">
            <ArrowRight className="hidden size-5 text-muted-foreground md:block" />
            <span className="rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground md:hidden">
              Calculate
            </span>
          </div>

          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Cost Per Participant
            </p>
            <p className="mt-3 text-2xl font-semibold text-primary">
              {formatVnd(costPerParticipant)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatVnd(totalCourtExpense)} ÷ {confirmedParticipants}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
