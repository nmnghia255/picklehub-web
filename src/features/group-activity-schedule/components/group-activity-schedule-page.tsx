"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, startOfMonth } from "date-fns"
import {
  AlertTriangle,
  Edit,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { CalendarNavigation } from "@/components/calendar-navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  cancelCourtBookingClient,
  checkCancelEligibilityClient,
  groupQueryKeys,
  useGroupDetail,
} from "@/features/groups/public/group-activity-integration"
import { useActionGuard } from "@/features/groups/public/group-activity-integration"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import {
  activityQueryKeys,
  createActivityClient,
  deleteActivityClient,
  listActivitiesClient,
  updateActivityClient,
} from "../api/activities-client"
import type {
  CreateGroupActivityDto,
  GroupActivity,
  UpdateGroupActivityDto,
} from "../group-activity-schedule.types"
import {
  getStatusBadgeClass,
  getStatusLabel,
} from "../group-activity-schedule.utils"
import { GroupActivityCalendarView } from "./group-activity-calendar-view"
import { GroupActivityDetailDrawer } from "./group-activity-detail-drawer"
import { GroupActivityFormDialog } from "./group-activity-form-dialog"
import { GroupActivityLoadingSkeleton } from "./group-activity-loading-skeleton"

interface GroupActivitySchedulePageProps {
  initialGroupId?: string
  embedded?: boolean
  currentUserRole?: string | null
  currentUserId?: string
}

