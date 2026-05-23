import { TimerReset } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type { FinancialTimelineRow } from "../../mock-data/expense-types"
import { formatVnd, getTimelineIcon } from "./expense-utils"

export function FinancialTimelineCard({
  timelineRows,
}: {
  timelineRows: FinancialTimelineRow[]
}) {
  const { t } = useSocialsTranslation()
  const reversedTimelineRows = [...timelineRows].reverse()

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">
          {t("expenses.timeline.title")}
        </CardTitle>
        <CardDescription className="mt-1">
          {t("expenses.timeline.description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6 border-l border-border/70 pl-6">
          {reversedTimelineRows.map((event) => {
            const Icon = getTimelineIcon(event.type)

            return (
              <div key={event.id} className="relative">
                <span className="absolute top-0 -left-8.5 flex size-7 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
                  <Icon className="size-4" />
                </span>
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {event.type === "court-booking"
                          ? t("expenses.timeline.courtBookingCreated")
                          : t("expenses.timeline.participantPaymentReceived")}
                      </p>
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
                    {t("expenses.timeline.ledgerNote")}
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
