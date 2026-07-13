"use client"

import dayjs from "dayjs"
import {
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  User,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { ErrorState } from "@/components/shared/error-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "@/features/auth/hooks/use-session"
import { CourtBookingLocationFields } from "@/features/coach/components/court-booking-location-fields"
import {
  useCancelBookingCoach,
  useCompleteBooking,
  useConfirmBooking,
  useIncomingBookings,
  useRejectBooking,
  useRejectBookingPayment,
  useSettleBookingPayment,
  useUpdateBookingLocation,
} from "@/features/coach/hooks/use-coach-queries"
import type { Booking, PaginationMeta } from "@/features/coach/types/coach"
import { getErrorMessage } from "@/lib/api-client"

const STATUS_TABS: { value: string }[] = [
  { value: "" },
  { value: "PENDING_CONFIRMATION" },
  { value: "CONFIRMED" },
  { value: "COMPLETED" },
  { value: "REJECTED" },
  { value: "CANCELLED" },
]

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING_CONFIRMATION: "secondary",
  CONFIRMED: "default",
  COMPLETED: "default",
  REJECTED: "destructive",
  CANCELLED: "outline",
}

function formatCurrency(vnd: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(vnd)
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
  const { t } = useTranslation("common")
  const [tab, setTab] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError, error, refetch } = useIncomingBookings(
    { status: tab || undefined, page, limit },
    { enabled: !!session?.user }
  )

  const bookings: Booking[] = data?.data ?? []
  const meta: PaginationMeta | undefined = data?.meta

  const confirmBooking = useConfirmBooking()
  const rejectBooking = useRejectBooking()
  const settlePayment = useSettleBookingPayment()
  const completeBooking = useCompleteBooking()
  const rejectPayment = useRejectBookingPayment()
  const cancelBookingCoach = useCancelBookingCoach()
  const updateBookingLocation = useUpdateBookingLocation()
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    booking: Booking | null
    note: string
  }>({ open: false, booking: null, note: "" })
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    booking: Booking | null
    reason: string
  }>({ open: false, booking: null, reason: "" })
  const [settleDialog, setSettleDialog] = useState<{
    open: boolean
    booking: Booking | null
  }>({ open: false, booking: null })
  const [completeDialog, setCompleteDialog] = useState<{
    open: boolean
    booking: Booking | null
  }>({ open: false, booking: null })
  const [proofDialog, setProofDialog] = useState<{
    open: boolean
    booking: Booking | null
  }>({ open: false, booking: null })
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean
    booking: Booking | null
    reason: string
  }>({ open: false, booking: null, reason: "" })
  const [locationDialog, setLocationDialog] = useState<{
    open: boolean
    booking: Booking | null
    mode: "free-text" | "court"
    courtBookingId: string
    courtId: string
    locationDescription: string
  }>({
    open: false,
    booking: null,
    mode: "free-text",
    courtBookingId: "",
    courtId: "",
    locationDescription: "",
  })

  if (isError) {
    return (
      <ErrorState
        title={t("coach.bookings.errorTitle")}
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
          toast.success(t("coach.bookings.confirmSuccess"))
          setConfirmDialog({ open: false, booking: null, note: "" })
        },
        onError: () => toast.error(t("coach.bookings.confirmError")),
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
          toast.success(t("coach.bookings.rejectSuccess"))
          setRejectDialog({ open: false, booking: null, reason: "" })
        },
        onError: () => toast.error(t("coach.bookings.rejectError")),
      }
    )
  }

  function handleSettle() {
    const b = settleDialog.booking
    if (!b) return
    settlePayment.mutate(b.id, {
      onSuccess: () => {
        toast.success(t("coach.bookings.settleSuccess"))
        setSettleDialog({ open: false, booking: null })
      },
      onError: () => toast.error(t("coach.bookings.settleError")),
    })
  }

  function handleComplete() {
    const b = completeDialog.booking
    if (!b) return
    completeBooking.mutate(b.id, {
      onSuccess: () => {
        toast.success(t("coach.bookings.completeSuccess"))
        setCompleteDialog({ open: false, booking: null })
      },
      onError: () => toast.error(t("coach.bookings.completeError")),
    })
  }

  function handleRejectPayment(bookingId: string) {
    rejectPayment.mutate(bookingId, {
      onSuccess: () => toast.success(t("coach.bookings.rejectPaymentSuccess")),
      onError: () => toast.error(t("coach.bookings.rejectPaymentError")),
    })
  }

  function handleCancelBooking() {
    const b = cancelDialog.booking
    if (!b) return
    cancelBookingCoach.mutate(
      { bookingId: b.id, cancelReason: cancelDialog.reason || undefined },
      {
        onSuccess: () => {
          toast.success(t("coach.bookings.cancelSuccess"))
          setCancelDialog({ open: false, booking: null, reason: "" })
        },
        onError: () => toast.error(t("coach.bookings.cancelError")),
      }
    )
  }

  function openEditLocationDialog(booking: Booking) {
    setLocationDialog({
      open: true,
      booking,
      mode: booking.courtBookingId ? "court" : "free-text",
      courtBookingId: booking.courtBookingId ?? "",
      courtId: booking.courtId ?? "",
      locationDescription: booking.locationDescription ?? "",
    })
  }

  function handleUpdateBookingLocation() {
    const booking = locationDialog.booking
    if (!booking) return

    if (locationDialog.mode === "court") {
      if (!locationDialog.courtBookingId) {
        toast.error(t("coach.courtBookingSelector.bookingRequired"))
        return
      }
      if (!locationDialog.courtId) {
        toast.error(t("coach.courtBookingSelector.courtRequired"))
        return
      }
    } else if (!locationDialog.locationDescription.trim()) {
      toast.error(t("coach.courtBookingSelector.manualLocationRequired"))
      return
    }

    updateBookingLocation.mutate(
      {
        bookingId: booking.id,
        dto:
          locationDialog.mode === "court"
            ? {
                courtBookingId: locationDialog.courtBookingId || undefined,
                courtId: locationDialog.courtId || undefined,
              }
            : {
                locationDescription:
                  locationDialog.locationDescription || undefined,
              },
      },
      {
        onSuccess: () => {
          toast.success(t("coach.bookings.updateLocationSuccess"))
          setLocationDialog({
            open: false,
            booking: null,
            mode: "free-text",
            courtBookingId: "",
            courtId: "",
            locationDescription: "",
          })
        },
        onError: (err: Error) =>
          toast.error(err.message || t("coach.bookings.updateLocationError")),
      }
    )
  }

  function renderActions(booking: Booking) {
    if (booking.status === "PENDING_CONFIRMATION") {
      return (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => setConfirmDialog({ open: true, booking, note: "" })}
            disabled={
              confirmBooking.isPending &&
              confirmDialog.booking?.id === booking.id
            }
          >
            <CheckCircle2 /> {t("coach.bookings.confirmButton")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setRejectDialog({ open: true, booking, reason: "" })}
            disabled={
              rejectBooking.isPending && rejectDialog.booking?.id === booking.id
            }
          >
            <XCircle /> {t("coach.bookings.rejectButton")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditLocationDialog(booking)}
          >
            <MapPin /> {t("coach.bookings.editLocationButton")}
          </Button>
        </div>
      )
    }

    if (booking.status === "CONFIRMED") {
      if (booking.paymentStatus === "REJECTED") {
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ban className="size-4 text-destructive" />
            {t("coach.bookings.proofRejected")}
          </div>
        )
      }

      if (booking.paymentStatus === "SETTLED") {
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => setCompleteDialog({ open: true, booking })}
              disabled={
                completeBooking.isPending &&
                completeDialog.booking?.id === booking.id
              }
            >
              <CheckCircle2 /> {t("coach.bookings.completeButton")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                setCancelDialog({ open: true, booking, reason: "" })
              }
              disabled={cancelBookingCoach.isPending}
            >
              <Ban /> {t("coach.bookings.cancelButton")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditLocationDialog(booking)}
            >
              <MapPin /> {t("coach.bookings.editLocationButton")}
            </Button>
          </div>
        )
      }

      if (
        booking.paymentStatus === "PENDING_PROOF" ||
        booking.paymentStatus === "PENDING_REVIEW"
      ) {
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setProofDialog({ open: true, booking })}
            >
              <ImageIcon /> {t("coach.bookings.viewProofButton")}
            </Button>
            <Button
              size="sm"
              onClick={() => setSettleDialog({ open: true, booking })}
              disabled={
                settlePayment.isPending &&
                settleDialog.booking?.id === booking.id
              }
            >
              <DollarSign /> {t("coach.bookings.settleButton")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRejectPayment(booking.id)}
              disabled={rejectPayment.isPending}
            >
              <XCircle /> {t("coach.bookings.rejectPaymentButton")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setCancelDialog({ open: true, booking, reason: "" })
              }
              disabled={cancelBookingCoach.isPending}
            >
              <Ban /> {t("coach.bookings.cancelButton")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditLocationDialog(booking)}
            >
              <MapPin /> {t("coach.bookings.editLocationButton")}
            </Button>
          </div>
        )
      }

      if (
        booking.paymentStatus === null ||
        booking.paymentStatus === undefined
      ) {
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                setCancelDialog({ open: true, booking, reason: "" })
              }
              disabled={cancelBookingCoach.isPending}
            >
              <Ban /> {t("coach.bookings.cancelButton")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditLocationDialog(booking)}
            >
              <MapPin /> {t("coach.bookings.editLocationButton")}
            </Button>
          </div>
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
          {booking.cancelReason
            ? t("coach.bookings.cancelReason", { reason: booking.cancelReason })
            : t("coach.bookings.noReason")}
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
            <span className="text-muted-foreground">
              {t("coach.bookings.totalLabel")}
            </span>
          </div>
        </div>
      )}

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v)
          setPage(1)
        }}
      >
        <TabsList>
          {STATUS_TABS.map((tabItem) => (
            <TabsTrigger key={tabItem.value} value={tabItem.value}>
              {tabItem.value === "PENDING_CONFIRMATION"
                ? t("coach.bookings.status.pendingConfirmation")
                : tabItem.value === "CONFIRMED"
                  ? t("coach.bookings.status.confirmed")
                  : tabItem.value === "COMPLETED"
                    ? t("coach.bookings.status.completed")
                    : tabItem.value === "REJECTED"
                      ? t("coach.bookings.status.rejected")
                      : tabItem.value === "CANCELLED"
                        ? t("coach.bookings.status.cancelled")
                        : t("coach.bookings.status.all")}
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
            <p className="text-muted-foreground">
              {t("coach.bookings.noBookings")}
            </p>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">
                      {booking.learnerProfile?.name ??
                        booking.learnerProfile?.fullName ??
                        t("coach.bookings.studentLabel")}
                    </span>
                    <Badge
                      variant={STATUS_VARIANT[booking.status] ?? "default"}
                    >
                      {booking.status === "PENDING_CONFIRMATION"
                        ? t("coach.bookings.status.pendingConfirmation")
                        : booking.status === "CONFIRMED"
                          ? t("coach.bookings.status.confirmed")
                          : booking.status === "COMPLETED"
                            ? t("coach.bookings.status.completed")
                            : booking.status === "REJECTED"
                              ? t("coach.bookings.status.rejected")
                              : t("coach.bookings.status.cancelled")}
                    </Badge>
                    {booking.paymentStatus && (
                      <Badge variant="outline">
                        {booking.paymentStatus === "PENDING_PROOF"
                          ? t("coach.bookings.paymentStatus.pendingProof")
                          : booking.paymentStatus === "PENDING_REVIEW"
                            ? t("coach.bookings.paymentStatus.pendingReview")
                            : booking.paymentStatus === "SETTLED"
                              ? t("coach.bookings.paymentStatus.settled")
                              : booking.paymentStatus === "REJECTED"
                                ? t("coach.bookings.paymentStatus.rejected")
                                : booking.paymentStatus}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {dayjs(booking.sessionAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {t("coach.bookings.minutes", {
                        count: booking.durationMinutes,
                      })}
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
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.max(1, p - 1))
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(p)
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.min(meta.totalPages, p + 1))
                }}
                className={
                  page >= meta.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog
        open={locationDialog.open}
        onOpenChange={(open) =>
          setLocationDialog((prev) => ({
            ...prev,
            open,
            ...(open
              ? {}
              : {
                  booking: null,
                  mode: "free-text",
                  courtBookingId: "",
                  courtId: "",
                  locationDescription: "",
                }),
          }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("coach.bookings.editLocationDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("coach.bookings.editLocationDialogDescription")}
            </DialogDescription>
          </DialogHeader>

          <CourtBookingLocationFields
            mode={locationDialog.mode}
            onModeChange={(mode) =>
              setLocationDialog((prev) => ({
                ...prev,
                mode,
                ...(mode === "court"
                  ? { locationDescription: "" }
                  : { courtBookingId: "", courtId: "" }),
              }))
            }
            courtBookingId={locationDialog.courtBookingId}
            onCourtBookingIdChange={(courtBookingId) =>
              setLocationDialog((prev) => ({
                ...prev,
                courtBookingId,
              }))
            }
            courtId={locationDialog.courtId}
            onCourtIdChange={(courtId) =>
              setLocationDialog((prev) => ({
                ...prev,
                courtId,
              }))
            }
            locationDescription={locationDialog.locationDescription}
            onLocationDescriptionChange={(locationDescription) =>
              setLocationDialog((prev) => ({
                ...prev,
                locationDescription,
              }))
            }
            disabled={updateBookingLocation.isPending}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setLocationDialog({
                  open: false,
                  booking: null,
                  mode: "free-text",
                  courtBookingId: "",
                  courtId: "",
                  locationDescription: "",
                })
              }
            >
              {t("coach.bookings.closeButton")}
            </Button>
            <Button
              onClick={handleUpdateBookingLocation}
              disabled={
                updateBookingLocation.isPending ||
                (locationDialog.mode === "court"
                  ? !locationDialog.courtBookingId || !locationDialog.courtId
                  : !locationDialog.locationDescription.trim())
              }
            >
              {updateBookingLocation.isPending
                ? t("coach.bookings.updatingLocation")
                : t("coach.bookings.saveLocation")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("coach.bookings.confirmDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("coach.bookings.confirmDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("coach.bookings.noteLabel")}
            </label>
            <Textarea
              placeholder={t("coach.bookings.notePlaceholder")}
              value={confirmDialog.note}
              onChange={(e) =>
                setConfirmDialog((prev) => ({ ...prev, note: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ open: false, booking: null, note: "" })
              }
            >
              {t("coach.bookings.cancelButton")}
            </Button>
            <Button onClick={handleConfirm} disabled={confirmBooking.isPending}>
              {confirmBooking.isPending
                ? t("coach.bookings.processing")
                : t("coach.bookings.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("coach.bookings.rejectDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("coach.bookings.rejectDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("coach.bookings.reasonLabel")}
            </label>
            <Textarea
              placeholder={t("coach.bookings.reasonPlaceholder")}
              value={rejectDialog.reason}
              onChange={(e) =>
                setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRejectDialog({ open: false, booking: null, reason: "" })
              }
            >
              {t("coach.bookings.cancelButton")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectBooking.isPending}
            >
              {rejectBooking.isPending
                ? t("coach.bookings.processing")
                : t("coach.bookings.rejectButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={settleDialog.open}
        onOpenChange={(open) => setSettleDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("coach.bookings.settleDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("coach.bookings.settleDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSettleDialog({ open: false, booking: null })}
            >
              {t("coach.bookings.cancelButton")}
            </Button>
            <Button onClick={handleSettle} disabled={settlePayment.isPending}>
              {settlePayment.isPending
                ? t("coach.bookings.processing")
                : t("coach.bookings.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={completeDialog.open}
        onOpenChange={(open) =>
          setCompleteDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("coach.bookings.completeDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("coach.bookings.completeDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompleteDialog({ open: false, booking: null })}
            >
              {t("coach.bookings.cancelButton")}
            </Button>
            <Button
              onClick={handleComplete}
              disabled={completeBooking.isPending}
            >
              {completeBooking.isPending
                ? t("coach.bookings.processing")
                : t("coach.bookings.completeButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("coach.bookings.cancelDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("coach.bookings.cancelDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("coach.bookings.reasonLabel")}
            </label>
            <Textarea
              placeholder={t("coach.bookings.reasonPlaceholder")}
              value={cancelDialog.reason}
              onChange={(e) =>
                setCancelDialog((prev) => ({ ...prev, reason: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setCancelDialog({ open: false, booking: null, reason: "" })
              }
            >
              {t("coach.bookings.keepButton")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={cancelBookingCoach.isPending}
            >
              {cancelBookingCoach.isPending
                ? t("coach.bookings.processing")
                : t("coach.bookings.confirmCancelButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={proofDialog.open}
        onOpenChange={(open) => setProofDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("coach.bookings.proofDialogTitle")}</DialogTitle>
          </DialogHeader>
          {proofDialog.booking?.paymentProofUrl ? (
            <div className="flex justify-center">
              <img
                src={proofDialog.booking.paymentProofUrl}
                alt={t("coach.bookings.proofAlt")}
                className="max-h-96 rounded-md object-contain"
              />
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              {t("coach.bookings.noProof")}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProofDialog({ open: false, booking: null })}
            >
              {t("coach.bookings.closeButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
