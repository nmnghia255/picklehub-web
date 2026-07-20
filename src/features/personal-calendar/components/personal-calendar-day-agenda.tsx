import type { TFunction } from "i18next"
import { Clock, MapPin, Sparkles } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { CalendarActivity } from "../api/calendar-client"
import { formatCalendarTime } from "../utils/personal-calendar-formatters"
import { CalendarActivityTypeBadge } from "./personal-calendar-event-badges"

interface PersonalCalendarDayAgendaProps {
  events: CalendarActivity[]
  onEventClick: (event: CalendarActivity) => void
  selectedDate: Date
  t: TFunction<"common">
}

export function PersonalCalendarDayAgenda({
  events,
  onEventClick,
  selectedDate,
  t,
}: PersonalCalendarDayAgendaProps) {
  return (
    <Card className="flex flex-col border-border bg-card shadow-md">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-1.5 text-base font-bold">
          <Sparkles className="size-4 text-primary" />
          {t("calendar.dayDetailsTitle", {
            date: `${selectedDate.getDate().toString().padStart(2, "0")}/${(
              selectedDate.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}/${selectedDate.getFullYear()}`,
          })}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("calendar.dayDetailsDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-4 py-10 text-center">
            <span className="mb-2 text-3xl">🍃</span>
            <p className="text-sm font-semibold text-foreground/80">
              {t("calendar.noDayActivitiesTitle")}
            </p>
            <p className="mt-1 max-w-[200px] text-xs text-muted-foreground">
              {t("calendar.noDayActivitiesDescription")}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {t("calendar.activitiesCount", { count: events.length })}
            </p>
            <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="group relative flex cursor-pointer flex-col gap-2 rounded-lg border border-border/80 bg-background/50 p-3 transition-all duration-200 hover:border-primary/40 hover:bg-accent/40 hover:shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                      {event.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>
                      {formatCalendarTime(event.startTime)} -{" "}
                      {formatCalendarTime(event.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{event.location.name}</span>
                  </div>

                  <div className="mt-1 flex items-center justify-between border-t border-border/40 pt-2">
                    <CalendarActivityTypeBadge type={event.type} t={t} />
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {t("calendar.participantsCount", {
                        count: event.participantsCount,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
