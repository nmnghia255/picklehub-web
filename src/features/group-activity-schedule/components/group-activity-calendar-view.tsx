"use client"

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { CalendarRange, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import type {
  CalendarView,
} from "@/features/group-activity-schedule/group-activity-schedule.types"
import type { Social } from "@/features/socials/types"

interface GroupActivityCalendarViewProps {
  socials: Social[]
  baseDate: Date
  view: CalendarView
  selectedDate: Date
  onViewChange: (value: CalendarView) => void
  onSelectDate: (date: Date) => void
  onOpenSocial: (social: Social) => void
}

function getStatusBadgeClass(status: Social["status"]) {
  if (status === "PUBLISHED") return "bg-emerald-100 text-emerald-700 border-emerald-200"
  if (status === "COMPLETED") return "bg-slate-100 text-slate-700 border-slate-200"
  if (status === "CANCELLED") return "bg-rose-100 text-rose-700 border-rose-200"
  return "bg-amber-100 text-amber-700 border-amber-200"
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

function groupSocialsByDate(socials: Social[]) {
  return socials.reduce<Record<string, Social[]>>((accumulator, social) => {
    if (!social.startTime) return accumulator
    const key = format(new Date(social.startTime), "yyyy-MM-dd")
    if (!accumulator[key]) accumulator[key] = []
    accumulator[key].push(social)
    return accumulator
  }, {})
}

function SocialChip({
  social,
  onOpenSocial,
}: {
  social: Social
  onOpenSocial: (social: Social) => void
}) {
  const { t } = useSocialsTranslation()

  return (
    <button
      type="button"
      onClick={() => onOpenSocial(social)}
      className="w-full rounded-md border p-2 text-left transition-colors hover:bg-accent"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="truncate text-xs font-semibold">{social.title}</p>
        <Badge variant="outline" className={getStatusBadgeClass(social.status)}>
          {formatTime(social.startTime)}
        </Badge>
      </div>
      <p className="truncate text-xs text-muted-foreground">
        {social.joinedCount}/{social.maxSlots} {t("calendar.slots")}
      </p>
    </button>
  )
}

export function GroupActivityCalendarView({
  socials,
  baseDate,
  view,
  selectedDate,
  onViewChange,
  onSelectDate,
  onOpenSocial,
}: GroupActivityCalendarViewProps) {
  const { t } = useSocialsTranslation()
  const groupedSocials = groupSocialsByDate(socials)
  const monthDates = getMonthGridDates(baseDate)
  const weekDates = getWeekDates(baseDate)
  const selectedKey = format(selectedDate, "yyyy-MM-dd")
  const selectedDateSocials = groupedSocials[selectedKey] ?? []
  const currentMonth = baseDate.getMonth()

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="size-5" />
          <CardTitle>{t("calendar.title")}</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs
          value={view}
          onValueChange={(value) => onViewChange(value as CalendarView)}
          className="gap-4"
        >
          <TabsList>
            <TabsTrigger value="month">{t("calendar.month")}</TabsTrigger>
            <TabsTrigger value="week">{t("calendar.week")}</TabsTrigger>
            <TabsTrigger value="agenda">{t("calendar.agenda")}</TabsTrigger>
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
                const daySocials = groupedSocials[key] ?? []
                const isCurrentMonth = date.getMonth() === currentMonth
                const isSelected = isSameDay(date, selectedDate)
                const isToday = isSameDay(date, new Date())

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => onSelectDate(date)}
                    className={`min-h-32 rounded-lg border p-2 text-left transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "hover:bg-accent/40"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p
                        className={`text-xs font-medium ${
                          isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                        } ${isToday ? "rounded-full bg-primary px-2 py-0.5 text-primary-foreground" : ""}`}
                      >
                        {date.getDate()}
                      </p>
                      {daySocials.length > 0 && (
                        <Badge variant="outline">{daySocials.length}</Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      {daySocials.slice(0, 2).map((social) => (
                        <div
                          key={social.id}
                          className="truncate rounded-md bg-muted px-2 py-1 text-[11px]"
                          title={social.title}
                        >
                          <span className="mr-1">🏓</span>
                          {social.title}
                        </div>
                      ))}
                      {daySocials.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          {t("calendar.moreSocials", { count: daySocials.length - 2 })}
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
                const daySocials = groupedSocials[key] ?? []

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectDate(date)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      isSameDay(date, selectedDate) ? "border-primary bg-primary/5" : "hover:bg-accent/40"
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
                      {daySocials.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          {t("calendar.noSocialInWeek")}
                        </p>
                      )}
                      {daySocials.map((social) => (
                        <SocialChip
                          key={social.id}
                          social={social}
                          onOpenSocial={onOpenSocial}
                        />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="agenda" className="space-y-2">
            {socials.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {t("calendar.noSocialInMonth")}
              </p>
            ) : (
              socials
                .slice()
                .sort((a, b) => {
                  const left = a.startTime ? new Date(a.startTime).getTime() : 0
                  const right = b.startTime ? new Date(b.startTime).getTime() : 0
                  return left - right
                })
                .map((social) => (
                  <button
                    key={social.id}
                    type="button"
                    onClick={() => onOpenSocial(social)}
                    className="flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">{social.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {social.startTime
                          ? new Date(social.startTime).toLocaleDateString("vi-VN", {
                              weekday: "long",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : t("calendar.noSchedule")}
                        {social.startTime && social.endTime ? ` · ${formatTime(social.startTime)} - ${formatTime(social.endTime)}` : ""}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {social.groupId ? t("calendar.group", { groupId: social.groupId }) : t("calendar.unknownGroup")}
                      </p>
                    </div>

                    <Badge variant="outline" className={getStatusBadgeClass(social.status)}>
                      {social.status}
                    </Badge>
                  </button>
                ))
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
          {t("calendar.selectedDateSummary", {
            date: format(selectedDate, "dd/MM/yyyy"),
            count: selectedDateSocials.length,
          })}
        </div>
      </CardContent>
    </Card>
  )
}
