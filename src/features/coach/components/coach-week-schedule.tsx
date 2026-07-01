"use client"

import { CalendarDays } from "lucide-react"
import { Fragment, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

import type { CoachScheduleItem } from "../types/coach"
import { useCoachSchedule } from "../hooks/use-coach-queries"

const weekDays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]
const displayDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]
const hourSlots = Array.from({ length: 12 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`)

const statusColors: Record<string, string> = {
  upcoming: "border-blue-300 bg-blue-50",
  live: "border-green-300 bg-green-50",
  past: "border-gray-200 bg-gray-50",
  pending: "border-yellow-300 bg-yellow-50",
}

const statusLabels: Record<string, string> = {
  upcoming: "Sắp diễn ra",
  live: "Đang diễn ra",
  past: "Đã kết thúc",
  pending: "Chờ xác nhận",
}

function parseTimeIso(iso: string) {
  const date = new Date(iso)
  const dayIndex = date.getDay()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return {
    dayIndex,
    dayName: weekDays[dayIndex],
    timeKey: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    hourKey: `${String(hours).padStart(2, "0")}:00`,
    date,
  }
}

export function CoachWeekSchedule() {
  const { data, isLoading } = useCoachSchedule()
  const [detailItem, setDetailItem] = useState<CoachScheduleItem | null>(null)

  const items = data?.data ?? []

  const scheduleMap = useMemo(() => {
    const map = new Map<string, CoachScheduleItem[]>()
    for (const item of items) {
      const { dayName, hourKey } = parseTimeIso(item.startTime)
      if (!displayDays.includes(dayName)) continue
      const key = `${dayName}-${hourKey}`
      const existing = map.get(key) ?? []
      existing.push(item)
      map.set(key, existing)
    }
    return map
  }, [items])

  if (isLoading) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-8">
          <div className="grid min-w-[920px] grid-cols-[100px_repeat(6,minmax(120px,1fr))] gap-2">
            <div />
            {displayDays.map((day) => (
              <Skeleton key={day} className="h-10 rounded-xl" />
            ))}
            {hourSlots.map((time) => (
              <Fragment key={time}>
                <Skeleton className="h-24 rounded-2xl" />
                {displayDays.map((day) => (
                  <Skeleton key={`cell-${day}-${time}`} className="h-24 rounded-2xl" />
                ))}
              </Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="overflow-x-auto p-4">
          <div className="grid min-w-[920px] grid-cols-[100px_repeat(6,minmax(120px,1fr))] gap-2">
            <div />
            {displayDays.map((day) => (
              <div
                key={day}
                className="rounded-xl bg-muted/50 px-3 py-2 text-center text-sm font-medium"
              >
                {day}
              </div>
            ))}

            {hourSlots.map((time) => (
              <Fragment key={time}>
                <div
                  className="rounded-xl px-3 py-4 text-sm font-medium text-muted-foreground"
                >
                  {time}
                </div>
                {displayDays.map((day) => {
                  const key = `${day}-${time}`
                  const cells = scheduleMap.get(key) ?? []

                  return (
                    <button
                      key={key}
                      type="button"
                      className={`min-h-24 rounded-2xl border p-2 text-left text-xs transition ${
                        cells.length > 0
                          ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                          : "border-dashed bg-muted/30 hover:bg-accent"
                      }`}
                      onClick={() => cells.length > 0 && setDetailItem(cells[0])}
                    >
                      {cells.length > 0 ? (
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className={`rounded-full text-[10px] ${
                              statusColors[cells[0].status] ?? ""
                            }`}
                          >
                            {statusLabels[cells[0].status] ?? cells[0].status}
                          </Badge>
                          <p className="truncate font-medium">{cells[0].title}</p>
                          {cells.length > 1 && (
                            <p className="text-muted-foreground">
                              +{cells.length - 1} thêm
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Trống</span>
                      )}
                    </button>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(detailItem)}
        onOpenChange={() => setDetailItem(null)}
      >
        <DialogContent className="sm:max-w-xl">
          {detailItem ? (
            <>
              <DialogHeader>
                <DialogTitle>{detailItem.title}</DialogTitle>
                <DialogDescription>
                  {new Date(detailItem.startTime).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  ,{" "}
                  {new Date(detailItem.startTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(detailItem.endTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`rounded-full ${
                      statusColors[detailItem.status] ?? ""
                    }`}
                  >
                    {statusLabels[detailItem.status] ?? detailItem.status}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    {detailItem.type === "class" ? "Lớp học" : "Đặt lịch riêng"}
                  </Badge>
                </div>

                {detailItem.description && (
                  <p>{detailItem.description}</p>
                )}

                {detailItem.learners.length > 0 && (
                  <div>
                    <span className="font-medium">Học viên:</span>
                    <ul className="mt-1 list-inside list-disc space-y-1 text-muted-foreground">
                      {detailItem.learners.map((learner, index) => (
                        <li key={learner.userId ?? index}>{learner.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {detailItem.location && (
                  <p>
                    <span className="font-medium">Địa điểm:</span>{" "}
                    {detailItem.location}
                  </p>
                )}

                {detailItem.meetingUrl && (
                  <p>
                    <span className="font-medium">Meeting URL:</span>{" "}
                    <a
                      href={detailItem.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline underline-offset-4"
                    >
                      {detailItem.meetingUrl}
                    </a>
                  </p>
                )}

                <p>
                  <span className="font-medium">Số học viên:</span>{" "}
                  {detailItem.learnerCount}
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetailItem(null)}
                >
                  Đóng
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
