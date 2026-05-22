import { TimerReset } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { FinancialTimelineRow } from "./expense-types"
import { formatVnd, getTimelineIcon } from "./expense-utils"

export function FinancialTimelineCard({
  timelineRows,
}: {
  timelineRows: FinancialTimelineRow[]
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">Financial Timeline</CardTitle>
        <CardDescription className="mt-1">
          A concise event history of booking costs and incoming payments.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6 border-l border-border/70 pl-6">
          {timelineRows.map((event) => {
            const Icon = getTimelineIcon(event.type)

            return (
              <div key={event.id} className="relative">
                <span className="absolute top-0 -left-8.5 flex size-7 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
                  <Icon className="size-4" />
                </span>
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.timestamp}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="w-fit rounded-full px-3 py-1"
                    >
                      {formatVnd(event.amount)}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <TimerReset className="size-3.5" />
                    Hosted on the financial ledger
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
