import { CalendarClock } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  selectedDate: Date | undefined
  onSelectDate: (date: Date | undefined) => void
}

export function BookingDateSelectionCard({
  selectedDate,
  onSelectDate,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarClock className="size-5" />
          Chọn ngày và khung giờ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-lg border">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}
