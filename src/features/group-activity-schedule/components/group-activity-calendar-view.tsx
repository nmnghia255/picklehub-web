import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { CalendarRange, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  CalendarView,
  GroupActivity,
} from "@/features/group-activity-schedule/group-activity-schedule.types"
import {
  getStatusBadgeClass,
  getStatusLabel,
} from "@/features/group-activity-schedule/group-activity-schedule.utils"

interface GroupActivityCalendarViewProps {
  events: GroupActivity[]
  baseDate: Date
  view: CalendarView
  selectedDate: Date
  onViewChange: (value: CalendarView) => void
  onSelectDate: (date: Date) => void
  onOpenEvent: (event: GroupActivity) => void
}

function formatTime(value?: string | null) {
  if (!value) return ""
  return format(new Date(value), "HH:mm")
}

function getMonthGridDates(baseDate: Date) {
  const monthStart = startOfMonth(baseDate)
  const monthEnd = endOfMonth(baseDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

function getWeekDates(baseDate: Date) {
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 })
  return eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(baseDate, { weekStartsOn: 1 }),
  })
}

function groupEventsByDate(events: GroupActivity[]) {
  return events.reduce<Record<string, GroupActivity[]>>(
    (accumulator, event) => {
      if (!event.startAt) return accumulator
      const key = format(new Date(event.startAt), "yyyy-MM-dd")
      if (!accumulator[key]) accumulator[key] = []
      accumulator[key].push(event)
      return accumulator
    },
    {}
  )
}

function EventChip({
  event,
  onOpenEvent,
}: {
  event: GroupActivity
  onOpenEvent: (event: GroupActivity) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenEvent(event)}
      className="w-full rounded-md border p-2 text-left transition-colors hover:bg-accent"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="truncate text-xs font-semibold">{event.title}</p>
        <Badge variant="outline" className={getStatusBadgeClass(event.status)}>
          {formatTime(event.startAt)}
        </Badge>
      </div>
      <p className="truncate text-xs text-muted-foreground">{event.location}</p>
      {event.equipment && event.equipment.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {event.equipment.map((eq, idx) => (
            <span key={idx} className="rounded bg-muted px-1 text-[10px]">
              {eq.name} x{eq.quantity}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

export function GroupActivityCalendarView({
  events,
  baseDate,
  view,
  selectedDate,
  onViewChange,
  onSelectDate,
  onOpenEvent,
}: GroupActivityCalendarViewProps) {
  const groupedEvents = groupEventsByDate(events)
  const monthDates = getMonthGridDates(baseDate)
  const weekDates = getWeekDates(baseDate)
  const selectedKey = format(selectedDate, "yyyy-MM-dd")
  const selectedDateEvents = groupedEvents[selectedKey] ?? []
  const currentMonth = baseDate.getMonth()

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="size-5" />
          <CardTitle>Lịch hoạt động</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs
          value={view}
          onValueChange={(value) => onViewChange(value as CalendarView)}
          className="gap-4"
        >
          <TabsList>
            <TabsTrigger value="month">Tháng</TabsTrigger>
            <TabsTrigger value="week">Tuần</TabsTrigger>
            <TabsTrigger value="agenda">Lịch trình</TabsTrigger>
          </TabsList>

          <TabsContent value="month" className="space-y-3">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
              {monthDates.map((date) => {
                const key = format(date, "yyyy-MM-dd")
                const dayEvents = groupedEvents[key] ?? []
                const isCurrentMonth = date.getMonth() === currentMonth
                const isSelected = isSameDay(date, selectedDate)
                const isToday = isSameDay(date, new Date())

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => onSelectDate(date)}
                    className={`min-h-32 rounded-lg border p-2 text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent/40"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p
                        className={`text-xs font-medium ${
                          isCurrentMonth
                            ? "text-foreground"
                            : "text-muted-foreground"
                        } ${isToday ? "rounded-full bg-primary px-2 py-0.5 text-primary-foreground" : ""}`}
                      >
                        {date.getDate()}
                      </p>
                      {dayEvents.length > 0 && (
                        <Badge variant="outline">{dayEvents.length}</Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="truncate rounded-md bg-muted px-2 py-1 text-[11px]"
                          title={event.title}
                        >
                          <span className="mr-1">📅</span>
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          Còn {dayEvents.length - 2} hoạt động
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="week" className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-7">
              {weekDates.map((date) => {
                const key = format(date, "yyyy-MM-dd")
                const dayEvents = groupedEvents[key] ?? []

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectDate(date)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      isSameDay(date, selectedDate)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent/40"
                    }`}
                  >
                    <p className="mb-3 text-sm font-semibold">
                      {date.toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </p>

                    <div className="space-y-2">
                      {dayEvents.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Không có hoạt động
                        </p>
                      )}
                      {dayEvents.map((event) => (
                        <EventChip
                          key={event.id}
                          event={event}
                          onOpenEvent={onOpenEvent}
                        />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="agenda" className="space-y-2">
            {events.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Không có hoạt động trong tháng này
              </p>
            ) : (
              events
                .slice()
                .sort((a, b) => {
                  const left = a.startAt ? new Date(a.startAt).getTime() : 0
                  const right = b.startAt ? new Date(b.startAt).getTime() : 0
                  return left - right
                })
                .map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onOpenEvent(event)}
                    className="flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.startAt
                          ? new Date(event.startAt).toLocaleDateString(
                              "vi-VN",
                              {
                                weekday: "long",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                          : "Chưa có lịch"}
                        {event.startAt && event.endAt
                          ? ` · ${formatTime(event.startAt)} - ${formatTime(event.endAt)}`
                          : ""}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {event.location}
                      </p>
                      {event.equipment && event.equipment.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Vật dụng:
                          </span>
                          {event.equipment.map((eq, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="h-5 text-[10px]"
                            >
                              {eq.name} x{eq.quantity}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Badge
                      variant="outline"
                      className={getStatusBadgeClass(event.status)}
                    >
                      {getStatusLabel(event.status)}
                    </Badge>
                  </button>
                ))
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
          Ngày {format(selectedDate, "dd/MM/yyyy")} có{" "}
          {selectedDateEvents.length} hoạt động
        </div>
      </CardContent>
    </Card>
  )
}
