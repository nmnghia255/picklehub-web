import {
  AlertCircle,
  BadgeCheck,
  CircleDollarSign,
  Users,
  Wallet,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

import { formatVnd } from "./expense-utils"

function ExpenseStatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="border-border/60 bg-card/90 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {value}
            </p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function ExpenseSummaryGrid({
  totalCourtExpense,
  confirmedParticipants,
  totalParticipants,
  costPerParticipant,
  collectedAmount,
  outstandingAmount,
}: {
  totalCourtExpense: number
  confirmedParticipants: number
  totalParticipants: number
  costPerParticipant: number
  collectedAmount: number
  outstandingAmount: number
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <ExpenseStatCard
        label="Total Expense"
        value={formatVnd(totalCourtExpense)}
        description="All court bookings added to the social event"
        icon={Wallet}
      />
      <ExpenseStatCard
        label="Participants"
        value={`${confirmedParticipants} / ${totalParticipants}`}
        description="Confirmed players participating in the cost split"
        icon={Users}
      />
      <ExpenseStatCard
        label="Cost Per Participant"
        value={formatVnd(costPerParticipant)}
        description="Calculated from the current confirmed participant count"
        icon={CircleDollarSign}
      />
      <ExpenseStatCard
        label="Collected Amount"
        value={formatVnd(collectedAmount)}
        description="Payments already received from participants"
        icon={BadgeCheck}
      />
      <ExpenseStatCard
        label="Outstanding Amount"
        value={formatVnd(outstandingAmount)}
        description="Remaining balance that the host can track"
        icon={AlertCircle}
      />
    </div>
  )
}
