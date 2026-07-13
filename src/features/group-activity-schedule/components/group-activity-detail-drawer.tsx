"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle,
  CalendarClock,
  Check,
  Edit,
  FileText,
  Link as LinkIcon,
  Loader2,
  MapPin,
  MoreHorizontal,
  MoreVertical,
  Package,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  groupQueryKeys,
  listGroupCourtBookingsClient,
} from "@/features/groups/api/groups-client"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"
import { cn } from "@/lib/utils"

import {
  activityQueryKeys,
  approveActivityGuestsClient,
  cancelAbsenceClient,
  deleteActivityClient,
  deleteActivityGuestsClient,
  getActivityClient,
  getActivityMembersClient,
  getGuestRequestsClient,
  registerActivityGuestsClient,
  reportAbsenceClient,
  updateActivityClient,
} from "../api/activities-client"
import type { ActivityMember } from "../group-activity-schedule.types"
import {
  formatDateTime,
  getActivityTypeBadgeClass,
  getActivityTypeLabel,
  getStatusBadgeClass,
  getStatusLabel,
} from "../group-activity-schedule.utils"

interface GroupActivityDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activityId: string
  groupId: string
  currentUserRole?: string | null
  currentUserId?: string
  onEdit?: () => void
}

const formatBookingTime = (isoString?: string) => {
  if (!isoString) return ""
  try {
    if (isoString.length === 5 && isoString.includes(":")) return isoString
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return isoString
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  } catch {
    return isoString
  }
}

const formatBookingDate = (dateStr?: string) => {
  if (!dateStr) return ""
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "TV"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
}

