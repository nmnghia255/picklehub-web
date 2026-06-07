"use client"

import { format, startOfMonth } from "date-fns"
import { Edit, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { CalendarNavigation } from "@/components/calendar-navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import {
  MOCK_EVENTS,
  MOCK_GROUPS,
  MOCK_MEMBERS,
  MOCK_VENUES,
} from "../group-activity-schedule.mock"
import type { GroupEvent } from "../group-activity-schedule.types"
import {
  getStatusBadgeClass,
  getStatusLabel,
} from "../group-activity-schedule.utils"
import { GroupActivityCalendarView } from "./group-activity-calendar-view"
import { GroupActivityDetailDrawer } from "./group-activity-detail-drawer"
import { GroupActivityFormDialog } from "./group-activity-form-dialog"

interface GroupActivitySchedulePageProps {
  initialGroupId?: string
  embedded?: boolean
}

export function GroupActivitySchedulePage({
  initialGroupId,
  embedded = false,
}: GroupActivitySchedulePageProps) {
  // Mock State Management
  const [events, setEvents] = useState<GroupEvent[]>(() =>
    initialGroupId
      ? MOCK_EVENTS.filter((e) => e.groupId === initialGroupId)
      : MOCK_EVENTS
  )
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  )
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [view, setView] = useState<"month" | "week" | "agenda">("month")

  // Dialog & Drawer States
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<GroupEvent | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedEventForDetail, setSelectedEventForDetail] =
    useState<GroupEvent | null>(null)

  const activeGroup = useMemo(
    () => MOCK_GROUPS.find((g) => g.id === initialGroupId) || MOCK_GROUPS[0],
    [initialGroupId]
  )

  const groupMembers = useMemo(
    () =>
      MOCK_MEMBERS.filter(
        (m) => m.groupId === (initialGroupId || activeGroup.id)
      ),
    [initialGroupId, activeGroup.id]
  )

  const groupVenues = useMemo(
    () =>
      MOCK_VENUES.filter(
        (v) => v.groupId === (initialGroupId || activeGroup.id)
      ),
    [initialGroupId, activeGroup.id]
  )

  const socialsByDate = useMemo(() => {
    return events.reduce<Record<string, GroupEvent[]>>((accumulator, event) => {
      const key = format(new Date(event.startAt), "yyyy-MM-dd")
      if (!accumulator[key]) accumulator[key] = []
      accumulator[key].push(event)
      return accumulator
    }, {})
  }, [events])

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd")
  const selectedDayEvents = socialsByDate[selectedDateKey] ?? []

  // Handlers
  const handleCreateEvent = (
    payload: Omit<GroupEvent, "id" | "createdAt" | "updatedAt" | "updatedById">
  ) => {
    const newEvent: GroupEvent = {
      ...payload,
      id: `e-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedById: payload.createdById,
    }
    setEvents((prev) => [...prev, newEvent])
    toast.success("Đã tạo sự kiện mới thành công")
  }

  const handleUpdateEvent = (
    eventId: string,
    payload: Omit<GroupEvent, "id" | "createdAt" | "updatedAt" | "updatedById">
  ) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              ...payload,
              updatedAt: new Date().toISOString(),
              updatedById: payload.createdById,
            }
          : e
      )
    )
    toast.success("Đã cập nhật sự kiện thành công")
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
    toast.success("Đã xóa sự kiện")
  }

  const openCreateDialog = () => {
    setEditingEvent(null)
    setFormOpen(true)
  }

  const openEditDialog = (event: GroupEvent) => {
    setEditingEvent(event)
    setFormOpen(true)
  }

  const openDetailDrawer = (event: GroupEvent) => {
    setSelectedEventForDetail(event)
    setDetailOpen(true)
  }

  const content = (
    <div className={embedded ? "space-y-6" : "space-y-6 px-4 py-6 pb-8"}>
      {!embedded && (
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Lịch hoạt động nhóm
          </h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi các hoạt động chung của nhóm bạn.
          </p>
        </div>
      )}

      <Card className="mb-6 border-border bg-card/65 shadow-sm backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-between gap-6 p-4 md:flex-row">
          <CalendarNavigation
            currentDate={currentMonth}
            onMonthChange={(month) =>
              setCurrentMonth((prev) => new Date(prev.getFullYear(), month, 1))
            }
            onYearChange={(year) =>
              setCurrentMonth((prev) => new Date(year, prev.getMonth(), 1))
            }
            onPrevMonth={() =>
              setCurrentMonth((prev) => {
                const d = new Date(prev)
                d.setMonth(d.getMonth() - 1)
                return d
              })
            }
            onNextMonth={() =>
              setCurrentMonth((prev) => {
                const d = new Date(prev)
                d.setMonth(d.getMonth() + 1)
                return d
              })
            }
            onToday={() => {
              const now = new Date()
              setCurrentMonth(startOfMonth(now))
              setSelectedDate(now)
            }}
          />

          <Button className="ml-auto" onClick={openCreateDialog}>
            <Plus className="mr-2 size-4" />
            Thêm sự kiện
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <GroupActivityCalendarView
          events={events}
          baseDate={currentMonth}
          view={view}
          selectedDate={selectedDate}
          onViewChange={setView}
          onSelectDate={setSelectedDate}
          onOpenEvent={openDetailDrawer}
        />

        <Card className="h-fit">
          <CardContent className="space-y-4 p-4">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Sự kiện ngày {format(selectedDate, "dd/MM/yyyy")}
              </h2>
              <p className="text-sm text-muted-foreground">
                Có {selectedDayEvents.length} sự kiện được lên lịch
              </p>
            </div>

            <Button
              className="w-full"
              variant="outline"
              onClick={openCreateDialog}
            >
              <Plus className="mr-2 size-4" />
              Tạo sự kiện cho ngày này
            </Button>

            {selectedDayEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Không có sự kiện nào trong ngày này.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.startAt).getTime() -
                      new Date(b.startAt).getTime()
                  )
                  .map((event) => (
                    <div
                      key={event.id}
                      className="group relative rounded-lg border p-3 transition-colors hover:border-primary/50"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-bold">
                          {event.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClass(event.status)}
                        >
                          {getStatusLabel(event.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.startAt), "HH:mm")} -{" "}
                        {format(new Date(event.endAt), "HH:mm")}
                      </p>

                      <div className="mt-3 flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-primary"
                          onClick={() => openEditDialog(event)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <GroupActivityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingEvent={editingEvent}
        activeGroupId={initialGroupId || activeGroup.id}
        activeGroupName={activeGroup.name}
        members={groupMembers}
        venues={groupVenues}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
      />

      <GroupActivityDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        event={selectedEventForDetail}
        members={MOCK_MEMBERS}
        venues={MOCK_VENUES}
      />
    </div>
  )

  return embedded ? (
    content
  ) : (
    <div className="mx-auto w-full max-w-7xl">{content}</div>
  )
}

export default function Page() {
  return <GroupActivitySchedulePage />
}
