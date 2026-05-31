import { CalendarClock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface BookingHistoryEmptyStateProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

export function BookingHistoryEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: BookingHistoryEmptyStateProps) {
  return (
    <Card className="border-dashed bg-card/80">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="rounded-full border bg-background p-4 shadow-sm">
          <CalendarClock className="size-8 text-muted-foreground" />
        </div>
        <div className="max-w-lg space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}
