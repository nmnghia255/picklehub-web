"use client"

import dayjs from "dayjs"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  MessageSquare,
  Upload,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { ErrorState } from "@/components/shared/error-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/features/auth/hooks/use-session"
import type { Booking } from "@/features/coach/types/coach"
import {
  useCancelMyBooking,
  useMyBookings,
  useUploadBookingPaymentProof,
} from "@/features/learner/hooks/use-learner-queries"
import { getErrorMessage } from "@/lib/api-client"

function getLocaleCode(language: string) {
  return language.startsWith("vi") ? "vi-VN" : "en-US"
}

const STATUS_BADGE_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING_CONFIRMATION: "secondary",
  CONFIRMED: "default",
  COMPLETED: "default",
  REJECTED: "destructive",
  CANCELLED: "outline",
}

const PAYMENT_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING_PROOF: "outline",
  PENDING_REVIEW: "secondary",
  SETTLED: "default",
  REJECTED: "destructive",
}

function BookingSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

function renderActions(
  booking: Booking,
  t: (key: string) => string,
  onUpload: (id: string) => void,
  onCancel: (id: string) => void
) {
  const { status, paymentStatus, cancelReason } = booking

  if (status === "PENDING_CONFIRMATION") {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onCancel(booking.id)}
      >
        <XCircle className="size-4" />
        {t("learner.bookings.cancelRequest")}
      </Button>
    )
  }

  if (status === "CONFIRMED") {
    if (!paymentStatus || paymentStatus === "PENDING_PROOF") {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpload(booking.id)}
        >
          <Upload className="size-4" />
          {t("learner.bookings.uploadProof")}
        </Button>
      )
    }
    if (paymentStatus === "PENDING_REVIEW") {
      return (
        <Badge variant="secondary">
          <AlertTriangle className="size-3" />
          {t("learner.bookings.paymentPendingReview")}
        </Badge>
      )
    }
    if (paymentStatus === "SETTLED") {
      return (
        <Badge variant="default">
          <CheckCircle2 className="size-3" />
          {t("learner.bookings.paymentSettled")}
        </Badge>
      )
    }
    if (paymentStatus === "REJECTED") {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpload(booking.id)}
        >
          <Upload className="size-4" />
          {t("learner.bookings.uploadProofAgain")}
        </Button>
      )
    }
  }

  if (status === "CANCELLED" || status === "REJECTED") {
    if (cancelReason) {
      return (
        <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MessageSquare className="mt-0.5 size-4 shrink-0" />
          <span>{cancelReason}</span>
        </div>
      )
    }
    return null
  }

  return null
}