export function GroupActivityDetailDrawer({
  open,
  onOpenChange,
  activityId,
  groupId,
  currentUserRole,
  currentUserId,
  onEdit,
}: GroupActivityDetailDrawerProps) {
  const { t, i18n } = useGroupsTranslation()
  const queryClient = useQueryClient()
  const dateLocale = i18n.language === "vi" ? "vi-VN" : "en-US"
  const [guestCountInput, setGuestCountInput] = useState("1")
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false)

  // Administrative mutations state
  const [isCancelActivityDialogOpen, setIsCancelActivityDialogOpen] =
    useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelConfirmChecked, setCancelConfirmChecked] = useState(false)
  const [isUnlinkBookingDialogOpen, setIsUnlinkBookingDialogOpen] =
    useState(false)
  const [isCancelMemberAbsenceDialogOpen, setIsCancelMemberAbsenceDialogOpen] =
    useState(false)
  const [selectedMemberForCancelAbsence, setSelectedMemberForCancelAbsence] =
    useState<{
      memberId: string
      userId?: string
      name: string
    } | null>(null)

  // Host Guest Card cancellation states
  const [isCancelRequestDialogOpen, setIsCancelRequestDialogOpen] =
    useState(false)
  const [selectedRequestForCancel, setSelectedRequestForCancel] = useState<{
    memberId: string
    userId: string
    role: string
    guestCount: number
    guestStatus: "PENDING" | "APPROVED" | "REJECTED" | null
    pendingGuestCount: number | null
    reportedAt: string
  } | null>(null)

  // Host Tabs & Check-in mock states
  const [guestFilterTab, setGuestFilterTab] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "REVISION"
  >("ALL")

  // Participants list filter states
  const [memberFilter, setMemberFilter] = useState<
    "ALL" | "ATTENDING" | "ABSENT"
  >("ALL")

  const isHost = useMemo(() => {
    const role = currentUserRole?.toUpperCase()
    return role === "OWNER" || role === "HOST" || role === "ADMIN"
  }, [currentUserRole])

  const isOwner = useMemo(() => {
    const role = currentUserRole?.toUpperCase()
    return role === "OWNER" || role === "ADMIN"
  }, [currentUserRole])

  // Query details of activity
  const { data: activity, isLoading } = useQuery({
    queryKey: activityQueryKeys.detail(groupId, activityId),
    queryFn: () => getActivityClient(groupId, activityId),
    enabled: open && !!activityId && !!groupId,
  })

  const activityEndAt = activity?.endAt
  const isPastEvent = useMemo(() => {
    if (!activityEndAt) return false
    return new Date(activityEndAt) < new Date()
  }, [activityEndAt])

  // Query group court bookings:
  // - Khi có courtBooking embedded trong activity response, không cần thiết fetch thêm để hiển thị
  // - Chỉ fetch khi host cần dropdown chọn sân mới để link (linked=false)
  const courtBookingsQuery = useQuery({
    queryKey: groupQueryKeys.courtBookings(groupId, {
      page: 1,
      limit: 100,
      linked: false,
    }),
    queryFn: () =>
      listGroupCourtBookingsClient(groupId, {
        page: 1,
        limit: 100,
        linked: false,
      }),
    enabled: open && !!groupId && isHost,
  })

  // Query all guest requests for Host and Member management
  const guestRequestsQuery = useQuery({
    queryKey: ["group-activities", groupId, activityId, "guests"],
    queryFn: () => getGuestRequestsClient(groupId, activityId),
    enabled: open && !!groupId && !!activityId,
  })

  // Query participants list
  const activityMembersQuery = useQuery({
    queryKey: activityQueryKeys.members(groupId, activityId),
    queryFn: () => getActivityMembersClient(groupId, activityId),
    enabled: open && !!groupId && !!activityId,
  })

  const filteredMembers = useMemo(() => {
    const list = activityMembersQuery.data?.data || []
    if (memberFilter === "ALL") return list
    return list.filter((m) => m.attendanceStatus === memberFilter)
  }, [activityMembersQuery.data?.data, memberFilter])

  // Find current user's attendance status
  const myAttendance = activity?.myAttendance || null

  const currentCount = useMemo(() => {
    if (!myAttendance) return 0
    if (
      myAttendance.pendingGuestCount !== null &&
      myAttendance.pendingGuestCount !== undefined
    ) {
      return myAttendance.pendingGuestCount
    }
    if (
      myAttendance.guestStatus === "APPROVED" ||
      myAttendance.guestStatus === "PENDING"
    ) {
      return myAttendance.guestCount
    }
    return 0
  }, [myAttendance])

  const isAbsent = myAttendance?.status === "ABSENT"

  // Check deadline constraints
  const { canToggleAbsence } = useMemo(() => {
    if (!activity) return { canToggleAbsence: true }
    const startTime = new Date(activity.startAt)
    const deadlineHours = activity.cancellationDeadlineHours ?? 24
    const cutoffTime = new Date(
      startTime.getTime() - deadlineHours * 60 * 60 * 1000
    )
    const past = new Date() > cutoffTime
    return {
      canToggleAbsence: !past || isHost,
    }
  }, [activity, isHost])

  // Lấy thông tin booking liên kết:
  // - Ưu tiên dùng courtBooking embedded từ activity response (không cần fetch)
  // - Fallback về courtBookingsQuery nếu response cũ chưa có courtBooking
  const linkedBooking = useMemo(() => {
    if (activity?.courtBooking) {
      return activity.courtBooking
    }
    const linkedId = activity?.courtBookingId || activity?.bookingId
    if (!linkedId || !courtBookingsQuery.data?.data) return null
    return (
      courtBookingsQuery.data.data.find(
        (b) => b.id === linkedId || b.bookingId === linkedId
      ) || null
    )
  }, [activity, courtBookingsQuery.data])

  // Count participants
  const { membersCount, guestsCount, totalParticipants } = useMemo(() => {
    const attendance = activity?.attendance ?? []
    const attending = attendance.filter((a) => a.status !== "ABSENT")

    const mCount =
      activity?.attendingMemberCount !== undefined &&
      activity?.attendingMemberCount !== null
        ? activity.attendingMemberCount
        : attending.length
    const gCount =
      activity?.attendingGuestCount !== undefined &&
      activity?.attendingGuestCount !== null
        ? activity.attendingGuestCount
        : attending.reduce(
            (sum, a) => sum + (a.guestStatus === "APPROVED" ? a.guestCount : 0),
            0
          )

    return {
      membersCount: mCount,
      guestsCount: gCount,
      totalParticipants: mCount + gCount,
    }
  }, [activity])

  // Helper to invalidate all queries related to this group and activity
  const invalidateQueries = () => {
    void queryClient.invalidateQueries({
      queryKey: ["group-activities", groupId],
    })
    void queryClient.invalidateQueries({
      queryKey: ["group-activities", groupId, "detail", activityId],
    })
    void queryClient.invalidateQueries({
      queryKey: ["group-activities", groupId, activityId, "guests"],
    })
    void queryClient.invalidateQueries({
      queryKey: activityQueryKeys.members(groupId, activityId),
    })
    // invalidate list court bookings to refetch all
    void queryClient.invalidateQueries({
      queryKey: [...groupQueryKeys.detail(groupId), "courtBookings"],
    })
  }

  // Mutations
  const reportAbsenceMutation = useMutation({
    mutationFn: () => reportAbsenceClient(groupId, activityId),
    onSuccess: () => {
      toast.success(t("activitySchedule.absenceSuccess"))
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || t("activitySchedule.absenceError"))
    },
  })

  const cancelAbsenceMutation = useMutation({
    mutationFn: (memberId?: string) =>
      cancelAbsenceClient(groupId, activityId, memberId),
    onSuccess: () => {
      toast.success(t("activitySchedule.cancelAbsenceSuccess"))
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || t("activitySchedule.cancelAbsenceError"))
    },
  })

  const registerGuestsMutation = useMutation({
    mutationFn: (count: number) =>
      registerActivityGuestsClient(groupId, activityId, count),
    onSuccess: () => {
      toast.success(t("activitySchedule.guestRequestSuccess"))
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || t("activitySchedule.guestRequestError"))
    },
  })

  const approveGuestMutation = useMutation({
    mutationFn: ({
      memberId,
      status,
    }: {
      memberId: string
      status: "APPROVED" | "REJECTED"
    }) => approveActivityGuestsClient(groupId, activityId, memberId, status),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === "APPROVED"
          ? t("activitySchedule.approveGuestSuccess")
          : t("activitySchedule.rejectGuestSuccess")
      )
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || t("activitySchedule.approveGuestError"))
    },
  })

  const deleteGuestMutation = useMutation({
    mutationFn: (memberId: string) =>
      deleteActivityGuestsClient(groupId, activityId, memberId),
    onSuccess: () => {
      toast.success(t("activitySchedule.deleteGuestSuccess"))
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || t("activitySchedule.deleteGuestError"))
    },
  })

  const linkBookingMutation = useMutation({
    mutationFn: (courtBookingId: string | null) =>
      updateActivityClient(groupId, activityId, { courtBookingId }),
    onSuccess: (updated) => {
      toast.success(
        updated.courtBookingId || updated.bookingId
          ? t("activitySchedule.linkBookingSuccess")
          : t("activitySchedule.unlinkBookingSuccess")
      )
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || t("activitySchedule.linkBookingError"))
    },
  })

  const deleteActivityMutation = useMutation({
    mutationFn: () => deleteActivityClient(groupId, activityId),
    onSuccess: () => {
      toast.success(t("activitySchedule.deleteActivitySuccess"))
      invalidateQueries()
      setIsCancelActivityDialogOpen(false)
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message || t("activitySchedule.deleteActivityError"))
    },
  })

  const finishActivityMutation = useMutation({
    mutationFn: () =>
      updateActivityClient(groupId, activityId, { status: "COMPLETED" }),
    onSuccess: () => {
      toast.success(t("activitySchedule.finishActivitySuccess"))
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || t("activitySchedule.finishActivityError"))
    },
  })

  const filteredRequests = useMemo(() => {
    const list = guestRequestsQuery.data?.data || []
    if (guestFilterTab === "ALL") return list
    if (guestFilterTab === "PENDING") {
      return list.filter((r) => r.guestStatus === "PENDING")
    }
    if (guestFilterTab === "APPROVED") {
      return list.filter((r) => r.guestStatus === "APPROVED")
    }
    if (guestFilterTab === "REJECTED") {
      return list.filter((r) => r.guestStatus === "REJECTED")
    }
    if (guestFilterTab === "REVISION") {
      return list.filter(
        (r) => r.pendingGuestCount !== null && r.pendingGuestCount !== undefined
      )
    }
    return list
  }, [guestRequestsQuery.data?.data, guestFilterTab])

  const renderAbsenceButton = () => {
    const btnLabel = isAbsent
      ? t("activitySchedule.btnCancelAbsence")
      : t("activitySchedule.btnAbsence")
    const buttonEl = (
      <Button
        variant="outline"
        disabled={
          !canToggleAbsence ||
          reportAbsenceMutation.isPending ||
          cancelAbsenceMutation.isPending
        }
        className={cn(
          "h-7 shrink-0 px-3 text-xs font-semibold transition-all",
          isAbsent
            ? "text-emerald-600 hover:bg-emerald-600/10"
            : "text-destructive hover:bg-destructive/10"
        )}
        size="sm"
      >
        {(reportAbsenceMutation.isPending ||
          cancelAbsenceMutation.isPending) && (
          <Loader2 className="mr-1 size-3 animate-spin" />
        )}
        {btnLabel}
      </Button>
    )

    if (!canToggleAbsence) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="shrink-0 cursor-not-allowed">{buttonEl}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("activitySchedule.pastDeadlineNotice")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>{buttonEl}</AlertDialogTrigger>
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              {isAbsent
                ? t("activitySchedule.confirmCancelAbsenceTitle")
                : t("activitySchedule.confirmAbsenceTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {isAbsent
                ? t("activitySchedule.confirmCancelAbsenceDesc")
                : t("activitySchedule.confirmAbsenceDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9 text-sm">
              {t("activitySchedule.btnCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                isAbsent
                  ? "h-9 bg-emerald-600 text-sm text-white hover:bg-emerald-700"
                  : "h-9 bg-destructive text-sm text-white hover:bg-destructive/90"
              }
              onClick={() => {
                if (isAbsent) {
                  cancelAbsenceMutation.mutate(undefined)
                } else {
                  reportAbsenceMutation.mutate()
                }
              }}
            >
              {t("activitySchedule.btnConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[600px] max-h-[90vh] max-w-md flex-col overflow-hidden bg-orange-50 p-5 md:max-w-lg md:p-6 dark:bg-zinc-800 dark:shadow-sm"
      >
        {/* Top-right Actions Bar (Kebab + Custom Close button in a single row) */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-1">
          {isHost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">
                    {t("activitySchedule.adminMenu")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* 1. Edit Option: Always shown for hosts */}
                <DropdownMenuItem
                  onClick={() => {
                    onOpenChange(false)
                    onEdit?.()
                  }}
                  className="cursor-pointer text-sm"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t("activitySchedule.adminMenuEdit")}
                </DropdownMenuItem>

                {/* 2. Finish Option: Only if isOwner, event in the past, and status is SCHEDULED */}
                {isOwner && isPastEvent && activity?.status === "SCHEDULED" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        finishActivityMutation.mutate()
                      }}
                      className="cursor-pointer text-sm font-semibold text-emerald-600 focus:bg-emerald-600/10 focus:text-emerald-600"
                      disabled={finishActivityMutation.isPending}
                    >
                      {finishActivityMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
                      ) : (
                        <Check className="mr-2 h-4 w-4 text-emerald-600" />
                      )}
                      {t(
                        "activitySchedule.adminMenuFinish",
                        "Đánh dấu kết thúc"
                      )}
                    </DropdownMenuItem>
                  </>
                )}

                {/* 3. Cancel Option: Always shown for hosts */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-sm font-bold text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => {
                    setCancelReason("")
                    setCancelConfirmChecked(false)
                    setIsCancelActivityDialogOpen(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                  {t("activitySchedule.adminMenuCancel")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full opacity-70 hover:bg-muted hover:opacity-100"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t("activitySchedule.btnClose")}</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <DialogHeader className="px-0 pr-10 pb-3">
              <DialogTitle>
                <Skeleton className="h-8 w-3/4" />
              </DialogTitle>
              <DialogDescription asChild>
                <Skeleton className="h-4 w-1/2" />
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        ) : activity ? (
          <div className="flex h-full w-full min-w-0 flex-col overflow-hidden text-foreground">
            <DialogHeader className="px-0 pr-10 pb-3">
              <DialogTitle className="text-xl font-extrabold text-[#1A56DB]">
                {activity.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t("activitySchedule.detailTitle")}
              </DialogDescription>

              <div className="mt-2 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={getActivityTypeBadgeClass(activity.activityType)}
                >
                  {t(getActivityTypeLabel(activity.activityType))}
                </Badge>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass(activity.status)}
                >
                  {t(getStatusLabel(activity.status))}
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  <Users className="size-3" />
                  <span>
                    {t("activitySchedule.participantsSummary", {
                      total: totalParticipants,
                      members: membersCount,
                      guests: guestsCount,
                    })}
                  </span>
                </Badge>
              </div>
            </DialogHeader>

            <Tabs
              defaultValue="details"
              className="flex flex-1 flex-col overflow-hidden"
            >
              <TabsList className="mb-3 grid w-full grid-cols-2 rounded-lg bg-muted/40 p-1">
                <TabsTrigger value="details" className="text-xs font-semibold">
                  {t("activitySchedule.tabDetails", "Chi tiết")}
                </TabsTrigger>
                <TabsTrigger value="members" className="text-xs font-semibold">
                  {t("activitySchedule.tabMembers", "Thành viên")}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="details"
                className="min-w-0 flex-1 overflow-y-auto pr-1.5 focus-visible:outline-none"
              >
                <div className="w-full space-y-4 overflow-x-hidden pr-0.5 pb-2">
                  {/* 1. Member Information & Absence Button */}
                  {currentUserId && (
                    <div className="flex w-full min-w-0 items-center justify-between rounded-lg border border-muted/50 bg-muted/20 px-3 py-2">
                      <div className="mr-2 flex flex-col gap-0.5 truncate text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="size-6 shrink-0 text-muted-foreground" />
                          <span className="truncate font-medium text-foreground">
                            {t("activitySchedule.you")} (
                            {myAttendance?.member?.name || t("members")})
                          </span>
                        </div>
                        <div className="pl-8 text-sm font-semibold">
                          {t("activitySchedule.statusLabel")}{" "}
                          {isAbsent ? (
                            <span className="text-rose-600">
                              {t("activitySchedule.isAbsentLabel")}
                            </span>
                          ) : (
                            <span className="text-emerald-600">
                              {t("activitySchedule.isAttendingLabel")}
                            </span>
                          )}
                        </div>
                      </div>
                      {renderAbsenceButton()}
                    </div>
                  )}

                  {/* Unified activity info card with light blue meetup theme */}
                  <div className="w-full space-y-2 rounded-lg border border-sky-100 bg-sky-50/50 p-4 shadow-sm dark:border-sky-900/50 dark:bg-sky-950/30">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-sky-700 dark:text-sky-400">
                      <FileText className="size-4 shrink-0 text-sky-600 dark:text-sky-400" />
                      {t("activitySchedule.activityInfo")}
                    </h4>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5 font-semibold text-sky-800 dark:text-sky-300">
                        <CalendarClock className="size-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                        <span>
                          {t("activitySchedule.timeLabel", {
                            start: formatDateTime(activity.startAt),
                            end: formatDateTime(activity.endAt),
                          })}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5 font-semibold text-sky-800 dark:text-sky-300">
                        <MapPin className="size-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                        <span>
                          {t("activitySchedule.locationLabel", {
                            location:
                              activity.location ||
                              t("activitySchedule.locationUnknown"),
                          })}
                        </span>
                      </p>
                      {activity.description && (
                        <p className="mt-2 border-t border-dashed border-sky-200 pt-2 text-xs leading-relaxed whitespace-pre-wrap text-foreground dark:border-sky-800/50">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Linked court booking simple snapshot info */}
                  {linkedBooking && (
                    <div className="w-full space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        <LinkIcon className="size-4 shrink-0" />
                        {t("activitySchedule.linkedBookingTitle")}
                      </h4>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <p className="text-sm font-semibold text-foreground dark:text-foreground">
                          {linkedBooking.title || t("courtBookings")}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 shrink-0" />
                          <span>{linkedBooking.centerName}</span>
                        </p>
                        <p>
                          {t("activitySchedule.bookingDateLabel", {
                            date: formatBookingDate(linkedBooking.date),
                          })}
                        </p>
                        <p>
                          {t("activitySchedule.bookingTimeLabel", {
                            start: formatBookingTime(linkedBooking.startTime),
                            end: formatBookingTime(linkedBooking.endTime),
                          })}
                        </p>
                        {isHost && (
                          <div className="flex justify-end border-t border-dashed border-emerald-500/20 pt-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                              onClick={() => setIsUnlinkBookingDialogOpen(true)}
                              disabled={linkBookingMutation.isPending}
                            >
                              {t("activitySchedule.btnUnlinkBooking")}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. Walk-in Guest request action for attending member */}
                  {currentUserId && !isAbsent && (
                    <div className="pt-1">
                      <Button
                        onClick={() => {
                          const currentVal =
                            myAttendance?.pendingGuestCount ??
                            myAttendance?.guestCount ??
                            1
                          setGuestCountInput(
                            String(currentVal > 0 ? currentVal : 1)
                          )
                          setIsGuestDialogOpen(true)
                        }}
                        disabled={registerGuestsMutation.isPending}
                        className="flex h-9 w-full items-center justify-center gap-2 bg-[#6B46C1] text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#553C9A]"
                      >
                        {registerGuestsMutation.isPending && (
                          <Loader2 className="mr-1.5 size-3 animate-spin text-white" />
                        )}
                        {myAttendance &&
                        (myAttendance.guestCount > 0 ||
                          (myAttendance.pendingGuestCount &&
                            myAttendance.pendingGuestCount > 0))
                          ? t("activitySchedule.btnRegisterGuestsUpdate", {
                              count:
                                myAttendance.pendingGuestCount ??
                                myAttendance.guestCount,
                            })
                          : `+ ${t("activitySchedule.btnRegisterGuests")}`}
                      </Button>

                      {myAttendance &&
                        (myAttendance.guestCount > 0 ||
                          (myAttendance.pendingGuestCount &&
                            myAttendance.pendingGuestCount > 0)) && (
                          <div className="mt-2 rounded-md border border-muted/50 bg-muted/20 px-2 py-2 text-center text-xs text-muted-foreground">
                            <div className="flex flex-col gap-1">
                              {myAttendance.guestStatus === "APPROVED" &&
                                myAttendance.guestCount > 0 && (
                                  <span className="font-semibold text-emerald-600">
                                    {t("activitySchedule.guestStatusApproved", {
                                      count: myAttendance.guestCount,
                                    })}
                                  </span>
                                )}
                              {myAttendance.pendingGuestCount !== null &&
                              myAttendance.pendingGuestCount !== undefined ? (
                                <span className="font-semibold text-yellow-600">
                                  {myAttendance.guestStatus === "APPROVED"
                                    ? t(
                                        "activitySchedule.guestStatusPending",
                                        "Đang chờ duyệt {{count}} khách chơi vãng lai.",
                                        {
                                          count: myAttendance.pendingGuestCount,
                                        }
                                      )
                                    : t("activitySchedule.guestStatusPending", {
                                        count: myAttendance.pendingGuestCount,
                                      })}
                                </span>
                              ) : (
                                myAttendance.guestStatus !== "APPROVED" && (
                                  <span
                                    className={cn(
                                      "font-semibold",
                                      myAttendance.guestStatus === "PENDING"
                                        ? "text-yellow-600"
                                        : "text-rose-600"
                                    )}
                                  >
                                    {myAttendance.guestStatus === "PENDING"
                                      ? t(
                                          "activitySchedule.guestStatusPending",
                                          { count: myAttendance.guestCount }
                                        )
                                      : t(
                                          "activitySchedule.guestStatusRejected",
                                          { count: myAttendance.guestCount }
                                        )}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Form dialog for Guest Request */}
                  <AlertDialog
                    open={isGuestDialogOpen}
                    onOpenChange={setIsGuestDialogOpen}
                  >
                    <AlertDialogContent className="p-6 sm:max-w-sm">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold">
                          {t("activitySchedule.guestRequestDialogTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                          {t("activitySchedule.guestRequestDialogDesc")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                          {t("activitySchedule.guestRequestCountLabel")}
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={guestCountInput}
                          onChange={(e) => setGuestCountInput(e.target.value)}
                          className="h-9 w-full bg-background text-xs"
                          placeholder={t(
                            "activitySchedule.guestRequestInputPlaceholder"
                          )}
                        />
                        {parseInt(guestCountInput) === currentCount && (
                          <p className="mt-1.5 text-[11px] font-medium text-amber-600">
                            {t(
                              "activitySchedule.guestCountSameError",
                              "Số khách mới phải khác số lượng hiện tại ({{count}} khách).",
                              { count: currentCount }
                            )}
                          </p>
                        )}
                      </div>
                      <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel
                          onClick={() => setIsGuestDialogOpen(false)}
                          className="h-8 text-xs"
                        >
                          {t("activitySchedule.btnCancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            const val = parseInt(guestCountInput || "1")
                            if (isNaN(val) || val < 1) {
                              toast.error(
                                t("activitySchedule.guestRequestError")
                              )
                              return
                            }
                            registerGuestsMutation.mutate(val)
                            setIsGuestDialogOpen(false)
                          }}
                          disabled={
                            registerGuestsMutation.isPending ||
                            isNaN(parseInt(guestCountInput)) ||
                            parseInt(guestCountInput) < 1 ||
                            parseInt(guestCountInput) === currentCount
                          }
                          className="h-8 bg-[#6B46C1] text-xs text-white hover:bg-[#553C9A]"
                        >
                          {t("activitySchedule.guestRequestSubmit")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Quick Link Booking selector (Host only) - Only visible if NOT already linked */}
                  {isHost &&
                    !activity.courtBookingId &&
                    !activity.bookingId && (
                      <div className="w-full space-y-2 rounded-lg border bg-muted/20 p-4">
                        <h4 className="flex items-center gap-2 text-sm font-semibold">
                          <LinkIcon className="size-4 text-muted-foreground" />
                          {t("activitySchedule.quickLinkBookingTitle")}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Select
                            onValueChange={(val) =>
                              linkBookingMutation.mutate(val)
                            }
                            disabled={
                              linkBookingMutation.isPending ||
                              courtBookingsQuery.isLoading
                            }
                          >
                            <SelectTrigger className="w-full bg-background text-xs">
                              <SelectValue
                                placeholder={t(
                                  "activitySchedule.quickLinkBookingPlaceholder"
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {courtBookingsQuery.data?.data
                                ?.filter((b) => !b.isLinked)
                                .map((b) => (
                                  <SelectItem
                                    key={b.id}
                                    value={b.id}
                                    className="text-xs"
                                  >
                                    {b.centerName} - {formatBookingDate(b.date)}{" "}
                                    ({formatBookingTime(b.startTime)} -{" "}
                                    {formatBookingTime(b.endTime)})
                                  </SelectItem>
                                ))}
                              {(!courtBookingsQuery.data?.data ||
                                courtBookingsQuery.data.data.length === 0) && (
                                <SelectItem
                                  value="none"
                                  disabled
                                  className="text-xs"
                                >
                                  {t("activitySchedule.quickLinkBookingEmpty")}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                  {/* 3. Host Guest Request Management Panel with Filter tabs */}
                  {isHost && (
                    <div className="w-full min-w-0 space-y-3 rounded-lg border bg-muted/10 p-4">
                      <div className="mb-2 flex w-full flex-col gap-1 border-b pb-2">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Users className="size-4 text-[#1A56DB]" />
                          {t("activitySchedule.guestManagementTitle")}
                        </h4>

                        {/* Filter Tabs */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(
                            [
                              "ALL",
                              "PENDING",
                              "APPROVED",
                              "REJECTED",
                              "REVISION",
                            ] as const
                          ).map((tab) => {
                            const label =
                              tab === "ALL"
                                ? t("activitySchedule.guestFilterAll")
                                : tab === "PENDING"
                                  ? t("activitySchedule.guestFilterPending")
                                  : tab === "APPROVED"
                                    ? t("activitySchedule.guestFilterApproved")
                                    : tab === "REJECTED"
                                      ? t(
                                          "activitySchedule.guestFilterRejected"
                                        )
                                      : t(
                                          "activitySchedule.guestFilterRevision",
                                          "Yêu cầu đổi"
                                        )
                            const isActive = guestFilterTab === tab
                            return (
                              <Button
                                key={tab}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-7 shrink-0 rounded-md px-2.5 text-xs font-semibold transition-all",
                                  isActive
                                    ? "bg-[#1A56DB]/10 font-bold text-[#1A56DB] hover:bg-[#1A56DB]/15"
                                    : "text-muted-foreground hover:bg-muted"
                                )}
                                onClick={() => setGuestFilterTab(tab)}
                              >
                                {label}
                              </Button>
                            )
                          })}
                        </div>
                      </div>

                      {guestRequestsQuery.isLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : filteredRequests.length > 0 ? (
                        <div className="space-y-2.5">
                          {filteredRequests.map((req) => {
                            // Ưu tiên name từ requester object (changelog #3), fallback về tìm trong attendance
                            const memberName =
                              req.requester?.name ||
                              req.name ||
                              activity?.attendance?.find(
                                (a) => a.memberId === req.memberId
                              )?.member?.name ||
                              `Thành viên (ID: ${req.memberId.slice(0, 8)})`
                            const requesterAvatarUrl =
                              req.requester?.avatarUrl || req.avatarUrl || null
                            const requesterEmail =
                              req.requester?.email || req.email || ""
                            const hasPendingDraft =
                              req.pendingGuestCount !== null &&
                              req.pendingGuestCount !== undefined

                            return (
                              <div
                                key={req.memberId}
                                className="relative flex w-full flex-col gap-2 rounded-lg border bg-card p-3 text-sm shadow-sm"
                              >
                                <div className="flex min-w-0 items-start justify-between gap-2 pr-6">
                                  <div className="flex min-w-0 items-center gap-2">
                                    {requesterAvatarUrl ? (
                                      <img
                                        src={requesterAvatarUrl}
                                        alt={memberName}
                                        className="size-7 shrink-0 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                        {memberName.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <span className="block truncate text-sm font-bold text-foreground">
                                        {t(
                                          "activitySchedule.guestRequestLabel",
                                          { name: memberName }
                                        )}
                                      </span>
                                      {requesterEmail && (
                                        <span className="block truncate text-xs text-muted-foreground">
                                          {requesterEmail}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-1.5">
                                    {hasPendingDraft ? (
                                      <Badge
                                        variant="outline"
                                        className="border-amber-200 bg-amber-50 px-1.5 py-0 text-xs text-amber-700"
                                      >
                                        {t(
                                          "activitySchedule.guestStatusBadgeChange"
                                        )}
                                      </Badge>
                                    ) : req.guestStatus === "PENDING" ? (
                                      <Badge
                                        variant="outline"
                                        className="border-amber-200 bg-amber-50 px-1.5 py-0 text-xs text-amber-700"
                                      >
                                        {t(
                                          "activitySchedule.guestStatusBadgePending"
                                        )}
                                      </Badge>
                                    ) : req.guestStatus === "APPROVED" ? (
                                      <Badge
                                        variant="outline"
                                        className="border-emerald-200 bg-emerald-50 px-1.5 py-0 text-xs text-emerald-700"
                                      >
                                        {t(
                                          "activitySchedule.guestStatusBadgeApproved"
                                        )}
                                      </Badge>
                                    ) : req.guestStatus === "REJECTED" ? (
                                      <Badge
                                        variant="outline"
                                        className="border-rose-200 bg-rose-50 px-1.5 py-0 text-xs text-rose-700"
                                      >
                                        {t(
                                          "activitySchedule.guestStatusBadgeRejected"
                                        )}
                                      </Badge>
                                    ) : null}
                                  </div>
                                </div>

                                {/* Card Kebab Menu for Host Administration */}
                                {isHost && (
                                  <div className="absolute top-2 right-2">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 shrink-0 rounded-full"
                                        >
                                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          className="text-xs font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive"
                                          onClick={() => {
                                            setSelectedRequestForCancel(req)
                                            setIsCancelRequestDialogOpen(true)
                                          }}
                                        >
                                          {t(
                                            "activitySchedule.guestActionCancel"
                                          )}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                )}

                                <div className="flex w-full min-w-0 items-center justify-between gap-2 text-xs text-muted-foreground">
                                  <div className="min-w-0 text-left text-xs">
                                    {hasPendingDraft ? (
                                      <p className="truncate">
                                        {t("activitySchedule.guestInfoChange", {
                                          pendingCount: req.pendingGuestCount,
                                          count: req.guestCount,
                                        })}
                                      </p>
                                    ) : (
                                      <p className="truncate">
                                        {t("activitySchedule.guestInfoCount", {
                                          count: req.guestCount,
                                        })}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex shrink-0 items-center gap-1">
                                    {(req.guestStatus === "PENDING" ||
                                      hasPendingDraft) && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex h-7 items-center gap-1 border-emerald-200 px-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                          onClick={() =>
                                            approveGuestMutation.mutate({
                                              memberId: req.memberId,
                                              status: "APPROVED",
                                            })
                                          }
                                          disabled={
                                            approveGuestMutation.isPending
                                          }
                                        >
                                          <Check className="h-3 w-3" />
                                          {t("activitySchedule.btnApprove")}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex h-7 items-center gap-1 border-rose-200 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                          onClick={() =>
                                            approveGuestMutation.mutate({
                                              memberId: req.memberId,
                                              status: "REJECTED",
                                            })
                                          }
                                          disabled={
                                            approveGuestMutation.isPending
                                          }
                                        >
                                          <X className="h-3 w-3" />
                                          {t("activitySchedule.btnReject")}
                                        </Button>
                                      </>
                                    )}

                                    {req.guestStatus === "REJECTED" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 border-amber-200 px-2.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                        onClick={() => {
                                          if (
                                            confirm(
                                              t(
                                                "activitySchedule.confirmReinvite",
                                                { name: memberName }
                                              )
                                            )
                                          ) {
                                            deleteGuestMutation.mutate(
                                              req.memberId
                                            )
                                          }
                                        }}
                                        disabled={deleteGuestMutation.isPending}
                                      >
                                        {t("activitySchedule.btnReinvite")}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="py-4 text-center text-xs text-muted-foreground">
                          {t("activitySchedule.noGuestRequests")}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Host-only Information Panels: Equipment */}
                  {isHost &&
                    activity.equipment &&
                    activity.equipment.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold">
                          <Package className="size-4" />
                          {t("activitySchedule.thEquipment")}
                        </h4>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {activity.equipment.map((eq, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-md border bg-accent/30 px-3 py-2 text-sm"
                            >
                              <span>{eq.name}</span>
                              <Badge variant="secondary">x{eq.quantity}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </TabsContent>

              <TabsContent
                value="members"
                className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto pr-1.5 focus-visible:outline-none"
              >
                {/* 1. Member Filters */}
                <div className="mb-2 flex flex-wrap gap-1">
                  {(["ALL", "ATTENDING", "ABSENT"] as const).map((tab) => {
                    const label =
                      tab === "ALL"
                        ? t("activitySchedule.memberFilterAll", "Tất cả")
                        : tab === "ATTENDING"
                          ? t(
                              "activitySchedule.memberFilterAttending",
                              "Tham gia"
                            )
                          : t("activitySchedule.memberFilterAbsent", "Vắng mặt")
                    const isActive = memberFilter === tab
                    return (
                      <Button
                        key={tab}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 shrink-0 rounded-md px-3 text-xs font-semibold transition-all",
                          isActive
                            ? "hover:bg-orange-150 bg-orange-100 font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                            : "text-muted-foreground hover:bg-orange-100/50 hover:text-orange-700 dark:hover:bg-orange-950/20 dark:hover:text-orange-400"
                        )}
                        onClick={() => setMemberFilter(tab)}
                      >
                        {label}
                      </Button>
                    )
                  })}
                </div>

                {/* 2. Members List */}
                {activityMembersQuery.isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : activityMembersQuery.isError ? (
                  <div className="p-4 text-center text-xs text-rose-600">
                    {activityMembersQuery.error instanceof Error
                      ? activityMembersQuery.error.message
                      : t("errors.defaultError", "Đã xảy ra lỗi.")}
                  </div>
                ) : filteredMembers.length > 0 ? (
                  <div className="space-y-2">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.memberId}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-card/50 p-3 shadow-xs dark:bg-zinc-800/40"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={member.avatarUrl || ""} />
                            <AvatarFallback>
                              {getInitials(member.name || "TV")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                              {member.name}
                              {member.userId === currentUserId && (
                                <span className="rounded-md bg-primary/10 px-1.5 py-px text-[10px] font-semibold text-orange-500">
                                  {t("activitySchedule.you", "Bạn")}
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {member.guestCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="hover:bg-orange-105 h-5 border-none bg-orange-100 text-[10px] text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                            >
                              {t(
                                "activitySchedule.guestCountIndicator",
                                "+{{count}} khách",
                                { count: member.guestCount }
                              )}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              "px-2 py-0.5 text-xs",
                              member.attendanceStatus === "ATTENDING"
                                ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-400"
                            )}
                          >
                            {member.attendanceStatus === "ATTENDING"
                              ? t(
                                  "activitySchedule.isAttendingLabel",
                                  "Tham gia"
                                )
                                  .replace("✅", "")
                                  .trim()
                              : t("activitySchedule.isAbsentLabel", "Vắng")
                                  .replace("❌", "")
                                  .trim()}
                          </Badge>
                          {isHost && member.attendanceStatus === "ABSENT" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  className="h-6 w-6 text-muted-foreground hover:bg-muted"
                                >
                                  <MoreHorizontal className="size-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="text-xs"
                              >
                                <DropdownMenuItem
                                  className="cursor-pointer font-semibold text-destructive"
                                  onClick={() => {
                                    setSelectedMemberForCancelAbsence({
                                      memberId: member.memberId,
                                      userId: member.userId,
                                      name: member.name,
                                    })
                                    setIsCancelMemberAbsenceDialogOpen(true)
                                  }}
                                  disabled={cancelAbsenceMutation.isPending}
                                >
                                  {t(
                                    "activitySchedule.btnCancelAbsenceShort",
                                    "Huỷ báo vắng"
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    {t(
                      "activitySchedule.noParticipants",
                      "Không có thành viên nào."
                    )}
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            {t("activitySchedule.noActivities")}
          </div>
        )}

        {/* Host Cascade Cancel Activity Confirmation Dialog */}
        <Dialog
          open={isCancelActivityDialogOpen}
          onOpenChange={setIsCancelActivityDialogOpen}
        >
          <DialogContent className="p-6 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
                <AlertTriangle className="size-5" />
                {t("activitySchedule.confirmCancelActivityTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t("activitySchedule.confirmCancelActivityDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">
                  {t("activitySchedule.confirmCancelActivityReasonLabel")}
                </label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="min-h-[80px] w-full text-xs"
                  placeholder={t(
                    "activitySchedule.confirmCancelActivityReasonPlaceholder"
                  )}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCancelActivityDialogOpen(false)}
                className="h-8 text-xs"
              >
                {t("activitySchedule.confirmCancelActivityBtnCancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => deleteActivityMutation.mutate()}
                disabled={deleteActivityMutation.isPending}
                className="h-8 bg-destructive text-xs font-bold text-white hover:bg-destructive/90"
              >
                {deleteActivityMutation.isPending && (
                  <Loader2 className="mr-2 size-3 animate-spin" />
                )}
                {t("activitySchedule.confirmCancelActivityBtnConfirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Host Guest Request Cancellation Dialog */}
        <AlertDialog
          open={isCancelRequestDialogOpen}
          onOpenChange={setIsCancelRequestDialogOpen}
        >
          <AlertDialogContent className="sm:max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-destructive">
                {t("activitySchedule.guestActionCancel")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                {t("activitySchedule.deleteGuestError")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel
                onClick={() => setIsCancelRequestDialogOpen(false)}
                className="h-8 text-xs"
              >
                {t("activitySchedule.btnCancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedRequestForCancel) {
                    deleteGuestMutation.mutate(
                      selectedRequestForCancel.memberId
                    )
                  }
                  setIsCancelRequestDialogOpen(false)
                }}
                className="h-8 bg-destructive text-xs text-white hover:bg-destructive/90"
              >
                {t("activitySchedule.btnConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Unlink Booking Confirmation Dialog */}
        <AlertDialog
          open={isUnlinkBookingDialogOpen}
          onOpenChange={setIsUnlinkBookingDialogOpen}
        >
          <AlertDialogContent className="sm:max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-destructive">
                {t("activitySchedule.confirmUnlinkBookingTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                {t("activitySchedule.confirmUnlinkBookingDesc")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-2">
              <AlertDialogCancel
                onClick={() => setIsUnlinkBookingDialogOpen(false)}
                className="h-9 text-sm"
              >
                {t("activitySchedule.btnCancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  linkBookingMutation.mutate(null)
                  setIsUnlinkBookingDialogOpen(false)
                }}
                disabled={linkBookingMutation.isPending}
                className="h-9 bg-red-500 text-sm text-white hover:bg-red-700"
              >
                {t("activitySchedule.confirmUnlinkBookingBtnConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Member Absence Confirmation Dialog */}
        <AlertDialog
          open={isCancelMemberAbsenceDialogOpen}
          onOpenChange={setIsCancelMemberAbsenceDialogOpen}
        >
          <AlertDialogContent className="sm:max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-destructive">
                {t("activitySchedule.confirmCancelAbsenceTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                {selectedMemberForCancelAbsence?.userId === currentUserId
                  ? t("activitySchedule.confirmCancelAbsenceDesc")
                  : t("activitySchedule.confirmCancelAbsenceForMember", {
                      name: selectedMemberForCancelAbsence?.name ?? "",
                    })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-2">
              <AlertDialogCancel
                onClick={() => {
                  setIsCancelMemberAbsenceDialogOpen(false)
                  setSelectedMemberForCancelAbsence(null)
                }}
                className="h-9 text-sm"
              >
                {t("activitySchedule.btnCancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedMemberForCancelAbsence) {
                    cancelAbsenceMutation.mutate(
                      selectedMemberForCancelAbsence.memberId
                    )
                  }
                  setIsCancelMemberAbsenceDialogOpen(false)
                  setSelectedMemberForCancelAbsence(null)
                }}
                disabled={cancelAbsenceMutation.isPending}
                className="h-9 bg-red-500 text-sm text-white hover:bg-red-700"
              >
                {t("activitySchedule.btnConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
