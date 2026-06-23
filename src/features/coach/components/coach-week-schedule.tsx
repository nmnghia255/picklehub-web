"use client"

import { CalendarDays, Plus } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type {
  ScheduleBlock,
  ScheduleView,
} from "@/features/coach/data/mockSchedule"
import {
  daySlots,
  scheduleBlocks,
  weekDays,
} from "@/features/coach/data/mockSchedule"

const viewTabs: ScheduleView[] = ["week", "day"]

type ScheduleDraft = {
  student: string
  date: string
  time: string
  location: string
  note: string
}

export function CoachWeekSchedule() {
  const [view, setView] = useState<ScheduleView>("week")
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(scheduleBlocks)
  const [detailBlock, setDetailBlock] = useState<ScheduleBlock | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [draft, setDraft] = useState<ScheduleDraft>({
    student: "",
    date: "2026-04-07",
    time: "08:00",
    location: "Sân A2 - PickleHub Center",
    note: "",
  })

  const blocksByKey = useMemo(
    () =>
      new Map(
        blocks.map((block) => [`${block.day}-${block.startTime}`, block])
      ),
    [blocks]
  )

  const dayViewBlocks = useMemo(
    () => blocks.filter((block) => block.day === "Thứ 2"),
    [blocks]
  )

  const openBlockDetail = (block: ScheduleBlock) => setDetailBlock(block)

  const saveBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: `sc-${Date.now()}`,
        day: "Thứ 2",
        startTime: draft.time,
        endTime: `${String(Number(draft.time.slice(0, 2)) + 1).padStart(2, "0")}:${draft.time.slice(3)}`,
        student: draft.student,
        lessonPlan: "Buổi tập",
        location: draft.location,
        status: "Chưa hoàn thành",
        note: draft.note,
      },
    ])
    setCreateOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-2xl border bg-card p-2">
        {viewTabs.map((tab) => (
          <Button
            key={tab}
            type="button"
            variant={view === tab ? "default" : "ghost"}
            className="rounded-full"
            onClick={() => setView(tab)}
          >
            {tab === "week" ? "Week view" : "Day view"}
          </Button>
        ))}

        <div className="ml-auto">
          <Button className="rounded-full" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Tạo lịch
          </Button>
        </div>
      </div>

      {view === "week" ? (
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="overflow-x-auto p-4">
            <div className="grid min-w-[920px] grid-cols-[100px_repeat(6,minmax(120px,1fr))] gap-2">
              <div />
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="rounded-xl bg-muted/50 px-3 py-2 text-center text-sm font-medium"
                >
                  {day}
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
                        className={`min-h-24 rounded-2xl border p-3 text-left text-xs transition ${
                          block
                            ? "border-primary/30 bg-primary/10"
                            : "border-dashed bg-muted/30 hover:bg-accent"
                        }`}
                        onClick={() => block && openBlockDetail(block)}
                      >
                        {block ? (
                          <div className="space-y-1">
                            <Badge variant="secondary" className="rounded-full">
                              {block.status}
                            </Badge>
                            <p className="font-medium">{block.student}</p>
                            <p className="text-muted-foreground">
                              {block.lessonPlan}
                            </p>
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
      ) : (
        <div className="space-y-3">
          {dayViewBlocks.map((block) => (
            <Card key={block.id} className="rounded-2xl border shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-muted-foreground" />
                      <p className="font-semibold">
                        {block.startTime} - {block.endTime}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {block.student}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {block.location}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => openBlockDetail(block)}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Tạo lịch huấn luyện</DialogTitle>
            <DialogDescription>
              Chọn học viên, giáo án, thời gian và địa điểm cho buổi học mới.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Chọn học viên</Label>
              <Input
                value={draft.student}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, student: event.target.value }))
                }
                placeholder="An Nguyễn"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Thời gian</Label>
                <Input
                  type="time"
                  value={draft.time}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, time: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Địa điểm</Label>
                <Input
                  value={draft.location}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      location: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                value={draft.note}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, note: event.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Hủy
            </Button>
            <Button onClick={saveBlock}>Lưu lịch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  {detailBlock.day}, {detailBlock.startTime} -{" "}
                  {detailBlock.endTime}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Học viên:</span>{" "}
                  {detailBlock.student}
                </p>
                <p>
                  <span className="font-medium">Giáo án:</span>{" "}
                  {detailBlock.lessonPlan}
                </p>
                <p>
                  <span className="font-medium">Địa điểm:</span>{" "}
                  {detailBlock.location}
                </p>
                <p>
                  <span className="font-medium">Trạng thái:</span>{" "}
                  {detailBlock.status}
                </p>
                <p>
                  <span className="font-medium">Ghi chú:</span>{" "}
                  {detailBlock.note}
                </p>
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