export function LearnerBookingsPanel() {
  const { t, i18n } = useTranslation("common")
  const session = useSession()
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const LIMIT = 10
  const locale = getLocaleCode(i18n.language)

  const { data, isLoading, isError, error, refetch } = useMyBookings(
    status === "all" ? { page, limit: LIMIT } : { status, page, limit: LIMIT },
    { enabled: !!session?.user }
  )

  const bookings: Booking[] = data?.data ?? []
  const pagination = data?.meta

  const uploadProofMutation = useUploadBookingPaymentProof()
  const cancelMutation = useCancelMyBooking()

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadingBookingId, setUploadingBookingId] = useState<string | null>(
    null
  )
  const [paymentProofUrl, setPaymentProofUrl] = useState("")

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null
  )

  const tabs = [
    { label: t("learner.bookings.tabAll"), value: "all" },
    {
      label: t("learner.bookings.tabPendingConfirmation"),
      value: "PENDING_CONFIRMATION",
    },
    { label: t("learner.bookings.tabConfirmed"), value: "CONFIRMED" },
    { label: t("learner.bookings.tabCompleted"), value: "COMPLETED" },
    { label: t("learner.bookings.tabRejected"), value: "REJECTED" },
    { label: t("learner.bookings.tabCancelled"), value: "CANCELLED" },
  ]

  const statusLabels: Record<string, string> = {
    PENDING_CONFIRMATION: t("learner.bookings.statusPendingConfirmation"),
    CONFIRMED: t("learner.bookings.statusConfirmed"),
    COMPLETED: t("learner.bookings.statusCompleted"),
    REJECTED: t("learner.bookings.statusRejected"),
    CANCELLED: t("learner.bookings.statusCancelled"),
  }

  const paymentLabels: Record<string, string> = {
    PENDING_PROOF: t("learner.bookings.paymentPendingProof"),
    PENDING_REVIEW: t("learner.bookings.paymentPendingReview"),
    SETTLED: t("learner.bookings.paymentSettled"),
    REJECTED: t("learner.bookings.paymentRejected"),
  }

  if (isError) {
    return (
      <ErrorState
        title={t("learner.bookings.errorTitle")}
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  function openUploadDialog(bookingId: string) {
    setUploadingBookingId(bookingId)
    setPaymentProofUrl("")
    setUploadDialogOpen(true)
  }

  function handleUpload() {
    if (!uploadingBookingId || !paymentProofUrl.trim()) {
      toast.error(t("learner.bookings.uploadProofUrlRequired"))
      return
    }
    uploadProofMutation.mutate(
      {
        bookingId: uploadingBookingId,
        paymentProofUrl: paymentProofUrl.trim(),
      },
      {
        onSuccess: () => {
          toast.success(t("learner.bookings.uploadProofSuccess"))
          setUploadDialogOpen(false)
          setPaymentProofUrl("")
          setUploadingBookingId(null)
        },
        onError: () => {
          toast.error(t("learner.bookings.uploadProofError"))
        },
      }
    )
  }

  function openCancelDialog(bookingId: string) {
    setCancellingBookingId(bookingId)
    setCancelDialogOpen(true)
  }

  function handleCancel() {
    if (!cancellingBookingId) return
    cancelMutation.mutate(cancellingBookingId, {
      onSuccess: () => {
        toast.success(t("learner.bookings.cancelSuccess"))
        setCancelDialogOpen(false)
        setCancellingBookingId(null)
      },
      onError: () => {
        toast.error(t("learner.bookings.cancelError"))
      },
    })
  }

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase()
  }

  function formatCurrency(vnd: number) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "VND",
    }).format(vnd)
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={status}
        onValueChange={(v) => {
          setStatus(v)
          setPage(1)
        }}
      >
        <TabsList variant="line" className="w-full justify-start">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={status} className="mt-6 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <BookingSkeleton key={i} />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Calendar className="size-6" />
                </EmptyMedia>
                <EmptyTitle>{t("learner.bookings.emptyTitle")}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="space-y-4">
                {bookings.map((booking, idx) => (
                  <Card key={booking.id ?? `booking-${idx}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={booking.coachProfile?.avatarUrl}
                            alt={booking.coachProfile?.fullName}
                          />
                          <AvatarFallback>
                            {getInitial(
                              booking.coachProfile?.fullName ??
                                t("learner.bookings.coachFallback")
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base">
                            {booking.coachProfile?.fullName ??
                              t("learner.bookings.coachFallback")}
                          </CardTitle>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant={STATUS_BADGE_VARIANTS[booking.status]}
                          >
                            {statusLabels[booking.status]}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="size-4 shrink-0" />
                          <span>
                            {dayjs(booking.sessionAt).format("DD/MM/YYYY")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="size-4 shrink-0" />
                          <span>
                            {dayjs(booking.sessionAt).format("HH:mm")} &middot;{" "}
                            {booking.durationMinutes}{" "}
                            {t("learner.bookings.minutes")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CreditCard className="size-4 shrink-0" />
                          <span>{formatCurrency(booking.priceVnd)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {booking.paymentStatus && (
                            <Badge
                              variant={
                                PAYMENT_STATUS_VARIANTS[booking.paymentStatus]
                              }
                            >
                              {paymentLabels[booking.paymentStatus]}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {booking.learnerNote && (
                        <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
                          <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <div>
                            <span className="font-medium">
                              {t("learner.bookings.learnerNote")}
                            </span>
                            <span className="text-muted-foreground">
                              {booking.learnerNote}
                            </span>
                          </div>
                        </div>
                      )}

                      {booking.coachNote && (
                        <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
                          <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <div>
                            <span className="font-medium">
                              {t("learner.bookings.coachNote")}
                            </span>
                            <span className="text-muted-foreground">
                              {booking.coachNote}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        {renderActions(
                          booking,
                          t,
                          openUploadDialog,
                          openCancelDialog
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <Pagination className="pt-2">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={
                          page <= 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: pagination.totalPages }).map(
                      (_, i) => {
                        const pageNum = i + 1
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={page === pageNum}
                              onClick={() => setPage(pageNum)}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      }
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setPage((p) => Math.min(pagination.totalPages, p + 1))
                        }
                        className={
                          page >= pagination.totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("learner.bookings.uploadProofDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("learner.bookings.uploadProofDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("learner.bookings.uploadProofUrlLabel")}
            </label>
            <Input
              placeholder={t("learner.bookings.uploadProofUrlPlaceholder")}
              value={paymentProofUrl}
              onChange={(e) => setPaymentProofUrl(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
            >
              {t("learner.bookings.cancel")}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadProofMutation.isPending}
            >
              {uploadProofMutation.isPending
                ? t("learner.bookings.uploading")
                : t("learner.bookings.upload")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("learner.bookings.cancelDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("learner.bookings.cancelDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              {t("learner.bookings.keepBooking")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending
                ? t("learner.bookings.cancelling")
                : t("learner.bookings.confirmCancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
