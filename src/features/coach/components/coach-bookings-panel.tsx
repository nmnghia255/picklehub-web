"use client"

import dayjs from "dayjs"
import { Ban,Calendar, CheckCircle2, Clock, DollarSign, Image as ImageIcon, MessageSquare, User, XCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { ErrorState } from "@/components/shared/error-state"
import { Avatar, AvatarFallback,AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter,DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "@/features/auth/hooks/use-session"
import {
  useCancelBookingCoach,
  useCompleteBooking,
  useConfirmBooking,
  useIncomingBookings,
  useRejectBooking,
  useRejectBookingPayment,
  useSettleBookingPayment,
} from "@/features/coach/hooks/use-coach-queries"
import type { Booking, PaginationMeta } from "@/features/coach/types/coach"
import { getErrorMessage } from "@/lib/api-client"

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "Tất cả", value: "" },
  { label: "Chờ xác nhận", value: "PENDING_CONFIRMATION" },
  { label: "Đã xác nhận", value: "CONFIRMED" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Từ chối", value: "REJECTED" },
  { label: "Đã hủy", value: "CANCELLED" },
]

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING_CONFIRMATION: "secondary",
  CONFIRMED: "default",
  COMPLETED: "default",
  REJECTED: "destructive",
  CANCELLED: "outline",
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING_PROOF: "Chưa tải bằng chứng",
  PENDING_REVIEW: "Đang xem xét",
  SETTLED: "Đã thanh toán",
  REJECTED: "Bị từ chối",
}

function formatCurrency(vnd: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(vnd)
}

function BookingSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 py-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-60" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-24" />
      </CardContent>
    </Card>
  )
}

