"use client"

import { CalendarClock, TriangleAlert } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { PageContainer } from "@/components/page-container"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  MOCK_EVENTS,
  MOCK_GROUPS,
  MOCK_MEMBERS,
  MOCK_VENUES,
} from "@/features/group-activity-schedule/group-activity-schedule.mock"
import type {
  ActivityTypeFilter,
  CalendarView,
  GroupActivityGroup,
  GroupEvent,
  PeriodFilter,
} from "@/features/group-activity-schedule/group-activity-schedule.types"
import {
  filterEvents,
  getGroupById,
  getGroupEvents,
  getGroupMembers,
  getGroupVenues,
} from "@/features/group-activity-schedule/group-activity-schedule.utils"

import { GroupActivityCalendarView } from "./group-activity-calendar-view"
import { GroupActivityDetailDrawer } from "./group-activity-detail-drawer"
import { GroupActivityFormDialog } from "./group-activity-form-dialog"
import { GroupActivityGroupContextCard } from "./group-activity-group-context-card"
import { GroupActivityLoadingSkeleton } from "./group-activity-loading-skeleton"
import { GroupActivityToolbar } from "./group-activity-toolbar"
import { GroupActivityUpcomingList } from "./group-activity-upcoming-list"

interface GroupActivitySchedulePageProps {
  initialGroupId?: string
}

export function GroupActivitySchedulePage({
  initialGroupId,
}: GroupActivitySchedulePageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<GroupEvent[]>(MOCK_EVENTS)
  const [keyword, setKeyword] = useState("")
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("week")
  const [activityTypeFilter, setActivityTypeFilter] =
    useState<ActivityTypeFilter>("all")
  const [calendarView, setCalendarView] = useState<CalendarView>("month")
  const activeGroupId = initialGroupId ?? MOCK_GROUPS[0]?.id ?? ""

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<GroupEvent | null>(null)
  const [detailEvent, setDetailEvent] = useState<GroupEvent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GroupEvent | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)

    return () => clearTimeout(timer)
  }, [])

  const activeGroup = useMemo<GroupActivityGroup | undefined>(
    () => getGroupById(MOCK_GROUPS, activeGroupId) ?? MOCK_GROUPS[0],
    [activeGroupId]
  )

  const groupEvents = useMemo(
    () => getGroupEvents(events, activeGroup?.id ?? activeGroupId),
    [activeGroup?.id, activeGroupId, events]
  )

  const groupMembers = useMemo(
    () => getGroupMembers(MOCK_MEMBERS, activeGroup?.id ?? activeGroupId),
    [activeGroup?.id, activeGroupId]
  )

  const groupVenues = useMemo(
    () => getGroupVenues(MOCK_VENUES, activeGroup?.id ?? activeGroupId),
    [activeGroup?.id, activeGroupId]
  )

  const filteredEvents = useMemo(
    () =>
      filterEvents(
        groupEvents,
        keyword,
        periodFilter,
        groupVenues,
        activeGroup?.id ?? activeGroupId,
        activityTypeFilter
      ),
    [
      activeGroup?.id,
      activeGroupId,
      activityTypeFilter,
      groupEvents,
      groupVenues,
      keyword,
      periodFilter,
    ]
  )

  const handleCreate = (
    payload: Omit<GroupEvent, "id" | "createdAt" | "updatedAt" | "updatedById">
  ) => {
    const now = new Date().toISOString()
    const activeGroupName = activeGroup?.name ?? ""

    setEvents((prev) => [
      {
        ...payload,
        groupId: activeGroup?.id ?? activeGroupId,
        groupName: activeGroupName,
        id: `evt-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        updatedById: payload.createdById,
      },
      ...prev,
    ])
  }

  const handleUpdate = (
    eventId: string,
    payload: Omit<GroupEvent, "id" | "createdAt" | "updatedAt" | "updatedById">
  ) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              ...payload,
              groupId: activeGroup?.id ?? activeGroupId,
              groupName: activeGroup?.name ?? event.groupName,
              updatedAt: new Date().toISOString(),
              updatedById: payload.createdById,
            }
          : event
      )
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) {
      return
    }

    setEvents((prev) => prev.filter((event) => event.id !== deleteTarget.id))
    if (detailEvent?.id === deleteTarget.id) {
      setDetailEvent(null)
    }
    if (editingEvent?.id === deleteTarget.id) {
      setEditingEvent(null)
    }
    setDeleteTarget(null)
  }

  if (isLoading) {
    return (
      <PageContainer>
        <GroupActivityLoadingSkeleton />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6 pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Lịch hoạt động nhóm
          </h1>
          <p className="text-muted-foreground">
            Quản lý lịch chơi, social và các hoạt động của nhóm.
          </p>
        </div>

        <GroupActivityGroupContextCard group={activeGroup ?? MOCK_GROUPS[0]} />

        <GroupActivityToolbar
          keyword={keyword}
          onKeywordChange={setKeyword}
          period={periodFilter}
          onPeriodChange={setPeriodFilter}
          activityType={activityTypeFilter}
          onActivityTypeChange={setActivityTypeFilter}
          onCreate={() => {
            setEditingEvent(null)
            setIsFormOpen(true)
          }}
        />

        {groupEvents.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClock className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Nhóm này chưa có hoạt động nào</EmptyTitle>
              <EmptyDescription>
                Hãy tạo sự kiện đầu tiên cho nhóm pickleball hiện tại.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : filteredEvents.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClock className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Không có sự kiện phù hợp</EmptyTitle>
              <EmptyDescription>
                Thử đổi bộ lọc thời gian hoặc từ khóa để xem thêm dữ liệu của
                nhóm này.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <GroupActivityCalendarView
              events={filteredEvents}
              venues={groupVenues}
              view={calendarView}
              onViewChange={setCalendarView}
              onOpenDetail={setDetailEvent}
            />

            <GroupActivityUpcomingList
              events={filteredEvents}
              members={groupMembers}
              venues={groupVenues}
              onOpenDetail={setDetailEvent}
              onEdit={(event) => {
                setEditingEvent(event)
                setIsFormOpen(true)
              }}
              onDelete={setDeleteTarget}
            />
          </>
        )}
      </div>

      <GroupActivityFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingEvent={editingEvent}
        activeGroupId={activeGroup?.id ?? activeGroupId}
        activeGroupName={activeGroup?.name ?? ""}
        members={groupMembers}
        venues={groupVenues}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <GroupActivityDetailDrawer
        open={Boolean(detailEvent)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailEvent(null)
          }
        }}
        event={detailEvent}
        members={groupMembers}
        venues={groupVenues}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sự kiện</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa sự kiện {deleteTarget?.title}? Thao tác này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              <TriangleAlert className="size-4" />
              Xóa sự kiện
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
