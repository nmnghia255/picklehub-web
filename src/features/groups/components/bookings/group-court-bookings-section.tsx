"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Loader2,
  Plus,
  Trash2,
  User,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { ErrorSection } from "@/components/error-section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import {
  getGroupClient,
  getMyBookingsClient,
  groupQueryKeys,
  linkGroupCourtBookingClient,
  listGroupCourtBookingsClient,
  unlinkGroupCourtBookingClient,
  useGroupInvalidation,
} from "../../api/groups-client"
import { useActionGuard } from "../../hooks/use-action-guard"
import type { GroupCourtBooking } from "../../types"

interface GroupCourtBookingsSectionProps {
  groupId: string
  currentUserId: string
  currentUserRole: string | null
  groupStatus?: string | null
}

function formatDate(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatDateTime(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function GroupCourtBookingsSection({
  groupId,
  currentUserRole,
  groupStatus,
}: GroupCourtBookingsSectionProps) {
  const { t } = useGroupsTranslation()
  const { invalidateCourtBookings } = useGroupInvalidation(groupId)

  const { data: group } = useQuery({
    queryKey: groupQueryKeys.detail(groupId),
    queryFn: () => getGroupClient(groupId),
    enabled: !!groupId,
  })

  const { guardWriteAction, PermissionDialog } = useActionGuard(
    group,
    currentUserRole
  )

  const normalizedRole = currentUserRole?.toUpperCase() ?? ""
  const isOwner = normalizedRole === "OWNER"
  const isArchived = groupStatus?.toUpperCase() === "ARCHIVED"

  const [page, setPage] = useState(1)
  const limit = 5

  // List group court bookings
  const courtBookingsQuery = useQuery({
    queryKey: groupQueryKeys.courtBookings(groupId, { page, limit }),
    queryFn: () => listGroupCourtBookingsClient(groupId, { page, limit }),
  })

  // State for popups
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] =
    useState<GroupCourtBooking | null>(null)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] =
    useState<GroupCourtBooking | null>(null)

  // Form states for linking booking
  const [formTitle, setFormTitle] = useState("")
  const [formNote, setFormNote] = useState("")
  const [formBookingId, setFormBookingId] = useState("")

  // Load user's own bookings for linking dropdown
  const myBookingsQuery = useQuery({
    queryKey: ["my-bookings-for-linking"],
    queryFn: () => getMyBookingsClient({ limit: 100 }),
    enabled: linkDialogOpen && isOwner,
  })

  // Filter confirmed or completed bookings
  const eligibleBookings =
    myBookingsQuery.data?.data?.filter(
      (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
    ) ?? []

  // Link booking mutation
  const linkBookingMutation = useMutation({
    mutationFn: (body: { title: string; note: string; bookingId: string }) =>
      linkGroupCourtBookingClient(groupId, body),
    onSuccess: () => {
      toast.success(
        t("errors.linkBookingSuccess", "Liên kết lịch đặt sân thành công!")
      )
      setLinkDialogOpen(false)
      setFormTitle("")
      setFormNote("")
      setFormBookingId("")
      invalidateCourtBookings()
    },
    onError: (error: Error) => {
      toast.error(error.message || t("errors.linkBookingFailed"))
    },
  })

  // Unlink booking mutation
  const unlinkBookingMutation = useMutation({
    mutationFn: (id: string) => unlinkGroupCourtBookingClient(groupId, id),
    onSuccess: () => {
      toast.success(
        t("errors.unlinkBookingSuccess", "Đã xóa liên kết lịch đặt sân.")
      )
      setDeleteConfirmOpen(false)
      setBookingToDelete(null)
      invalidateCourtBookings()
    },
    onError: (error: Error) => {
      toast.error(error.message || t("errors.unlinkBookingFailed"))
    },
  })

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formBookingId) {
      toast.error(
        t("errors.linkBookingEmpty", "Vui lòng chọn lịch đặt sân để liên kết.")
      )
      return
    }

    // Chỉ gửi title, note, bookingId theo API
    linkBookingMutation.mutate({
      title: formTitle,
      note: formNote,
      bookingId: formBookingId,
    })
  }

  const handleDeleteConfirm = () => {
    if (bookingToDelete) {
      unlinkBookingMutation.mutate(bookingToDelete.id)
    }
  }

  const handleOpenDetail = (booking: GroupCourtBooking) => {
    setSelectedBooking(booking)
    setDetailDialogOpen(true)
  }

  const handleOpenDelete = (
    e: React.MouseEvent,
    booking: GroupCourtBooking
  ) => {
    e.stopPropagation()
    setBookingToDelete(booking)
    setDeleteConfirmOpen(true)
  }

  const renderContent = () => {
    if (courtBookingsQuery.isPending) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted/20" />
              <CardContent className="h-24 bg-muted/10" />
            </Card>
          ))}
        </div>
      )
    }

    if (courtBookingsQuery.isError) {
      return (
        <ErrorSection
          title={t(
            "errors.loadBookingsFailed",
            "Lỗi tải danh sách lịch đặt sân"
          )}
          message={
            courtBookingsQuery.error instanceof Error
              ? courtBookingsQuery.error.message
              : t("errors.defaultError", "Đã xảy ra lỗi.")
          }
        />
      )
    }

    const bookings = courtBookingsQuery.data?.data ?? []

    if (bookings.length === 0) {
      return (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Calendar className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>
              {t(
                "activitySchedule.quickLinkBookingEmpty",
                "Chưa có lịch đặt sân nào"
              )}
            </EmptyTitle>
            <EmptyDescription>
              {t(
                "errors.groupNoBookingsLinked",
                "Nhóm chưa liên kết bất kỳ lịch đặt sân nào."
              )}
            </EmptyDescription>
            {isOwner && !isArchived && (
              <Button
                onClick={() =>
                  guardWriteAction(() => setLinkDialogOpen(true), {
                    featureName: "liên kết đặt sân",
                  })
                }
                size="sm"
                className="mt-4 border border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Plus className="mr-2 size-4" />
                {t("errors.linkBookingBtn", "Liên kết lịch đặt sân")}
              </Button>
            )}
          </EmptyHeader>
        </Empty>
      )
    }

    return (
      <div className="space-y-4">
        {bookings.map((item) => {
          const centerName =
            item.centerName || t("errors.sportCenterUnknown", "Sân chưa rõ")
          const bookingDate = item.date ? formatDate(item.date) : "-"
          const totalPrice = item.totalBookingCost
            ? formatCurrencyVnd(item.totalBookingCost)
            : "-"

          // Get court names list
          const courtNames = item.bookingItemsSnapshot
            ? Array.from(
                new Set(item.bookingItemsSnapshot.map((bi) => bi.courtName))
              ).join(", ")
            : t("errors.sportCenterUnknown", "Sân chưa rõ")

          // Get overall time range
          const timeRange = (() => {
            const snapshots = item.bookingItemsSnapshot || []
            if (snapshots.length === 0) return "-"
            const startTimes = snapshots.map((s) => s.startTime).filter(Boolean)
            const endTimes = snapshots.map((s) => s.endTime).filter(Boolean)
            if (startTimes.length === 0 || endTimes.length === 0) return "-"

            const minStart = startTimes.reduce(
              (min, cur) => (cur < min ? cur : min),
              startTimes[0]
            )
            const maxEnd = endTimes.reduce(
              (max, cur) => (cur > max ? cur : max),
              endTimes[0]
            )
            return `${minStart} - ${maxEnd}`
          })()

          return (
            <Card
              key={item.id}
              className="flex cursor-pointer flex-col gap-6 rounded-xl border bg-muted py-6 text-card-foreground shadow-sm transition-all hover:shadow-md"
              onClick={() => handleOpenDetail(item)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="font-semibold text-foreground">
                        {centerName}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span>
                        {t("activitySchedule.thTime")}: {bookingDate}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span>
                        {t("activitySchedule.thTimeRange", "Khung giờ")}:{" "}
                        {timeRange}
                      </span>
                    </CardDescription>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isOwner && !isArchived && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleOpenDelete(e, item)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <span className="font-medium text-foreground">
                      {t("activitySchedule.thEquipment", "Sân đặt")}:{" "}
                    </span>
                    {courtNames}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      {t("activitySchedule.thCost", "Tổng chi phí")}:{" "}
                    </span>
                    <span className="font-semibold text-primary tabular-nums">
                      {totalPrice}
                    </span>
                  </div>
                </div>

                {item.note && (
                  <div className="rounded-md bg-muted/30 p-2.5 text-xs">
                    <span className="font-semibold text-foreground">
                      {t("activitySchedule.formDescription", "Ghi chú")}:{" "}
                    </span>
                    {item.note}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    {item.creator?.name && (
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {t("errors.linkedBy", "Người liên kết: {{name}}", {
                          name: item.creator.name,
                        })}
                      </span>
                    )}
                    {item.linkedActivity && (
                      <span className="flex items-center gap-1 font-semibold text-muted-foreground/80 dark:text-emerald-400">
                        {t(
                          "activitySchedule.linkedActivityLabel",
                          "Hoạt động: {{title}}",
                          {
                            title: item.linkedActivity.title,
                          }
                        )}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-muted-foreground/80">
                    <Clock className="size-3" />
                    {t("errors.linkedAt", "Thời gian liên kết nhóm: {{time}}", {
                      time: formatDateTime(item.createdAt),
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Pagination */}
        {courtBookingsQuery.data?.meta &&
          courtBookingsQuery.data.meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                <ArrowLeft className="mr-2 size-4" />
                {t("activitySchedule.filterPrev", "Trước")}
              </Button>
              <span className="text-sm font-medium">
                {t("activitySchedule.pageInfo", "Trang {{page}} / {{total}}", {
                  page,
                  total: courtBookingsQuery.data.meta.totalPages,
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((prev) =>
                    Math.min(prev + 1, courtBookingsQuery.data.meta.totalPages)
                  )
                }
                disabled={page === courtBookingsQuery.data.meta.totalPages}
              >
                {t("activitySchedule.filterNext", "Sau")}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("courtBookings")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t(
              "errors.bookingsListDesc",
              "Danh sách các lịch đặt sân đã được liên kết với nhóm để thành viên cùng theo dõi."
            )}
          </p>
        </div>
        {isOwner && !isArchived && (
          <Button
            onClick={() =>
              guardWriteAction(() => setLinkDialogOpen(true), {
                featureName: "liên kết đặt sân",
              })
            }
            size="sm"
            className="border border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Plus className="mr-2 size-4" />
            {t("errors.linkBookingBtn", "Liên kết lịch đặt sân")}
          </Button>
        )}
      </div>

      {renderContent()}

      {/* Link Booking Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleLinkSubmit}>
            <DialogHeader>
              <DialogTitle>
                {t("errors.linkBookingDialogTitle", "Liên kết lịch đặt sân")}
              </DialogTitle>
              <DialogDescription>
                {t(
                  "errors.linkBookingDialogDesc",
                  "Chọn một lịch đặt sân của bạn để liên kết vào nhóm này. Chỉ các lịch đặt sân có trạng thái đã xác nhận hoặc đã hoàn thành mới khả dụng."
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("activitySchedule.formActivityName")}
                </label>
                <input
                  type="text"
                  placeholder={t(
                    "activitySchedule.formActivityNamePlaceholder",
                    "Ví dụ: Giao lưu sáng thứ 7"
                  )}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("activitySchedule.formDescription")}
                </label>
                <textarea
                  placeholder={t(
                    "activitySchedule.formDescriptionPlaceholder",
                    "Nhập ghi chú cho nhóm nếu có..."
                  )}
                  className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("activitySchedule.formLinkBooking")}{" "}
                  <span className="text-destructive">*</span>
                </label>
                {myBookingsQuery.isPending ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    {t("activitySchedule.formLoadingBookings")}
                  </div>
                ) : myBookingsQuery.isError ? (
                  <div className="py-2 text-sm text-destructive">
                    {t("errors.loadBookingsFailed")}
                  </div>
                ) : eligibleBookings.length === 0 ? (
                  <div className="py-2 text-sm text-muted-foreground">
                    {t(
                      "errors.noConfirmedBookings",
                      "Bạn không có lịch đặt sân nào có trạng thái CONFIRMED hoặc COMPLETED."
                    )}
                  </div>
                ) : (
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={formBookingId}
                    onChange={(e) => setFormBookingId(e.target.value)}
                    required
                  >
                    <option value="">
                      {t("activitySchedule.quickLinkBookingPlaceholder")}
                    </option>
                    {eligibleBookings.map((b) => {
                      const cName =
                        b.center?.name ||
                        t("errors.sportCenterUnknown", "Sân chưa rõ")
                      const dateStr = b.date
                        ? new Date(b.date).toLocaleDateString("vi-VN")
                        : t("activitySchedule.noSchedule")
                      return (
                        <option key={b.id} value={b.id}>
                          {cName} - {dateStr}
                        </option>
                      )
                    })}
                  </select>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLinkDialogOpen(false)}
                disabled={linkBookingMutation.isPending}
              >
                {t("activitySchedule.btnCancel")}
              </Button>
              <Button
                type="submit"
                disabled={linkBookingMutation.isPending || !formBookingId}
                variant="orangeCard"
              >
                {linkBookingMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {t("errors.btnLink", "Liên kết")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              {t("activitySchedule.confirmUnlinkBookingTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("activitySchedule.confirmUnlinkBookingDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={unlinkBookingMutation.isPending}
            >
              {t("activitySchedule.btnCancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={unlinkBookingMutation.isPending}
            >
              {unlinkBookingMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {t("activitySchedule.confirmUnlinkBookingBtnConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
          {selectedBooking && (
            <div>
              <DialogHeader>
                <div className="mr-6 flex items-center justify-between gap-4">
                  <DialogTitle className="text-xl font-bold">
                    {selectedBooking.title}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:border-emerald-800/30 dark:bg-emerald-950/20 dark:text-emerald-400"
                  >
                    {t("errors.linkedBadge", "Đã liên kết")}
                  </Badge>
                </div>
                <DialogDescription>
                  {t(
                    "errors.bookingDetailDesc",
                    "Chi tiết thông tin lịch đặt sân đã liên kết."
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4 text-sm">
                {/* Linked info */}
                <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
                  <div>
                    <span className="block text-xs text-muted-foreground uppercase">
                      {t("errors.linkedTime", "Thời gian liên kết nhóm")}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatDateTime(selectedBooking.createdAt)}
                    </span>
                  </div>
                  {selectedBooking.note && (
                    <div className="mt-1 border-t pt-2 sm:col-span-2">
                      <span className="block text-xs text-muted-foreground uppercase">
                        {t("errors.linkedNote", "Ghi chú liên kết")}
                      </span>
                      <p className="mt-1 whitespace-pre-wrap text-foreground">
                        {selectedBooking.note}
                      </p>
                    </div>
                  )}
                </div>

                {/* Booking details */}
                <div className="space-y-3">
                  <h4 className="border-b pb-1.5 font-bold text-foreground">
                    {t("activitySchedule.linkedBookingTitle")}
                  </h4>

                  <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground">
                        {t("errors.sportCenterLabel", "Cụm sân:")}
                      </span>{" "}
                      <span className="font-medium text-foreground">
                        {selectedBooking.centerName ||
                          t("errors.sportCenterUnknown", "Sân chưa rõ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t("activitySchedule.thTime")}:
                      </span>{" "}
                      <span className="font-medium text-foreground">
                        {selectedBooking.date
                          ? formatDate(selectedBooking.date)
                          : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t("activitySchedule.thCost")}:
                      </span>{" "}
                      <span className="font-bold text-primary tabular-nums">
                        {selectedBooking.totalBookingCost
                          ? formatCurrencyVnd(selectedBooking.totalBookingCost)
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking items list */}
                <div className="space-y-3">
                  <h4 className="border-b pb-1.5 font-bold text-foreground">
                    {t(
                      "errors.courtsAndTimeList",
                      "Danh sách sân và khung giờ"
                    )}
                  </h4>
                  <div className="divide-y rounded-md border">
                    {selectedBooking.bookingItemsSnapshot?.map((bi, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3"
                      >
                        <div>
                          <span className="font-semibold text-foreground">
                            {bi.courtName || `Sân #${index + 1}`}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {t("activitySchedule.bookingTimeLabel", {
                              start: bi.startTime,
                              end: bi.endTime,
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                    {!selectedBooking.bookingItemsSnapshot?.length && (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        {t(
                          "errors.noBookingItemsInfo",
                          "Không có thông tin chi tiết từng sân."
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t pt-4">
                <Button
                  type="button"
                  onClick={() => setDetailDialogOpen(false)}
                >
                  {t("activitySchedule.btnClose")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <PermissionDialog />
    </div>
  )
}
