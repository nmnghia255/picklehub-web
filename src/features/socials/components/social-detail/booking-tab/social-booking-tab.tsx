"use client"

import {
  Building2,
  CalendarDays,
  Clock,
  Coins,
  Loader2,
  MapPin,
  PlusCircle,
  ShieldAlert,
  Trash2,
  Trophy,
} from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateSocialBookingsAction } from "@/features/socials/actions/social"
import type { DetailedBookingItem } from "@/features/socials/actions/social-booking-actions"
import { getSocialBookingsDetailsAction } from "@/features/socials/actions/social-booking-actions"
import type { SocialDetail } from "@/features/socials/types/social"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import BookingDetailDialog from "./booking-detail-dialog"
import SelectBookingDialog from "./select-booking-dialog"

function safeFormatTime(dateStr?: string): string {
  if (!dateStr || dateStr.trim() === "") return "07:00"
  const trimmed = dateStr.trim()
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.slice(0, 5)
  }
  const d = new Date(trimmed)
  if (isNaN(d.getTime())) return "07:00"
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface SocialBookingTabProps {
  social: SocialDetail
  isEditable: boolean
}

export default function SocialBookingTab({
  social,
  isEditable,
}: SocialBookingTabProps) {
  const { t } = useSocialsTranslation()
  const [selectDialogOpen, setSelectDialogOpen] = useState(false)
  const [selectedBookingForDetail, setSelectedBookingForDetail] =
    useState<DetailedBookingItem | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  const [fetchedBookings, setFetchedBookings] = useState<DetailedBookingItem[]>(
    []
  )
  const bookingIds = useMemo(() => social.bookingIds ?? [], [social.bookingIds])
  const bookingIdsKey = bookingIds.join(",")
  const [isLoadingBookings, setIsLoadingBookings] = useState(
    () => bookingIds.length > 0
  )

  const isCompletedOrCancelled =
    social.status === "COMPLETED" ||
    social.status === "CANCELLED" ||
    social.status === "CANCELED"
  const canManageBookings = isEditable && !isCompletedOrCancelled

  useEffect(() => {
    if (bookingIds.length === 0) return

    let isMounted = true
    getSocialBookingsDetailsAction(bookingIds)
      .then((data) => {
        if (isMounted) setFetchedBookings(data)
      })
      .finally(() => {
        if (isMounted) setIsLoadingBookings(false)
      })
    return () => {
      isMounted = false
    }
  }, [bookingIdsKey, bookingIds])

  // Derive unique courts list and actual court count strictly from real fetched booking items
  const uniqueCourts = useMemo(() => {
    const map = new Map<string, string>()
    fetchedBookings.forEach((b) => {
      if (b.items && b.items.length > 0) {
        b.items.forEach((item) => {
          const key = item.courtId || item.courtName
          if (key && !map.has(key)) {
            map.set(key, item.courtName)
          }
        })
      } else if (b.courtName) {
        map.set(b.courtName, b.courtName)
      }
    })
    return Array.from(map.values())
  }, [fetchedBookings])

  const actualCourtCount =
    uniqueCourts.length > 0
      ? uniqueCourts.length
      : fetchedBookings.length > 0
        ? fetchedBookings.length
        : bookingIds.length || 0

  const courtNamesText =
    uniqueCourts.length > 0 ? ` (${uniqueCourts.join(", ")})` : ""
  const courtCountDisplay = t("booking.courtsCountDisplay", {
    count: actualCourtCount,
    names: courtNamesText,
  })

  const centerNameDisplay =
    fetchedBookings[0]?.centerName || social.centerName || t("common.na")
  const locationDisplay =
    fetchedBookings[0]?.location || social.location || t("common.na")

  const totalCostDisplay = useMemo(() => {
    if (fetchedBookings.length > 0) {
      const sum = fetchedBookings.reduce((acc, b) => acc + (b.price || 0), 0)
      if (sum > 0) return sum
    }
    return social.totalBookingCost || 0
  }, [fetchedBookings, social.totalBookingCost])

  // Remove a single booking while preserving Min 1 Booking constraint
  const handleRemoveBooking = async (
    e: React.MouseEvent,
    bookingIdToRemove: string
  ) => {
    e.stopPropagation()
    if (bookingIds.length <= 1) {
      toast.error(t("booking.minBookingError"))
      return
    }

    const updatedBookingIds = bookingIds.filter(
      (id) => id !== bookingIdToRemove
    )
    setIsDeletingId(bookingIdToRemove)

    try {
      await updateSocialBookingsAction(social.id, updatedBookingIds)
      toast.success(t("booking.removeSuccess"))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("booking.updateError")
      toast.error(msg)
    } finally {
      setIsDeletingId(null)
    }
  }

  const handleOpenDetail = (booking: DetailedBookingItem) => {
    setSelectedBookingForDetail(booking)
    setDetailDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* ── Card 1: Tổng Quan Sân Thi Đấu (Dạng Text Liệt Kê Rõ Ràng) ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Building2 className="size-5 text-primary" />
            {t("booking.summaryTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3.5 rounded-xl border bg-card p-4 text-sm shadow-xs">
            <div className="flex flex-col gap-1 border-b pb-2.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {t("booking.centerName")}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {centerNameDisplay}
              </span>
            </div>

            <div className="flex flex-col gap-1 border-b pb-2.5 sm:flex-row sm:items-start sm:justify-between">
              <span className="shrink-0 text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:w-32">
                {t("booking.location")}
              </span>
              <span className="text-sm leading-relaxed font-medium text-foreground sm:text-right">
                {locationDisplay}
              </span>
            </div>

            <div className="flex flex-col gap-1 border-b pb-2.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {t("booking.numberOfCourts")}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {isLoadingBookings ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Đang tính toán sân...
                  </span>
                ) : (
                  courtCountDisplay
                )}
              </span>
            </div>

            <div className="flex flex-col gap-1 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {t("booking.totalCost")}
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {totalCostDisplay.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 2: Danh Sách Booking Liên Kết ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CalendarDays className="size-5 text-primary" />
            {t("booking.linkedBookingsTitle")}
            <Badge variant="secondary" className="ml-1 rounded-full text-xs">
              {bookingIds.length}
            </Badge>
          </CardTitle>

          {canManageBookings && (
            <Button
              size="sm"
              onClick={() => setSelectDialogOpen(true)}
              className="gap-1.5 bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
            >
              <PlusCircle className="size-4" />
              {t("booking.manageBookings")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingBookings ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="mb-2 size-6 animate-spin text-primary" />
              <p>Đang tải chi tiết đơn đặt sân...</p>
            </div>
          ) : fetchedBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              <ShieldAlert className="mb-2 size-6 text-amber-500" />
              <p>{t("booking.noLinkedBookings")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fetchedBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleOpenDetail(b)}
                  className="group flex cursor-pointer flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs transition-all hover:border-primary/50 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Trophy className="size-4 shrink-0 text-primary" />
                      <p className="truncate text-sm leading-tight font-semibold transition-colors group-hover:text-primary">
                        {b.courtName} — {b.centerName}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3 shrink-0 text-primary/70" />
                        <span className="max-w-sm truncate">{b.location}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 shrink-0 text-primary/70" />
                        <span>
                          {safeFormatTime(b.startTime)} –{" "}
                          {safeFormatTime(b.endTime)}
                        </span>
                      </span>
                    </div>

                    {/* Show court items list badges directly on card */}
                    {b.items && b.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {b.items.map((item, idx) => (
                          <Badge
                            key={item.id || idx}
                            variant="outline"
                            className="bg-muted/40 text-[11px] font-medium"
                          >
                            {item.courtName} ({safeFormatTime(item.startTime)} –{" "}
                            {safeFormatTime(item.endTime)})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    {b.price !== undefined && b.price > 0 && (
                      <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <Coins className="mr-1 size-3.5" />
                        {b.price.toLocaleString("vi-VN")} đ
                      </span>
                    )}

                    {canManageBookings && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={
                          bookingIds.length <= 1 || isDeletingId === b.id
                        }
                        onClick={(e) => handleRemoveBooking(e, b.id)}
                        className="h-8 text-muted-foreground hover:text-destructive"
                        title={
                          bookingIds.length <= 1
                            ? t("booking.minBookingError")
                            : t("common.delete")
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Select Booking Dialog */}
      <SelectBookingDialog
        open={selectDialogOpen}
        onOpenChange={setSelectDialogOpen}
        socialId={social.id}
        centerId={social.centerId ?? undefined}
        currentBookingIds={bookingIds}
      />

      {/* Booking Detail Dialog */}
      <BookingDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        booking={selectedBookingForDetail}
      />
    </div>
  )
}
