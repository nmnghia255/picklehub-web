"use client"

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
import type { LearnerScheduleBlock } from "@/features/learner/data/learner-mock-data"
import {
  daySlots,
  learnerSchedules,
  weekDays,
} from "@/features/learner/data/learner-mock-data"

const statusVariantMap = {
  "Đã xác nhận": "default" as const,
  "Chờ xác nhận": "outline" as const,
  "Hoàn thành": "secondary" as const,
  "Đã hủy": "destructive" as const,
}

export function LearnerSchedule() {
  const [detailBlock, setDetailBlock] = useState<LearnerScheduleBlock | null>(
    null
  )

  const blocksByKey = useMemo(
    () =>
      new Map(
        learnerSchedules.map((block) => [
          `${block.day}-${block.startTime}`,
          block,
        ])
      ),
    []
  )

  const dayDateMap = useMemo(
    () => Object.fromEntries(learnerSchedules.map((b) => [b.day, b.date])),
    []
  )

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="overflow-x-auto p-4">
          <div className="grid min-w-[920px] grid-cols-[100px_repeat(6,minmax(140px,1fr))] gap-2">
            <div />
            {weekDays.map((day) => (
              <div
                key={day}
                className="rounded-xl bg-muted/50 px-3 py-2 text-center text-sm font-medium"
              >
                <div>{day}</div>
                {dayDateMap[day] && (
                  <div className="text-xs text-muted-foreground">
                    {dayDateMap[day]}
                  </div>
                )}
              </div>
            ))}

            {daySlots.map((time) => (
              <Fragment key={time}>
                <div className="rounded-xl px-3 py-4 text-sm font-medium">
                  {time}
                </div>
                {weekDays.map((day) => {
                  const block = blocksByKey.get(`${day}-${time}`)

                  return (
                    <button
                      key={`${day}-${time}`}
                      type="button"
                      className={`min-h-28 rounded-2xl border p-3 text-left text-xs transition ${
                        block
                          ? "border-primary/30 bg-primary/10"
                          : "border-dashed bg-muted/30 hover:bg-accent"
                      }`}
                      onClick={() => block && setDetailBlock(block)}
                    >
                      {block ? (
                        <div className="flex h-full flex-col gap-1">
                          <Badge
                            variant={statusVariantMap[block.status]}
                            className="w-fit rounded-full"
                          >
                            {block.status}
                          </Badge>
                          <p className="mt-1 leading-tight font-semibold">
                            {block.sessionName}
                          </p>
                          <p className="text-muted-foreground">
                            {block.coachName}
                          </p>
                          <p className="text-muted-foreground">
                            {block.groupName}
                          </p>
                          <p className="text-muted-foreground">
                            {block.location}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">--</span>
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
        open={Boolean(detailBlock)}
        onOpenChange={() => setDetailBlock(null)}
      >
        <DialogContent className="sm:max-w-xl">
          {detailBlock ? (
            <>
              <DialogHeader>
                <DialogTitle>Chi tiết buổi học</DialogTitle>
                <DialogDescription>
                  {detailBlock.day}, {detailBlock.date} ·{" "}
                  {detailBlock.startTime} - {detailBlock.endTime}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="min-w-28 font-medium">Buổi tập</span>
                  <span>{detailBlock.sessionName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="min-w-28 font-medium">HLV phụ trách</span>
                  <span>{detailBlock.coachName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="min-w-28 font-medium">Nhóm / Lớp</span>
                  <span>{detailBlock.groupName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="min-w-28 font-medium">Địa điểm</span>
                  <span>{detailBlock.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="min-w-28 font-medium">Trạng thái</span>
                  <Badge
                    variant={statusVariantMap[detailBlock.status]}
                    className="rounded-full"
                  >
                    {detailBlock.status}
                  </Badge>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailBlock(null)}>
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
