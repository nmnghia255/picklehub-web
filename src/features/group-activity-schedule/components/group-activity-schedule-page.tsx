"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, startOfMonth } from "date-fns"
import { Edit, Link, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { CalendarNavigation } from "@/components/calendar-navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  groupQueryKeys,
  linkGroupCourtBookingClient,
  listGroupCourtBookingsClient,
  unlinkGroupCourtBookingClient,
} from "@/features/groups/api/groups-client"

import {
  activityQueryKeys,
  createActivityClient,
  deleteActivityClient,
  listActivitiesClient,
  updateActivityClient,
} from "../api/activities-client"
import type {
  CalendarEvent,
  CourtBookingCalendarEvent,
  CreateGroupActivityDto,
  GroupActivity,
  UpdateGroupActivityDto,
} from "../group-activity-schedule.types"
import {
  getStatusBadgeClass,
  getStatusLabel,
  transformActivityToCalendarEvent,
  transformCourtBookingToCalendarEvent,
} from "../group-activity-schedule.utils"
import { CourtBookingCalendarDrawer } from "./court-booking-calendar-drawer"
import { CourtBookingLinkDialog } from "./court-booking-link-dialog"
import { GroupActivityCalendarView } from "./group-activity-calendar-view"
import { GroupActivityDetailDrawer } from "./group-activity-detail-drawer"
import { GroupActivityFormDialog } from "./group-activity-form-dialog"
import { GroupActivityLoadingSkeleton } from "./group-activity-loading-skeleton"

interface GroupActivitySchedulePageProps {
  initialGroupId?: string
  embedded?: boolean
  currentUserRole?: string | null
}