export function GroupActivitySchedulePage({
  initialGroupId,
  embedded = false,
  currentUserRole,
  currentUserId,
}: GroupActivitySchedulePageProps) {
  const { t } = useGroupsTranslation()
  const queryClient = useQueryClient()
  const groupId = initialGroupId || ""

  const canManageActivities = useMemo(() => {
    const role = currentUserRole?.toLowerCase()
    return role === "owner" || role === "host"
  }, [currentUserRole])

  // States
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  )
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [view, setView] = useState<"month" | "week" | "agenda">("month")
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")

  // Dialog & Drawer States
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<GroupActivity | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedEventForDetail, setSelectedEventForDetail] =
    useState<GroupActivity | null>(null)

  // Cascade Cancel States
  const [cancelActivityConfirmOpen, setCancelActivityConfirmOpen] =
    useState(false)
  const [activityToCancel, setActivityToCancel] =
    useState<GroupActivity | null>(null)
  const [cancelCourtBookingChecked, setCancelCourtBookingChecked] =
    useState(false)
  const [cancellationEligibility, setCancellationEligibility] = useState<{
    eligibleForRefund: boolean
    warningMessage: string
  } | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(false)

  // Queries
  const { data: group } = useGroupDetail(groupId)

  const { guardWriteAction, PermissionDialog, hasValidSubscription } =
    useActionGuard(group, currentUserRole)

  const isArchived = group?.status === "ARCHIVED"

  const { data: activitiesResponse, isLoading } = useQuery({
    queryKey: activityQueryKeys.list(groupId, { limit: 1000 }), // Get all for calendar
    queryFn: () => listActivitiesClient(groupId, { limit: 1000 }),
    enabled: !!groupId,
  })

  const events = useMemo(
    () => activitiesResponse?.data || [],
    [activitiesResponse]
  )

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateGroupActivityDto) =>
      createActivityClient(groupId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["group-activities", groupId],
      })
      void queryClient.invalidateQueries({
        queryKey: [...groupQueryKeys.detail(groupId), "courtBookings"],
      })
      toast.success(t("activitySchedule.createSuccess"))
      setFormOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || t("activitySchedule.createError"))
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
      void queryClient.invalidateQueries({
        queryKey: [...groupQueryKeys.detail(groupId), "courtBookings"],
      })
      toast.success(t("activitySchedule.updateSuccess"))
      setFormOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || t("activitySchedule.updateError"))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (activityId: string) =>
      deleteActivityClient(groupId, activityId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["group-activities", groupId],
      })
      void queryClient.invalidateQueries({
        queryKey: [...groupQueryKeys.detail(groupId), "courtBookings"],
      })
      toast.success(t("activitySchedule.deleteSuccess"))
      setCancelActivityConfirmOpen(false)
      setActivityToCancel(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || t("activitySchedule.deleteError"))
    },
  })

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) =>
      cancelCourtBookingClient(groupId, bookingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["group-activities", groupId],
      })
      toast.success(t("activitySchedule.cancelBookingSuccess"))
      setCancelActivityConfirmOpen(false)
      setActivityToCancel(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || t("activitySchedule.cancelBookingError"))
    },
  })

  const socialsByDate = useMemo(() => {
    return events.reduce<Record<string, GroupActivity[]>>(
      (accumulator, event) => {
        const key = format(new Date(event.startAt), "yyyy-MM-dd")
        if (!accumulator[key]) accumulator[key] = []
        accumulator[key].push(event)
        return accumulator
      },
      {}
    )
  }, [events])

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd")
  const selectedDayEvents = socialsByDate[selectedDateKey] ?? []

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

  const handleDeleteClick = (event: GroupActivity) => {
    guardWriteAction(
      async () => {
        setActivityToCancel(event)
        setCancelCourtBookingChecked(false)
        setCancellationEligibility(null)

        if (event.bookingId) {
          setCancelActivityConfirmOpen(true)
          setCheckingEligibility(true)
          try {
            const elig = await checkCancelEligibilityClient(
              groupId,
              event.bookingId
            )
            setCancellationEligibility(elig)
          } catch (err) {
            console.error("Error checking cancel eligibility:", err)
          } finally {
            setCheckingEligibility(false)
          }
        } else {
          setCancelActivityConfirmOpen(true)
        }
      },
      { featureName: "hủy hoạt động này" }
    )
  }

  const handleConfirmCancellation = () => {
    if (!activityToCancel) return
    if (activityToCancel.bookingId && cancelCourtBookingChecked) {
      cancelBookingMutation.mutate(activityToCancel.bookingId)
    } else {
      deleteMutation.mutate(activityToCancel.id)
    }
  }

  const openCreateDialog = () => {
    setEditingEvent(null)
    setFormOpen(true)
  }

  const openEditDialog = (event: GroupActivity) => {
    setEditingEvent(event)
    setFormOpen(true)
  }

  const openDetailDrawer = (event: GroupActivity) => {
    setSelectedEventForDetail(event)
    setDetailOpen(true)
  }

  if (isLoading && !events.length) {
    return <GroupActivityLoadingSkeleton />
  }

  const renderListView = () => {
    // Filter activities that occur in the current selectedMonth
    const filteredEvents = events.filter((e) => {
      const eDate = new Date(e.startAt)
      return (
        eDate.getMonth() === currentMonth.getMonth() &&
        eDate.getFullYear() === currentMonth.getFullYear()
      )
    })

    return (
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {t("activitySchedule.noActivitiesMonth")}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
              )
              .map((event) => {
                const stats = (() => {
                  if (
                    event.attendingMemberCount !== undefined ||
                    event.attendingGuestCount !== undefined
                  ) {
                    const mCount = event.attendingMemberCount ?? 0
                    const gCount = event.attendingGuestCount ?? 0
                    if (gCount > 0) {
                      return t(
                        "activitySchedule.participantsSummaryShort",
                        "{{members}} members + {{guests}} guests",
                        { members: mCount, guests: gCount }
                      )
                    }
                    return t(
                      "activitySchedule.participantsSummaryMembersOnly",
                      "{{members}} members",
                      { members: mCount }
                    )
                  }
                  const attendance = event.attendance ?? []
                  const attending = attendance.filter(
                    (a) => a.status !== "ABSENT"
                  )
                  const mCount = attending.length
                  const gCount = attending.reduce(
                    (sum, a) =>
                      sum + (a.guestStatus === "APPROVED" ? a.guestCount : 0),
                    0
                  )
                  return t(
                    "activitySchedule.participantsSummaryTotal",
                    "{{total}} participants",
                    { total: mCount + gCount }
                  )
                })()

                return (
                  <Card
                    key={event.id}
                    className="group-feature-root cursor-pointer border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    onClick={() => openDetailDrawer(event)}
                  >
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 text-base font-bold">
                          {event.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClass(event.status)}
                        >
                          {t(getStatusLabel(event.status))}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.startAt), "dd/MM/yyyy")} ·{" "}
                        {format(new Date(event.startAt), "HH:mm")} -{" "}
                        {format(new Date(event.endAt), "HH:mm")}
                      </p>

                      {event.location && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          <span className="truncate">{event.location}</span>
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="size-3 text-muted-foreground" />
                          {stats}
                        </span>
                        {canManageActivities && (
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => openEditDialog(event)}
                              disabled={updateMutation.isPending}
                            >
                              <Edit className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteClick(event)}
                              disabled={
                                deleteMutation.isPending ||
                                cancelBookingMutation.isPending
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}
      </div>
    )
  }

  const content = (
    <div className={embedded ? "space-y-6" : "space-y-6 px-4 py-6 pb-8"}>
      {!embedded && (
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("activitySchedule.calendarTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("activitySchedule.upcomingDesc")}
          </p>
        </div>
      )}

      <Card className="mb-6 border-border bg-card/65 shadow-sm backdrop-blur-sm">
        <CardContent className="flex w-full flex-col items-center justify-between gap-6 p-4 md:flex-row">
          <div className="flex flex-wrap items-center gap-4">
            <CalendarNavigation
              currentDate={currentMonth}
              onMonthChange={(month) =>
                setCurrentMonth(
                  (prev) => new Date(prev.getFullYear(), month, 1)
                )
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

            <Select
              value={viewMode}
              onValueChange={(val: "calendar" | "list") => setViewMode(val)}
            >
              <SelectTrigger className="w-32 border bg-background text-xs">
                <SelectValue
                  placeholder={t("activitySchedule.viewMode", "Chế độ xem")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calendar" className="text-xs">
                  {t("activitySchedule.viewModeCalendar", "Lịch")}
                </SelectItem>
                <SelectItem value="list" className="text-xs">
                  {t("activitySchedule.viewModeList", "Danh sách")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {canManageActivities && !isArchived && (
            <Button
              onClick={() =>
                guardWriteAction(openCreateDialog, {
                  featureName: "tạo hoạt động mới",
                })
              }
              className="border border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Plus className="mr-2 size-4" />
              {t("activitySchedule.btnCreateActivity")}
            </Button>
          )}
        </CardContent>
      </Card>

      {viewMode === "list" ? (
        renderListView()
      ) : (
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
                  {t(
                    "activitySchedule.selectedDateTitle",
                    "Hoạt động ngày {{date}}",
                    { date: format(selectedDate, "dd/MM/yyyy") }
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("activitySchedule.activityCount", {
                    date: format(selectedDate, "dd/MM/yyyy"),
                    count: selectedDayEvents.length,
                  })}
                </p>
              </div>

              {canManageActivities && !isArchived && (
                <Button
                  className="w-full border border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() =>
                    guardWriteAction(openCreateDialog, {
                      featureName: "tạo hoạt động mới",
                    })
                  }
                >
                  <Plus className="mr-2 size-4" />
                  {t("activitySchedule.btnCreateActivity")}
                </Button>
              )}

              {selectedDayEvents.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  {t(
                    "activitySchedule.noActivitiesDay",
                    "Không có hoạt động nào trong ngày này."
                  )}
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
                    .map((event) => {
                      const eventStats = (() => {
                        if (
                          event.attendingMemberCount !== undefined ||
                          event.attendingGuestCount !== undefined
                        ) {
                          const mCount = event.attendingMemberCount ?? 0
                          const gCount = event.attendingGuestCount ?? 0
                          if (gCount > 0) {
                            return t(
                              "activitySchedule.participantsSummaryShort",
                              "{{members}} members + {{guests}} guests",
                              { members: mCount, guests: gCount }
                            )
                          }
                          return t(
                            "activitySchedule.participantsSummaryMembersOnly",
                            "{{members}} members",
                            { members: mCount }
                          )
                        }
                        const attendance = event.attendance ?? []
                        const attending = attendance.filter(
                          (a) => a.status !== "ABSENT"
                        )
                        const mCount = attending.length
                        const gCount = attending.reduce(
                          (sum, a) =>
                            sum +
                            (a.guestStatus === "APPROVED" ? a.guestCount : 0),
                          0
                        )
                        return t(
                          "activitySchedule.participantsSummaryTotal",
                          "{{total}} participants",
                          { total: mCount + gCount }
                        )
                      })()

                      const isAbsent = event.myAttendance?.status === "ABSENT"

                      return (
                        <div
                          key={event.id}
                          className="group-feature-root group relative cursor-pointer rounded-xl border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                          onClick={() => openDetailDrawer(event)}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <p className="line-clamp-2 text-sm font-bold">
                              {event.title}
                            </p>
                            <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center">
                              <Badge
                                variant="outline"
                                className={getStatusBadgeClass(event.status)}
                              >
                                {t(getStatusLabel(event.status))}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.startAt), "HH:mm")} -{" "}
                            {format(new Date(event.endAt), "HH:mm")}
                          </p>
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="size-3 text-muted-foreground" />
                            <span>{eventStats}</span>
                          </p>
                          <div className="mt-3 flex min-h-[32px] items-center justify-between">
                            <div>
                              {event.myAttendance && (
                                <Badge
                                  variant="outline"
                                  className={
                                    isAbsent
                                      ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400"
                                      : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  }
                                >
                                  {isAbsent ? t("absent") : t("attending")}
                                </Badge>
                              )}
                            </div>

                            {canManageActivities && !isArchived && (
                              <div
                                className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-primary"
                                  onClick={() => openEditDialog(event)}
                                  disabled={updateMutation.isPending}
                                >
                                  <Edit className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDeleteClick(event)}
                                  disabled={
                                    deleteMutation.isPending ||
                                    cancelBookingMutation.isPending
                                  }
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <GroupActivityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingEvent={editingEvent}
        activeGroupId={groupId}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {selectedEventForDetail && (
        <GroupActivityDetailDrawer
          open={detailOpen}
          onOpenChange={setDetailOpen}
          activityId={selectedEventForDetail.id}
          groupId={groupId}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
          readOnly={!hasValidSubscription || isArchived}
          onEdit={() => {
            guardWriteAction(
              () => {
                setEditingEvent(selectedEventForDetail)
                setFormOpen(true)
              },
              { featureName: "chỉnh sửa hoạt động" }
            )
          }}
        />
      )}

      <PermissionDialog />

      {/* Cascade Cancel Confirmation Dialog */}
      <Dialog
        open={cancelActivityConfirmOpen}
        onOpenChange={setCancelActivityConfirmOpen}
      >
        <DialogContent
          className="group-feature-root sm:max-w-[450px]"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              {t("activitySchedule.confirmCancelActivityTitle")}
            </DialogTitle>
            <DialogDescription>
              {activityToCancel?.bookingId ? (
                <div className="space-y-4 text-foreground">
                  <p className="text-sm">
                    {t(
                      "activitySchedule.linkedBookingNotice",
                      "Sự kiện này đang liên kết với một lịch đặt sân tại cụm sân."
                    )}
                  </p>
                  {checkingEligibility ? (
                    <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      {t(
                        "activitySchedule.checkingCancellationPolicy",
                        "Đang kiểm tra chính sách hủy đặt sân..."
                      )}
                    </div>
                  ) : cancellationEligibility ? (
                    <p className="rounded-md border border-amber-200 bg-muted p-2.5 text-xs text-amber-800">
                      {cancellationEligibility.warningMessage}
                    </p>
                  ) : null}

                  <label className="flex cursor-pointer items-center gap-2 py-1 text-sm font-medium select-none">
                    <input
                      type="checkbox"
                      checked={cancelCourtBookingChecked}
                      onChange={(e) =>
                        setCancelCourtBookingChecked(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-border bg-background accent-primary"
                    />
                    <span>{t("activitySchedule.cancelBookingCascade")}</span>
                  </label>
                </div>
              ) : (
                t("activitySchedule.confirmCancelActivityDesc")
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCancelActivityConfirmOpen(false)
                setActivityToCancel(null)
              }}
              disabled={
                deleteMutation.isPending || cancelBookingMutation.isPending
              }
            >
              {t("activitySchedule.btnCancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmCancellation}
              disabled={
                deleteMutation.isPending ||
                cancelBookingMutation.isPending ||
                checkingEligibility
              }
            >
              {(deleteMutation.isPending ||
                cancelBookingMutation.isPending) && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {t("activitySchedule.btnConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  return embedded ? (
    content
  ) : (
    <div className="mx-auto w-full max-w-7xl">{content}</div>
  )
}
