import { CalendarRange, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  CalendarView,
  GroupEvent,
  Venue,
} from "@/features/group-activity-schedule/group-activity-schedule.types"
import {
  formatTime,
  formatWeekdayAndDate,
  getActivityTypeBadgeClass,
  getMonthGridDates,
  getVenueById,
  getWeekDates,
  isDateInDay,
  sortEventsByStart,
} from "@/features/group-activity-schedule/group-activity-schedule.utils"

interface GroupActivityCalendarViewProps {
  events: GroupEvent[]
  venues: Venue[]
  view: CalendarView
  onViewChange: (value: CalendarView) => void
  onOpenDetail: (event: GroupEvent) => void
}

function EventChip({
  event,
  venueLabel,
  onOpenDetail,
}: {
  event: GroupEvent
  venueLabel: string
  onOpenDetail: (event: GroupEvent) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenDetail(event)}
      className="w-full rounded-md border p-2 text-left transition-colors hover:bg-accent"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="truncate text-xs font-semibold">{event.title}</p>
        <Badge
          variant="outline"
          className={getActivityTypeBadgeClass(event.activityType)}
        >
          {formatTime(event.startAt)}
        </Badge>
      </div>
      <p className="truncate text-xs text-muted-foreground">{venueLabel}</p>
    </button>
  )
}

export function GroupActivityCalendarView({
  events,
  venues,
  view,
  onViewChange,
  onOpenDetail,
}: GroupActivityCalendarViewProps) {
  const sortedEvents = sortEventsByStart(events)
  const weekDates = getWeekDates(new Date())
  const monthDates = getMonthGridDates(new Date())
  const thisMonth = new Date().getMonth()

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
            <TabsTrigger value="agenda">Danh sách</TabsTrigger>
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
                const dayEvents = sortedEvents.filter((event) =>
                  isDateInDay(date, event.startAt)
                )
                const isCurrentMonth = date.getMonth() === thisMonth

                return (
                  <div
                    key={date.toISOString()}
                    className="min-h-28 rounded-lg border p-2"
                  >
                    <p
                      className={`mb-2 text-xs font-medium ${
                        isCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {date.getDate()}
                    </p>
                    <div className="space-y-2">
                      {dayEvents.slice(0, 2).map((event) => (
                        <EventChip
                          key={event.id}
                          event={event}
                          venueLabel={
                            getVenueById(venues, event.venueId)?.shortLabel ??
                            "-"
                          }
                          onOpenDetail={onOpenDetail}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{dayEvents.length - 2} sự kiện
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="week" className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-7">
              {weekDates.map((date) => {
                const dayEvents = sortedEvents.filter((event) =>
                  isDateInDay(date, event.startAt)
                )

                return (
                  <div
                    key={date.toISOString()}
                    className="rounded-lg border p-3"
                  >
                    <p className="mb-3 text-sm font-semibold">
                      {formatWeekdayAndDate(date)}
                    </p>

                    <div className="space-y-2">
                      {dayEvents.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Không có sự kiện
                        </p>
                      )}
                      {dayEvents.map((event) => (
                        <EventChip
                          key={event.id}
                          event={event}
                          venueLabel={
                            getVenueById(venues, event.venueId)?.shortLabel ??
                            "-"
                          }
                          onOpenDetail={onOpenDetail}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="agenda" className="space-y-2">
            {sortedEvents.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Không có dữ liệu agenda trong bộ lọc hiện tại.
              </p>
            ) : (
              sortedEvents.map((event) => {
                const venue = getVenueById(venues, event.venueId)

                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onOpenDetail(event)}
                    className="flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.startAt).toLocaleDateString("vi-VN", {
                          weekday: "long",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                        {" · "}
                        {formatTime(event.startAt)} - {formatTime(event.endAt)}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {venue?.shortLabel ?? "Không rõ địa điểm"}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={getActivityTypeBadgeClass(event.activityType)}
                    >
                      {event.activityType === "SOCIAL"
                        ? "Social"
                        : event.activityType === "CHOI_THUONG"
                          ? "Chơi thường"
                          : event.activityType === "GIAI_DAU"
                            ? "Giải đấu"
                            : event.activityType === "MEETUP"
                              ? "Meetup"
                              : "Thuê sân"}
                    </Badge>
                  </button>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