export function CoachBookingsPanel() {
  const session = useSession()
  const [tab, setTab] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError, error, refetch } = useIncomingBookings({ status: tab || undefined, page, limit }, { enabled: !!session?.user })

  const bookings: Booking[] = data?.data ?? []
  const meta: PaginationMeta | undefined = data?.meta

  const confirmBooking = useConfirmBooking()
  const rejectBooking = useRejectBooking()
  const settlePayment = useSettleBookingPayment()
  const completeBooking = useCompleteBooking()
  const rejectPayment = useRejectBookingPayment()
  const cancelBookingCoach = useCancelBookingCoach()
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; booking: Booking | null; note: string }>({ open: false, booking: null, note: "" })
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; booking: Booking | null; reason: string }>({ open: false, booking: null, reason: "" })
  const [settleDialog, setSettleDialog] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null })
  const [completeDialog, setCompleteDialog] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null })
  const [proofDialog, setProofDialog] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null })
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; booking: Booking | null; reason: string }>({ open: false, booking: null, reason: "" })

  if (isError) {
    return (
      <ErrorState
        title="Không thể tải danh sách đặt lịch"
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  function handleConfirm() {
    const b = confirmDialog.booking
    if (!b) return
    confirmBooking.mutate(
      { bookingId: b.id, coachNote: confirmDialog.note || undefined },
      {
        onSuccess: () => {
          toast.success("Đã xác nhận lịch học")
          setConfirmDialog({ open: false, booking: null, note: "" })
        },
        onError: () => toast.error("Xác nhận thất bại"),
      }
    )
  }

  function handleReject() {
    const b = rejectDialog.booking
    if (!b) return
    rejectBooking.mutate(
      { bookingId: b.id, cancelReason: rejectDialog.reason || undefined },
      {
        onSuccess: () => {
          toast.success("Đã từ chối lịch học")
          setRejectDialog({ open: false, booking: null, reason: "" })
        },
        onError: () => toast.error("Từ chối thất bại"),
      }
    )
  }

  function handleSettle() {
    const b = settleDialog.booking
    if (!b) return
    settlePayment.mutate(b.id, {
      onSuccess: () => {
        toast.success("Đã xác nhận thanh toán")
        setSettleDialog({ open: false, booking: null })
      },
      onError: () => toast.error("Xác nhận thanh toán thất bại"),
    })
  }

  function handleComplete() {
    const b = completeDialog.booking
    if (!b) return
    completeBooking.mutate(b.id, {
      onSuccess: () => {
        toast.success("Đã hoàn thành buổi học")
        setCompleteDialog({ open: false, booking: null })
      },
      onError: () => toast.error("Hoàn thành thất bại"),
    })
  }

  function handleRejectPayment(bookingId: string) {
    rejectPayment.mutate(bookingId, {
      onSuccess: () => toast.success("Đã từ chối thanh toán"),
      onError: () => toast.error("Từ chối thanh toán thất bại"),
    })
  }

  function handleCancelBooking() {
    const b = cancelDialog.booking
    if (!b) return
    cancelBookingCoach.mutate(
      { bookingId: b.id, cancelReason: cancelDialog.reason || undefined },
      {
        onSuccess: () => {
          toast.success("Đã hủy lịch học")
          setCancelDialog({ open: false, booking: null, reason: "" })
        },
        onError: () => toast.error("Hủy lịch thất bại"),
      }
    )
  }

  function renderActions(booking: Booking) {
    if (booking.status === "PENDING_CONFIRMATION") {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setConfirmDialog({ open: true, booking, note: "" })}
            disabled={confirmBooking.isPending && confirmDialog.booking?.id === booking.id}
          >
            <CheckCircle2 /> Xác nhận
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setRejectDialog({ open: true, booking, reason: "" })}
            disabled={rejectBooking.isPending && rejectDialog.booking?.id === booking.id}
          >
            <XCircle /> Từ chối
          </Button>
        </div>
      )
    }

    if (booking.status === "CONFIRMED") {
      if (booking.paymentStatus === "REJECTED") {
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ban className="size-4 text-destructive" />
            Bằng chứng bị từ chối
          </div>
        )
      }

      if (booking.paymentStatus === "SETTLED") {
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => setCompleteDialog({ open: true, booking })}
              disabled={completeBooking.isPending && completeDialog.booking?.id === booking.id}
            >
              <CheckCircle2 /> Hoàn thành buổi học
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setCancelDialog({ open: true, booking, reason: "" })}
              disabled={cancelBookingCoach.isPending}
            >
              <Ban /> Hủy lịch
            </Button>
          </div>
        )
      }

      if (booking.paymentStatus === "PENDING_PROOF" || booking.paymentStatus === "PENDING_REVIEW") {
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setProofDialog({ open: true, booking })}
            >
              <ImageIcon /> Xem bằng chứng
            </Button>
            <Button
              size="sm"
              onClick={() => setSettleDialog({ open: true, booking })}
              disabled={settlePayment.isPending && settleDialog.booking?.id === booking.id}
            >
              <DollarSign /> Xác nhận thanh toán
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRejectPayment(booking.id)}
              disabled={rejectPayment.isPending}
            >
              <XCircle /> Từ chối thanh toán
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCancelDialog({ open: true, booking, reason: "" })}
              disabled={cancelBookingCoach.isPending}
            >
              <Ban /> Hủy lịch
            </Button>
          </div>
        )
      }

      if (booking.paymentStatus === null || booking.paymentStatus === undefined) {
        return (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setCancelDialog({ open: true, booking, reason: "" })}
            disabled={cancelBookingCoach.isPending}
          >
            <Ban /> Hủy lịch
          </Button>
        )
      }

      return null
    }

    if (booking.status === "COMPLETED") {
      return null
    }

    if (booking.status === "REJECTED" || booking.status === "CANCELLED") {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="size-4" />
          {booking.cancelReason ? `Lý do: ${booking.cancelReason}` : "Không có lý do"}
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">

      {meta && (
        <div className="flex gap-4">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="font-medium">{meta.total}</span>
            <span className="text-muted-foreground">tổng số</span>
          </div>
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1) }}>
        <TabsList>
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <BookingSkeleton key={i} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-3 size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Chưa có yêu cầu đặt lịch nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking, index) => (
            <Card key={booking.id ?? index}>
              <CardContent className="flex items-start gap-4 py-4">
                <Avatar>
                  <AvatarImage src={booking.learnerProfile?.avatarUrl} />
                  <AvatarFallback>
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{booking.learnerProfile?.name ?? booking.learnerProfile?.fullName ?? "Học viên"}</span>
                    <Badge variant={STATUS_VARIANT[booking.status] ?? "default"}>
                      {booking.status === "PENDING_CONFIRMATION"
                        ? "Chờ xác nhận"
                        : booking.status === "CONFIRMED"
                          ? "Đã xác nhận"
                          : booking.status === "COMPLETED"
                            ? "Hoàn thành"
                            : booking.status === "REJECTED"
                              ? "Từ chối"
                              : "Đã hủy"}
                    </Badge>
                    {booking.paymentStatus && (
                      <Badge variant="outline">
                        {PAYMENT_STATUS_LABEL[booking.paymentStatus] ?? booking.paymentStatus}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {dayjs(booking.sessionAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {booking.durationMinutes} phút
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="size-3.5" />
                      {formatCurrency(booking.priceVnd)}
                    </span>
                  </div>

                  {booking.learnerNote && (
                    <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                      <MessageSquare className="mt-0.5 size-3.5 shrink-0" />
                      <span>{booking.learnerNote}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0">{renderActions(booking)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => { e.preventDefault(); setPage(p) }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(meta.totalPages, p + 1)) }}
                className={page >= meta.totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận lịch học</DialogTitle>
            <DialogDescription>Xác nhận lịch học với học viên. Bạn có thể thêm ghi chú nếu cần.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ghi chú (không bắt buộc)</label>
            <Textarea
              placeholder="Nhập ghi chú..."
              value={confirmDialog.note}
              onChange={(e) => setConfirmDialog((prev) => ({ ...prev, note: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, booking: null, note: "" })}>
              Hủy
            </Button>
            <Button onClick={handleConfirm} disabled={confirmBooking.isPending}>
              {confirmBooking.isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối lịch học</DialogTitle>
            <DialogDescription>Nhập lý do từ chối lịch học này.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do (không bắt buộc)</label>
            <Textarea
              placeholder="Nhập lý do từ chối..."
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, booking: null, reason: "" })}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectBooking.isPending}>
              {rejectBooking.isPending ? "Đang xử lý..." : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={settleDialog.open} onOpenChange={(open) => setSettleDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thanh toán</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xác nhận thanh toán cho lịch học này?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettleDialog({ open: false, booking: null })}>
              Hủy
            </Button>
            <Button onClick={handleSettle} disabled={settlePayment.isPending}>
              {settlePayment.isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={completeDialog.open} onOpenChange={(open) => setCompleteDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hoàn thành buổi học</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn đánh dấu buổi học này đã hoàn thành?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialog({ open: false, booking: null })}>
              Hủy
            </Button>
            <Button onClick={handleComplete} disabled={completeBooking.isPending}>
              {completeBooking.isPending ? "Đang xử lý..." : "Hoàn thành"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy lịch học</DialogTitle>
            <DialogDescription>Bạn có chắc muốn hủy lịch học này? Hành động này sẽ thông báo đến học viên.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do (không bắt buộc)</label>
            <Textarea
              placeholder="Nhập lý do hủy lịch..."
              value={cancelDialog.reason}
              onChange={(e) => setCancelDialog((prev) => ({ ...prev, reason: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, booking: null, reason: "" })}>
              Giữ lịch
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={cancelBookingCoach.isPending}>
              {cancelBookingCoach.isPending ? "Đang xử lý..." : "Xác nhận hủy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={proofDialog.open} onOpenChange={(open) => setProofDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Bằng chứng thanh toán</DialogTitle>
          </DialogHeader>
          {proofDialog.booking?.paymentProofUrl ? (
            <div className="flex justify-center">
              <img
                src={proofDialog.booking.paymentProofUrl}
                alt="Bằng chứng thanh toán"
                className="max-h-96 rounded-md object-contain"
              />
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Chưa có bằng chứng thanh toán</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProofDialog({ open: false, booking: null })}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
