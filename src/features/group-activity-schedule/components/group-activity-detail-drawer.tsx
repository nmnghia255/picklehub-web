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
import { useEffect, useMemo, useState } from "react"
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
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

import {
  activityQueryKeys,
  approveActivityGuestsClient,
  cancelAbsenceClient,
  deleteActivityClient,
  deleteActivityGuestsClient,
  getActivityClient,
  getGuestRequestsClient,
  registerActivityGuestsClient,
  reportAbsenceClient,
  updateActivityClient,
} from "../api/activities-client"
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

export function GroupActivityDetailDrawer({
  open,
  onOpenChange,
  activityId,
  groupId,
  currentUserRole,
  currentUserId,
  onEdit,
}: GroupActivityDetailDrawerProps) {
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()
  const [guestCountInput, setGuestCountInput] = useState("1")
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false)

  // Administrative mutations state
  const [isCancelActivityDialogOpen, setIsCancelActivityDialogOpen] =
    useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelConfirmChecked, setCancelConfirmChecked] = useState(false)
  const [isUnlinkBookingDialogOpen, setIsUnlinkBookingDialogOpen] =
    useState(false)

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
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL")

  const isHost = useMemo(() => {
    const role = currentUserRole?.toUpperCase()
    return role === "OWNER" || role === "HOST"
  }, [currentUserRole])

  // Query details of activity
  const { data: activity, isLoading } = useQuery({
    queryKey: activityQueryKeys.detail(groupId, activityId),
    queryFn: () => getActivityClient(groupId, activityId),
    enabled: open && !!activityId && !!groupId,
  })

  // Query group court bookings (enable for host linking, or if there is a linked booking to render)
  const courtBookingsQuery = useQuery({
    queryKey: groupQueryKeys.courtBookings(groupId, { page: 1, limit: 100 }),
    queryFn: () =>
      listGroupCourtBookingsClient(groupId, { page: 1, limit: 100 }),
    enabled:
      open &&
      !!groupId &&
      (isHost || !!activity?.courtBookingId || !!activity?.bookingId),
  })

  // Query all guest requests for Host management
  const guestRequestsQuery = useQuery({
    queryKey: ["group-activities", groupId, activityId, "guests"],
    queryFn: () => getGuestRequestsClient(groupId, activityId),
    enabled: open && isHost && !!groupId && !!activityId,
  })

  // Find current user's attendance status
  const myAttendance = useMemo(() => {
    if (!activity?.attendance || !currentUserId) return null
    return (
      activity.attendance.find(
        (a) =>
          a.memberId === currentUserId || a.member?.userId === currentUserId
      ) || null
    )
  }, [activity, currentUserId])

  const isAbsent = myAttendance?.status === "ABSENT"

  // Check deadline constraints
  const { canToggleAbsence, isPastDeadline } = useMemo(() => {
    if (!activity) return { canToggleAbsence: true, isPastDeadline: false }
    const startTime = new Date(activity.startAt)
    const deadlineHours = activity.cancellationDeadlineHours ?? 24
    const cutoffTime = new Date(
      startTime.getTime() - deadlineHours * 60 * 60 * 1000
    )
    const past = new Date() > cutoffTime
    return {
      canToggleAbsence: !past || isHost,
      isPastDeadline: past,
    }
  }, [activity, isHost])

  // Find linked court booking details if present
  const linkedBooking = useMemo(() => {
    const linkedId = activity?.courtBookingId || activity?.bookingId
    if (!linkedId || !courtBookingsQuery.data?.data) return null
    return (
      courtBookingsQuery.data.data.find(
        (b) => b.id === linkedId || b.bookingId === linkedId
      ) || null
    )
  }, [activity?.courtBookingId, activity?.bookingId, courtBookingsQuery.data])

  // Count participants
  const {
    attendingMembers,
    absentMembers,
    membersCount,
    guestsCount,
    totalParticipants,
  } = useMemo(() => {
    const attendance = activity?.attendance ?? []
    const attending = attendance.filter((a) => a.status !== "ABSENT")
    const absent = attendance.filter((a) => a.status === "ABSENT")

    const mCount = attending.length
    const gCount = attending.reduce(
      (sum, a) => sum + (a.guestStatus === "APPROVED" ? a.guestCount : 0),
      0
    )

    return {
      attendingMembers: attending,
      absentMembers: absent,
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
  }

  // Mutations
  const reportAbsenceMutation = useMutation({
    mutationFn: () => reportAbsenceClient(groupId, activityId),
    onSuccess: () => {
      toast.success("Báo vắng thành công.")
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || "Báo vắng thất bại.")
    },
  })

  const cancelAbsenceMutation = useMutation({
    mutationFn: () => cancelAbsenceClient(groupId, activityId),
    onSuccess: () => {
      toast.success("Hủy báo vắng thành công. Trạng thái đã khôi phục.")
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || "Không thể hủy báo vắng.")
    },
  })

  const registerGuestsMutation = useMutation({
    mutationFn: (count: number) =>
      registerActivityGuestsClient(groupId, activityId, count),
    onSuccess: () => {
      toast.success(
        "Gửi yêu cầu khách chơi vãng lai thành công. Chờ host duyệt."
      )
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || "Không thể gửi yêu cầu khách vãng lai.")
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
          ? "Đã duyệt yêu cầu khách."
          : "Đã từ chối yêu cầu khách."
      )
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || "Thao tác phê duyệt thất bại.")
    },
  })

  const deleteGuestMutation = useMutation({
    mutationFn: (memberId: string) =>
      deleteActivityGuestsClient(groupId, activityId, memberId),
    onSuccess: () => {
      toast.success("Đã hủy và đặt lại số khách mời của thành viên.")
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || "Không thể hủy yêu cầu khách.")
    },
  })

  const linkBookingMutation = useMutation({
    mutationFn: (courtBookingId: string | null) =>
      updateActivityClient(groupId, activityId, { courtBookingId }),
    onSuccess: (updated) => {
      toast.success(
        updated.courtBookingId || updated.bookingId
          ? "Liên kết lịch đặt sân thành công."
          : "Đã gỡ liên kết lịch đặt sân."
      )
      invalidateQueries()
    },
    onError: (err: Error) => {
      toast.error(err.message || "Lỗi cập nhật lịch đặt sân.")
    },
  })

  const deleteActivityMutation = useMutation({
    mutationFn: () => deleteActivityClient(groupId, activityId),
    onSuccess: () => {
      toast.success("Đã hủy hoạt động nhóm thành công.")
      invalidateQueries()
      setIsCancelActivityDialogOpen(false)
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message || "Hủy hoạt động thất bại.")
    },
  })

  const filteredRequests = useMemo(() => {
    const list = guestRequestsQuery.data?.data || []
    if (guestFilterTab === "ALL") return list
    if (guestFilterTab === "PENDING") {
      return list.filter(
        (r) =>
          r.guestStatus === "PENDING" ||
          (r.pendingGuestCount !== null && r.pendingGuestCount !== undefined)
      )
    }
    if (guestFilterTab === "APPROVED") {
      return list.filter((r) => r.guestStatus === "APPROVED")
    }
    if (guestFilterTab === "REJECTED") {
      return list.filter((r) => r.guestStatus === "REJECTED")
    }
    return list
  }, [guestRequestsQuery.data?.data, guestFilterTab])

  const renderAbsenceButton = () => {
    const btnLabel = isAbsent ? "Hủy báo vắng" : "Báo vắng"
    const buttonEl = (
      <Button
        variant="ghost"
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
              <p>Đã qua hạn chót tự động. Vui lòng liên hệ Trưởng nhóm.</p>
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
              {isAbsent ? "Xác nhận hủy báo vắng" : "Xác nhận báo vắng"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {isAbsent
                ? "Bạn có chắc muốn tham gia lại hoạt động này? Trạng thái tham gia sẽ khôi phục."
                : "Bạn có chắc muốn báo vắng cho hoạt động này không? Số khách đi kèm của bạn (nếu có) sẽ bị hủy bỏ."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9 text-sm">Hủy</AlertDialogCancel>
            <AlertDialogAction
              className={
                isAbsent
                  ? "h-9 bg-emerald-600 text-sm text-white hover:bg-emerald-700"
                  : "h-9 bg-destructive text-sm text-white hover:bg-destructive/90"
              }
              onClick={() => {
                if (isAbsent) {
                  cancelAbsenceMutation.mutate()
                } else {
                  reportAbsenceMutation.mutate()
                }
              }}
            >
              Xác nhận
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
        className="flex max-h-[90vh] max-w-md flex-col overflow-hidden p-5 md:max-w-lg md:p-6"
      >
        {/* Top-right Actions Bar (Kebab + Custom Close button in a single row) */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-1">
          {isHost && activity && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Menu quản trị</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    onOpenChange(false)
                    onEdit?.()
                  }}
                  className="cursor-pointer text-sm"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
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
                  Hủy buổi sinh hoạt
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
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <DialogHeader className="px-0 pr-10 pb-3">
              <DialogTitle>
                <Skeleton className="h-8 w-3/4" />
              </DialogTitle>
              <DialogDescription>
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
                Chi tiết hoạt động nhóm.
              </DialogDescription>

              <div className="mt-2 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={getActivityTypeBadgeClass(activity.activityType)}
                >
                  {getActivityTypeLabel(activity.activityType)}
                </Badge>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass(activity.status)}
                >
                  {getStatusLabel(activity.status)}
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  <Users className="size-3" />
                  <span>
                    {totalParticipants} người tham gia ({membersCount} thành
                    viên, {guestsCount} khách)
                  </span>
                </Badge>
              </div>
            </DialogHeader>

            <div className="min-w-0 flex-1 overflow-y-auto pr-1.5">
              <div className="w-full space-y-4 overflow-x-hidden pr-0.5 pb-2">
                {/* 1. Member Information & Absence Button */}
                {currentUserId && (
                  <div className="flex w-full min-w-0 items-center justify-between rounded-lg border border-muted/50 bg-muted/20 px-3 py-2">
                    <div className="mr-2 flex items-center gap-2 truncate text-xs text-muted-foreground">
                      <User className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium text-foreground">
                        Bạn ({myAttendance?.member?.name || "Thành viên"})
                      </span>
                    </div>
                    {renderAbsenceButton()}
                  </div>
                )}

                {/* Unified activity info card with light blue meetup theme */}
                <div className="w-full space-y-2 rounded-lg border border-sky-100 bg-sky-50/50 p-4 shadow-sm dark:border-sky-900/50 dark:bg-sky-950/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-sky-700 dark:text-sky-400">
                    <FileText className="size-4 shrink-0 text-sky-600 dark:text-sky-400" />
                    Thông tin hoạt động
                  </h4>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5 font-semibold text-sky-800 dark:text-sky-300">
                      <CalendarClock className="size-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                      <span>
                        Thời gian: {formatDateTime(activity.startAt)} -{" "}
                        {formatDateTime(activity.endAt)}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 font-semibold text-sky-800 dark:text-sky-300">
                      <MapPin className="size-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                      <span>
                        Địa điểm: {activity.location || "Không rõ địa điểm"}
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
                    <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                      <LinkIcon className="size-4 shrink-0" />
                      Thông tin đặt sân đã liên kết
                    </h4>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p className="text-sm font-semibold text-foreground">
                        {linkedBooking.title || "Lịch đặt sân"}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0" />
                        <span>{linkedBooking.centerName}</span>
                      </p>
                      <p>Ngày chơi: {formatBookingDate(linkedBooking.date)}</p>
                      <p>
                        Khung giờ: {formatBookingTime(linkedBooking.startTime)}{" "}
                        - {formatBookingTime(linkedBooking.endTime)}
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
                            Hủy liên kết
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
                      disabled={
                        registerGuestsMutation.isPending ||
                        (myAttendance?.guestStatus === "APPROVED" &&
                          !myAttendance?.pendingGuestCount)
                      }
                      className="flex h-9 w-full items-center justify-center gap-2 bg-[#6B46C1] text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#553C9A]"
                    >
                      {registerGuestsMutation.isPending && (
                        <Loader2 className="mr-1.5 size-3 animate-spin text-white" />
                      )}
                      {myAttendance &&
                      (myAttendance.guestCount > 0 ||
                        (myAttendance.pendingGuestCount &&
                          myAttendance.pendingGuestCount > 0))
                        ? `Yêu cầu khách vãng lai (Đã đăng ký: ${myAttendance.pendingGuestCount ?? myAttendance.guestCount} khách)`
                        : "+ Đăng ký khách vãng lai đi kèm"}
                    </Button>

                    {myAttendance &&
                      (myAttendance.guestCount > 0 ||
                        (myAttendance.pendingGuestCount &&
                          myAttendance.pendingGuestCount > 0)) && (
                        <div className="mt-2 rounded-md border border-muted/50 bg-muted/20 px-2 py-2 text-center text-xs text-muted-foreground">
                          {myAttendance.pendingGuestCount !== null &&
                          myAttendance.pendingGuestCount !== undefined ? (
                            <span className="font-semibold text-yellow-600">
                              Đang chờ duyệt đổi:{" "}
                              {myAttendance.pendingGuestCount} khách. (Bản chính
                              thức: {myAttendance.guestCount} khách)
                            </span>
                          ) : myAttendance.guestStatus === "APPROVED" ? (
                            <span className="font-semibold text-emerald-600">
                              Đã duyệt {myAttendance.guestCount} khách chơi vãng
                              lai.
                            </span>
                          ) : myAttendance.guestStatus === "PENDING" ? (
                            <span className="font-semibold text-yellow-600">
                              Đang chờ duyệt {myAttendance.guestCount} khách
                              chơi vãng lai.
                            </span>
                          ) : myAttendance.guestStatus === "REJECTED" ? (
                            <span className="font-semibold text-rose-600">
                              Yêu cầu {myAttendance.guestCount} khách chơi vãng
                              lai bị từ chối.
                            </span>
                          ) : null}
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
                        Yêu cầu khách vãng lai
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-xs">
                        Nhập số lượng khách chơi vãng lai đi kèm cho buổi sinh
                        hoạt này.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                        Số lượng khách vãng lai (Tối thiểu 1, Tối đa 10) *
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={guestCountInput}
                        onChange={(e) => setGuestCountInput(e.target.value)}
                        className="h-9 w-full bg-background text-xs"
                        placeholder="Nhập số khách..."
                      />
                    </div>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                      <AlertDialogCancel
                        onClick={() => setIsGuestDialogOpen(false)}
                        className="h-8 text-xs"
                      >
                        Hủy
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          const val = parseInt(guestCountInput || "1")
                          if (isNaN(val) || val < 1) {
                            toast.error("Số lượng khách phải tối thiểu là 1.")
                            return
                          }
                          registerGuestsMutation.mutate(val)
                          setIsGuestDialogOpen(false)
                        }}
                        disabled={
                          registerGuestsMutation.isPending ||
                          isNaN(parseInt(guestCountInput)) ||
                          parseInt(guestCountInput) < 1
                        }
                        className="h-8 bg-[#6B46C1] text-xs text-white hover:bg-[#553C9A]"
                      >
                        Gửi yêu cầu
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Quick Link Booking selector (Host only) - Only visible if NOT already linked */}
                {isHost && !activity.courtBookingId && !activity.bookingId && (
                  <div className="w-full space-y-2 rounded-lg border bg-muted/20 p-4">
                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                      <LinkIcon className="size-4 text-muted-foreground" />
                      Liên kết đặt sân nhanh
                    </h4>
                    <div className="flex items-center gap-2">
                      <Select
                        onValueChange={(val) => linkBookingMutation.mutate(val)}
                        disabled={
                          linkBookingMutation.isPending ||
                          courtBookingsQuery.isLoading
                        }
                      >
                        <SelectTrigger className="w-full bg-background text-xs">
                          <SelectValue placeholder="Chọn lịch đặt sân để liên kết..." />
                        </SelectTrigger>
                        <SelectContent>
                          {courtBookingsQuery.data?.data?.map((b) => (
                            <SelectItem
                              key={b.id}
                              value={b.id}
                              className="text-xs"
                            >
                              {b.centerName} - {formatBookingDate(b.date)} (
                              {formatBookingTime(b.startTime)} -{" "}
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
                              Không có lịch đặt sân nào
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
                        Khách vãng lai
                      </h4>

                      {/* Filter Tabs */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(
                          ["ALL", "PENDING", "APPROVED", "REJECTED"] as const
                        ).map((tab) => {
                          const label =
                            tab === "ALL"
                              ? "Tất cả"
                              : tab === "PENDING"
                                ? "Chờ duyệt"
                                : tab === "APPROVED"
                                  ? "Đã duyệt"
                                  : "Từ chối"
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
                          const memberName =
                            activity?.attendance?.find(
                              (a) => a.memberId === req.memberId
                            )?.member?.name ||
                            `Thành viên (ID: ${req.memberId.slice(0, 8)})`
                          const hasPendingDraft =
                            req.pendingGuestCount !== null &&
                            req.pendingGuestCount !== undefined

                          return (
                            <div
                              key={req.memberId}
                              className="relative flex w-full flex-col gap-2 rounded-lg border bg-card p-3 text-sm shadow-sm"
                            >
                              <div className="flex min-w-0 items-start justify-between gap-2 pr-6">
                                <div className="min-w-0">
                                  <span className="block truncate text-sm font-bold text-foreground">
                                    👤 {memberName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Mời bởi: {memberName}
                                  </span>
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  {hasPendingDraft ? (
                                    <Badge
                                      variant="outline"
                                      className="border-amber-200 bg-amber-50 px-1.5 py-0 text-xs text-amber-700"
                                    >
                                      Xin đổi
                                    </Badge>
                                  ) : req.guestStatus === "PENDING" ? (
                                    <Badge
                                      variant="outline"
                                      className="border-amber-200 bg-amber-50 px-1.5 py-0 text-xs text-amber-700"
                                    >
                                      Chờ duyệt
                                    </Badge>
                                  ) : req.guestStatus === "APPROVED" ? (
                                    <Badge
                                      variant="outline"
                                      className="border-emerald-200 bg-emerald-50 px-1.5 py-0 text-xs text-emerald-700"
                                    >
                                      Đã duyệt
                                    </Badge>
                                  ) : req.guestStatus === "REJECTED" ? (
                                    <Badge
                                      variant="outline"
                                      className="border-rose-200 bg-rose-50 px-1.5 py-0 text-xs text-rose-700"
                                    >
                                      Từ chối
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
                                        Hủy khách mời
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}

                              <div className="flex w-full min-w-0 items-center justify-between gap-2 text-xs text-muted-foreground">
                                <div className="min-w-0 text-left text-xs">
                                  {hasPendingDraft ? (
                                    <p className="truncate">
                                      Số xin đổi:{" "}
                                      <span className="text-sm font-bold text-foreground">
                                        {req.pendingGuestCount}
                                      </span>{" "}
                                      (Bản gốc: {req.guestCount})
                                    </p>
                                  ) : (
                                    <p className="truncate">
                                      Số lượng:{" "}
                                      <span className="text-sm font-bold text-foreground">
                                        {req.guestCount}
                                      </span>{" "}
                                      khách
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
                                        Duyệt
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
                                        Từ chối
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
                                            `Đặt lại yêu cầu của thành viên ${memberName} để cho phép gửi yêu cầu mới?`
                                          )
                                        ) {
                                          deleteGuestMutation.mutate(
                                            req.memberId
                                          )
                                        }
                                      }}
                                      disabled={deleteGuestMutation.isPending}
                                    >
                                      🔄 Mời lại
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
                        Không tìm thấy yêu cầu khách nào cho mục này.
                      </p>
                    )}
                  </div>
                )}

                {/* Host-only Information Panels: Equipment and Attendance */}
                {isHost && (
                  <>
                    {/* Equipment items */}
                    {activity.equipment && activity.equipment.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold">
                          <Package className="size-4" />
                          Vật dụng sử dụng
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

                    {/* Attendance list */}
                    {activity.attendance && activity.attendance.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold">
                          <Users className="size-4" />
                          Danh sách điểm danh
                        </h4>
                        <div className="divide-y rounded-md border bg-card">
                          {activity.attendance.map((att) => {
                            const isSelf =
                              att.memberId === currentUserId ||
                              att.member?.userId === currentUserId
                            const memberName = att.member?.name || "Thành viên"
                            const isMemberAbsent = att.status === "ABSENT"

                            return (
                              <div
                                key={att.id}
                                className="flex items-center justify-between p-3 text-sm"
                              >
                                <div className="flex flex-col">
                                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                                    {memberName}
                                    {isSelf && (
                                      <span className="rounded-md bg-primary/10 px-1.5 py-0.25 text-[10px] font-semibold text-primary">
                                        Bạn
                                      </span>
                                    )}
                                  </span>
                                  <span className="mt-0.5 text-xs text-muted-foreground">
                                    {isMemberAbsent ? (
                                      <span className="font-semibold text-rose-600">
                                        Vắng mặt
                                      </span>
                                    ) : (
                                      <span className="font-semibold text-emerald-600">
                                        Tham gia
                                      </span>
                                    )}
                                    {att.guestCount > 0 && (
                                      <span>
                                        {" "}
                                        · {att.guestCount} khách đi kèm (
                                        {att.guestStatus === "APPROVED" ? (
                                          <span className="text-emerald-600">
                                            Đã duyệt
                                          </span>
                                        ) : att.guestStatus === "REJECTED" ? (
                                          <span className="text-rose-600">
                                            Từ chối
                                          </span>
                                        ) : (
                                          <span className="text-yellow-600">
                                            Chờ duyệt
                                          </span>
                                        )}
                                        )
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Không tìm thấy thông tin hoạt động.
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
                Hủy buổi sinh hoạt nhóm
              </DialogTitle>
              <DialogDescription className="text-xs">
                Bạn đang thực hiện thao tác hủy toàn bộ buổi sinh hoạt này trong
                lịch trình của nhóm.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">
                  Lý do hủy buổi sinh hoạt *
                </label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="min-h-[80px] w-full text-xs"
                  placeholder="Nhập lý do hủy (ví dụ: trời mưa, thiếu người chơi...)"
                />
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/20 p-3">
                <Checkbox
                  id="confirm-cancel"
                  checked={cancelConfirmChecked}
                  onCheckedChange={(checked) =>
                    setCancelConfirmChecked(!!checked)
                  }
                  className="mt-0.5 border-rose-300 data-[state=checked]:bg-destructive data-[state=checked]:text-white"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="confirm-cancel"
                    className="cursor-pointer text-xs font-bold text-rose-800 select-none"
                  >
                    Tôi hiểu hành động này không thể hoàn tác
                  </label>
                  <p className="text-[10px] text-rose-600">
                    Toàn bộ lịch đặt sân (nếu có), trạng thái điểm danh và khách
                    chơi của buổi này sẽ bị xóa khỏi hệ thống.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCancelActivityDialogOpen(false)}
                className="h-8 text-xs"
              >
                Quay lại
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => deleteActivityMutation.mutate()}
                disabled={
                  deleteActivityMutation.isPending ||
                  !cancelConfirmChecked ||
                  !cancelReason.trim()
                }
                className="h-8 bg-destructive text-xs font-bold text-white hover:bg-destructive/90"
              >
                {deleteActivityMutation.isPending && (
                  <Loader2 className="mr-2 size-3 animate-spin" />
                )}
                Xác nhận hủy
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
                Xác nhận hủy khách mời
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                Bạn có chắc chắn muốn hủy yêu cầu khách mời của thành viên này
                không? Hành động này sẽ đặt lại số lượng khách mời của họ về 0.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel
                onClick={() => setIsCancelRequestDialogOpen(false)}
                className="h-8 text-xs"
              >
                Hủy
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
                Xác nhận
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
                Xác nhận gỡ liên kết đặt sân
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Bạn có chắc chắn muốn gỡ liên kết lịch đặt sân này ra khỏi hoạt
                động không? Hành động này sẽ gỡ đặt sân khỏi hoạt động này.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel
                onClick={() => setIsUnlinkBookingDialogOpen(false)}
                className="h-9 text-sm"
              >
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  linkBookingMutation.mutate(null)
                  setIsUnlinkBookingDialogOpen(false)
                }}
                disabled={linkBookingMutation.isPending}
                className="h-9 bg-destructive text-sm text-white hover:bg-destructive/90"
              >
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