export function GroupActivitySchedulePage({
  initialGroupId,
  embedded = false,
  currentUserRole,
}: GroupActivitySchedulePageProps) {
  const queryClient = useQueryClient()
  const groupId = initialGroupId || ""

  const role = currentUserRole?.toLowerCase()

  const canManageActivities = useMemo(() => {
    return role === "owner" || role === "admin"
  }, [role])

  const isOwner = role === "owner"

  // States
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  )
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [view, setView] = useState<"month" | "week" | "agenda">("month")

  // Dialog & Drawer States
  const [formOpen, setFormOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<GroupActivity | null>(
    null
  )

  const [activityDetailOpen, setActivityDetailOpen] = useState(false)
  const [selectedActivityForDetail, setSelectedActivityForDetail] =
    useState<GroupActivity | null>(null)

  const [courtBookingDetailOpen, setCourtBookingDetailOpen] = useState(false)
  const [selectedCourtBookingForDetail, setSelectedCourtBookingForDetail] =
    useState<CourtBookingCalendarEvent | null>(null)

  const [courtBookingLinkOpen, setCourtBookingLinkOpen] = useState(false)

  // Court booking invalidation helper
  const invalidateCourtBookings = () =>
    queryClient.invalidateQueries({
      queryKey: [...groupQueryKeys.detail(groupId), "courtBookings"],
    })

  // Queries
  const activitiesQuery = useQuery({
    queryKey: activityQueryKeys.list(groupId, { limit: 1000 }),
    queryFn: () => listActivitiesClient(groupId, { limit: 1000 }),
    enabled: !!groupId,
  })

  const courtBookingsQuery = useQuery({
    queryKey: groupQueryKeys.courtBookings(groupId, { limit: 100 }),
    queryFn: () => listGroupCourtBookingsClient(groupId, { limit: 100 }),
    enabled: !!groupId,
  })

  const isLoading = activitiesQuery.isLoading || courtBookingsQuery.isLoading

  const allEvents = useMemo(() => {
    const activities = (activitiesQuery.data?.data || []).map(
      transformActivityToCalendarEvent
    )
    const bookings = (courtBookingsQuery.data?.data || []).map(
      transformCourtBookingToCalendarEvent
    )
    return [...activities, ...bookings]
  }, [activitiesQuery.data, courtBookingsQuery.data])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateGroupActivityDto) =>
      createActivityClient(groupId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["group-activities", groupId],
      })
      toast.success("Đã tạo hoạt động mới thành công")
      setFormOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể tạo hoạt động")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      activityId,
      payload,
    }: {
      activityId: string
      payload: UpdateGroupActivityDto
    }) => updateActivityClient(groupId, activityId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["group-activities", groupId],
      })
      toast.success("Đã cập nhật hoạt động thành công")
      setFormOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể cập nhật hoạt động")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (activityId: string) =>
      deleteActivityClient(groupId, activityId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["group-activities", groupId],
      })
      toast.success("Đã xóa hoạt động")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể xóa hoạt động")
    },
  })

  const linkBookingMutation = useMutation({
    mutationFn: (body: { title: string; note: string; bookingId: string }) =>
      linkGroupCourtBookingClient(groupId, body),
    onSuccess: () => {
      toast.success("Liên kết lịch đặt sân thành công!")
      setCourtBookingLinkOpen(false)
      invalidateCourtBookings()
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Không thể liên kết lịch đặt sân. Vui lòng thử lại."
      )
    },
  })

  const unlinkBookingMutation = useMutation({
    mutationFn: (id: string) => unlinkGroupCourtBookingClient(groupId, id),
    onSuccess: () => {
      toast.success("Đã xóa liên kết lịch đặt sân.")
      setCourtBookingDetailOpen(false)
      invalidateCourtBookings()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể xóa liên kết lịch đặt sân.")
    },
  })

  const eventsByDate = useMemo(() => {
    return allEvents.reduce<Record<string, CalendarEvent[]>>(
      (accumulator, event) => {
        if (!event.startAt) return accumulator
        const date = new Date(event.startAt)
        if (isNaN(date.getTime())) return accumulator
        const key = format(date, "yyyy-MM-dd")
        if (!accumulator[key]) accumulator[key] = []
        accumulator[key].push(event)
        return accumulator
      },
      {}
    )
  }, [allEvents])

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd")
  const selectedDayEvents = eventsByDate[selectedDateKey] ?? []

  // Handlers
  const handleCreateEvent = (payload: CreateGroupActivityDto) => {
    createMutation.mutate(payload)
  }

  const handleUpdateEvent = (
    activityId: string,
    payload: UpdateGroupActivityDto
  ) => {
    updateMutation.mutate({ activityId, payload })
  }

  const handleDeleteEvent = (activityId: string) => {
    if (window.confirm("Bạn có chắc muốn xóa hoạt động này không?")) {
      deleteMutation.mutate(activityId)
    }
  }

  const openCreateDialog = () => {
    setEditingActivity(null)
    setFormOpen(true)
  }

  const openEditDialog = (event: GroupActivity) => {
    setEditingActivity(event)
    setFormOpen(true)
  }

  const openDetailDrawer = (event: CalendarEvent) => {
    if (event.type === "activity") {
      setSelectedActivityForDetail(event._raw)
      setActivityDetailOpen(true)
    } else {
      setSelectedCourtBookingForDetail(event)
      setCourtBookingDetailOpen(true)
    }
  }

  if (isLoading && !allEvents.length) {
    return <GroupActivityLoadingSkeleton />
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

          <div className="ml-auto flex items-center gap-2">
            {isOwner && (
              <Button
                variant="outline"
                onClick={() => setCourtBookingLinkOpen(true)}
              >
                <Link className="mr-2 size-4" />
                Liên kết lịch đặt sân
              </Button>
            )}
            {canManageActivities && (
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 size-4" />
                Thêm sự kiện
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <GroupActivityCalendarView
          events={allEvents}
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

            {canManageActivities && (
              <Button
                className="w-full"
                variant="outline"
                onClick={openCreateDialog}
              >
                <Plus className="mr-2 size-4" />
                Tạo sự kiện cho ngày này
              </Button>
            )}

            {selectedDayEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Không có sự kiện nào trong ngày này.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents
                  .slice()
                  .sort((a, b) => {
                    const aTime = a.startAt ? new Date(a.startAt).getTime() : 0
                    const bTime = b.startAt ? new Date(b.startAt).getTime() : 0
                    return aTime - bTime
                  })
                  .map((event) => {
                    const isActivity = event.type === "activity"

                    return (
                      <div
                        key={event.id}
                        className="group relative cursor-pointer rounded-lg border p-3 transition-colors hover:border-primary/50"
                        onClick={() => openDetailDrawer(event)}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-sm font-bold">
                            {!isActivity && "🎾 "}
                            {event.title}
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              isActivity
                                ? getStatusBadgeClass(event._raw.status)
                                : "border-sky-200 bg-sky-100 text-sky-700"
                            }
                          >
                            {isActivity
                              ? getStatusLabel(event._raw.status)
                              : "Đặt sân"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {event.startAt
                            ? format(new Date(event.startAt), "HH:mm")
                            : ""}
                          {event.startAt && event.endAt ? " - " : ""}
                          {event.endAt
                            ? format(new Date(event.endAt), "HH:mm")
                            : ""}
                        </p>

                        {isActivity && canManageActivities && (
                          <div className="mt-3 flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-primary"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditDialog(event._raw)
                              }}
                              disabled={updateMutation.isPending}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteEvent(event.id)
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <GroupActivityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingEvent={editingActivity}
        activeGroupId={groupId}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {selectedActivityForDetail && (
        <GroupActivityDetailDrawer
          open={activityDetailOpen}
          onOpenChange={setActivityDetailOpen}
          activityId={selectedActivityForDetail.id}
          groupId={groupId}
        />
      )}

      {selectedCourtBookingForDetail && (
        <CourtBookingCalendarDrawer
          open={courtBookingDetailOpen}
          onOpenChange={setCourtBookingDetailOpen}
          event={selectedCourtBookingForDetail}
          canManage={isOwner}
          onUnlink={(id) => {
            if (
              window.confirm("Bạn có chắc muốn xóa liên kết lịch đặt sân này?")
            ) {
              unlinkBookingMutation.mutate(id)
            }
          }}
        />
      )}

      <CourtBookingLinkDialog
        open={courtBookingLinkOpen}
        onOpenChange={setCourtBookingLinkOpen}
        onLink={(payload) => linkBookingMutation.mutate(payload)}
        isPending={linkBookingMutation.isPending}
      />
    </div>
  )

  return embedded ? (
    content
  ) : (
    <div className="mx-auto w-full max-w-7xl">{content}</div>
  )
}
