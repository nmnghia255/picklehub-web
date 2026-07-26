"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  type CourtBookingCourtSelection,
  type CourtBookingDateRange,
  type CourtBookingSelection,
  useCoachCourtBookings,
} from "@/features/coach/hooks/use-coach-court-bookings"

export type CourtLinkedLocationMode = "free-text" | "court"
const EMPTY_COURTS: {
  courtId: string
  courtName: string
  startTime: string
  endTime: string
}[] = []

interface CourtBookingLocationFieldsProps {
  mode: CourtLinkedLocationMode
  onModeChange: (mode: CourtLinkedLocationMode) => void
  courtBookingId: string
  onCourtBookingIdChange: (value: string) => void
  courtId: string
  onCourtIdChange: (value: string) => void
  locationDescription: string
  onLocationDescriptionChange: (value: string) => void
  dateRange?: CourtBookingDateRange
  onBookingSelectionChange?: (booking: CourtBookingSelection | null) => void
  onBookingItemSelectionChange?: (
    item: CourtBookingCourtSelection | null
  ) => void
  onSelectedCourtSlotChange?: (selection: {
    booking: CourtBookingSelection
    court: CourtBookingCourtSelection
  }) => void
  disabled?: boolean
}

function getLocale(language: string) {
  return language.startsWith("vi") ? "vi-VN" : "en-US"
}

function formatBookingDate(date: string, locale: string) {
  if (!date) return ""
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(parsed)
}

function getBookingStatusLabel(
  status: string,
  t: (key: string) => string
): string {
  switch (status) {
    case "PENDING":
      return t("coach.bookings.status.pendingConfirmation")
    case "CONFIRMED":
      return t("coach.bookings.status.confirmed")
    case "COMPLETED":
      return t("coach.bookings.status.completed")
    case "CANCELLED":
      return t("coach.bookings.status.cancelled")
    case "REJECTED":
      return t("coach.bookings.status.rejected")
    default:
      return status
  }
}

export function CourtBookingLocationFields({
  mode,
  onModeChange,
  courtBookingId,
  onCourtBookingIdChange,
  courtId,
  onCourtIdChange,
  locationDescription,
  onLocationDescriptionChange,
  dateRange,
  onBookingSelectionChange,
  onBookingItemSelectionChange,
  onSelectedCourtSlotChange,
  disabled = false,
}: CourtBookingLocationFieldsProps) {
  const { t, i18n } = useTranslation("common")
  const locale = getLocale(i18n.language)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  )
  const [selectedSlotKey, setSelectedSlotKey] = useState("")
  const setFieldRoot = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      setPortalContainer(null)
      return
    }

    setPortalContainer(
      node.closest<HTMLElement>('[data-slot="dialog-content"]') ?? node
    )
  }, [])
  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCoachCourtBookings({ enabled: mode === "court", dateRange })

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === courtBookingId) ?? null,
    [bookings, courtBookingId]
  )

  const selectedCourts = selectedBooking?.bookingItems ?? EMPTY_COURTS
  const courtOptions = useMemo(
    () =>
      selectedCourts.filter(
        (court, index, courts) =>
          courts.findIndex((item) => item.courtId === court.courtId) === index
      ),
    [selectedCourts]
  )
  const selectedCourtSlots = useMemo(
    () => selectedCourts.filter((court) => court.courtId === courtId),
    [courtId, selectedCourts]
  )
  const getSlotKey = (item: CourtBookingCourtSelection) =>
    `${courtBookingId}|${item.courtId}|${item.startTime}|${item.endTime}`
  const selectedCourtSlot =
    selectedCourtSlots.find((item) => getSlotKey(item) === selectedSlotKey) ??
    null

  const getBookingLabel = (booking: CourtBookingSelection) => {
    const courtNames = Array.from(
      new Set(
        booking.bookingItems.map((item) => item.courtName).filter(Boolean)
      )
    )
    const times = booking.bookingItems
      .map((item) => `${item.startTime}-${item.endTime}`)
      .join(", ")
    return [
      booking.centerName || t("coach.courtBookingSelector.unknownCenter"),
      formatBookingDate(booking.date, locale),
      courtNames.join(", "),
      times,
    ]
      .filter(Boolean)
      .join(" · ")
  }

  const handleBookingChange = (value: string) => {
    const nextBooking = bookings.find((booking) => booking.id === value) ?? null
    setSelectedSlotKey("")
    onCourtBookingIdChange(value)
    onCourtIdChange("")
    onBookingSelectionChange?.(nextBooking)
    onBookingItemSelectionChange?.(null)
  }

  const handleCourtChange = (value: string) => {
    setSelectedSlotKey("")
    onCourtIdChange(value)
    onBookingItemSelectionChange?.(null)
  }

  const handleSlotChange = (value: string) => {
    const nextItem =
      selectedCourtSlots.find((item) => getSlotKey(item) === value) ?? null
    setSelectedSlotKey(value)
    onBookingItemSelectionChange?.(nextItem)
  }

  useEffect(() => {
    if (mode === "free-text") {
      if (courtBookingId) onCourtBookingIdChange("")
      if (courtId) onCourtIdChange("")
      return
    }

    if (!selectedBooking) {
      if (courtBookingId) onCourtBookingIdChange("")
      if (courtId) onCourtIdChange("")
      onBookingSelectionChange?.(null)
      onBookingItemSelectionChange?.(null)
      return
    }

    if (courtOptions.length === 1) {
      const nextCourtId = courtOptions[0].courtId
      if (courtId !== nextCourtId) {
        onCourtIdChange(nextCourtId)
      }
      if (selectedCourtSlot) {
        onBookingItemSelectionChange?.(selectedCourtSlot)
      }
      return
    }

    if (courtId && !courtOptions.some((court) => court.courtId === courtId)) {
      onCourtIdChange("")
      onBookingItemSelectionChange?.(null)
    } else if (selectedCourtSlot) {
      onBookingItemSelectionChange?.(selectedCourtSlot)
    }
  }, [
    courtBookingId,
    courtId,
    mode,
    onCourtBookingIdChange,
    onCourtIdChange,
    selectedBooking,
    selectedCourts,
    onBookingSelectionChange,
    onBookingItemSelectionChange,
    courtOptions,
    selectedCourtSlot,
    selectedSlotKey,
  ])

  useEffect(() => {
    if (mode !== "court" || !selectedBooking || !selectedCourtSlot) return
    onSelectedCourtSlotChange?.({
      booking: selectedBooking,
      court: selectedCourtSlot,
    })
  }, [mode, onSelectedCourtSlotChange, selectedBooking, selectedCourtSlot])

  const handleModeChange = (nextMode: CourtLinkedLocationMode) => {
    if (nextMode === "free-text") {
      onCourtBookingIdChange("")
      onCourtIdChange("")
      onBookingSelectionChange?.(null)
      onBookingItemSelectionChange?.(null)
      onModeChange(nextMode)
      return
    }

    onLocationDescriptionChange("")
    onModeChange(nextMode)
  }

  const hasCourts = selectedCourts.length > 0
  return (
    <div ref={setFieldRoot} className="relative space-y-4">
      <div className="space-y-2">
        <Label>{t("coach.courtBookingSelector.modeLabel")}</Label>
        <Select
          value={mode}
          onValueChange={(value) =>
            handleModeChange(value as CourtLinkedLocationMode)
          }
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free-text">
              {t("coach.courtBookingSelector.modeFreeText")}
            </SelectItem>
            <SelectItem value="court">
              {t("coach.courtBookingSelector.modeCourt")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === "court" ? (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            {t("coach.courtBookingSelector.modeHint")}
          </p>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ) : isError ? (
            <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    {t("coach.courtBookingSelector.loadError")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {error instanceof Error ? error.message : ""}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="size-4" />
                {t("coach.courtBookingSelector.retry")}
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="space-y-3 rounded-md border bg-background/70 p-4">
              <p className="text-sm font-medium">
                {t("coach.courtBookingSelector.emptyTitle")}
              </p>
              <p className="text-sm text-muted-foreground">
                {dateRange?.startDate || dateRange?.endDate
                  ? t("coach.courtBookingSelector.emptyInClassRange")
                  : t("coach.courtBookingSelector.emptyDescription")}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>{t("coach.courtBookingSelector.bookingLabel")}</Label>
                <Combobox
                  value={courtBookingId}
                  modal={false}
                  itemToStringLabel={(bookingId) =>
                    bookings.find((booking) => booking.id === bookingId)
                      ? getBookingLabel(
                          bookings.find((booking) => booking.id === bookingId)!
                        )
                      : ""
                  }
                  onValueChange={(value) => handleBookingChange(value ?? "")}
                >
                  <ComboboxInput
                    placeholder={t(
                      "coach.courtBookingSelector.bookingPlaceholder"
                    )}
                    disabled={disabled}
                    showClear={!!courtBookingId}
                  />
                  <ComboboxContent container={portalContainer}>
                    <ComboboxList>
                      {bookings.map((booking) => {
                        const courtNames = Array.from(
                          new Set(
                            booking.bookingItems
                              .map((court) => court.courtName)
                              .filter(Boolean)
                          )
                        )
                        const bookingTime = booking.bookingItems
                          .map(
                            (court) => `${court.startTime} - ${court.endTime}`
                          )
                          .join(", ")

                        return (
                          <ComboboxItem key={booking.id} value={booking.id}>
                            <div className="flex w-full flex-col gap-1 pr-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">
                                  {booking.centerName ||
                                    t(
                                      "coach.courtBookingSelector.unknownCenter"
                                    )}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {getBookingStatusLabel(booking.status, t)}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {courtNames.length > 0
                                  ? courtNames.join(", ")
                                  : t(
                                      "coach.courtBookingSelector.unknownCourt"
                                    )}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatBookingDate(booking.date, locale)}
                                {bookingTime ? ` - ${bookingTime}` : ""}
                              </span>
                              {booking.centerAddress && (
                                <span className="text-xs text-muted-foreground">
                                  {booking.centerAddress}
                                </span>
                              )}
                            </div>
                          </ComboboxItem>
                        )
                      })}
                      <ComboboxEmpty className="p-4 text-center text-sm text-muted-foreground">
                        {t("coach.courtBookingSelector.searchEmpty")}
                      </ComboboxEmpty>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              {selectedBooking && (
                <div className="space-y-3 rounded-md border bg-background/80 p-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {selectedBooking.centerName ||
                          t("coach.courtBookingSelector.unknownCenter")}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {getBookingStatusLabel(selectedBooking.status, t)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatBookingDate(selectedBooking.date, locale)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedBooking.bookingItems
                        .map(
                          (court) =>
                            `${court.courtName} ${court.startTime} - ${court.endTime}`
                        )
                        .join(" | ")}
                    </p>
                    {selectedBooking.centerAddress && (
                      <p className="text-sm text-muted-foreground">
                        {selectedBooking.centerAddress}
                      </p>
                    )}
                  </div>

                  {courtOptions.length > 1 ? (
                    <div className="space-y-2">
                      <Label>
                        {t("coach.courtBookingSelector.courtLabel")}
                      </Label>
                      <Select
                        value={courtId}
                        onValueChange={handleCourtChange}
                        disabled={disabled || !hasCourts}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t(
                              "coach.courtBookingSelector.courtPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {courtOptions.map((court) => (
                            <SelectItem
                              key={court.courtId}
                              value={court.courtId}
                            >
                              {court.courtName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {t("coach.courtBookingSelector.courtSelectHint")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 rounded-md bg-muted/70 p-3">
                      <p className="text-sm font-medium">
                        {t("coach.courtBookingSelector.courtLabel")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCourts[0]?.courtName ||
                          t("coach.courtBookingSelector.unknownCourt")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("coach.courtBookingSelector.courtAutoSelected")}
                      </p>
                    </div>
                  )}

                  {selectedCourtSlots.length > 1 && (
                    <div className="space-y-2">
                      <Label>{t("coach.courtBookingSelector.slotLabel")}</Label>
                      <Select
                        value={
                          selectedCourtSlot ? getSlotKey(selectedCourtSlot) : ""
                        }
                        onValueChange={handleSlotChange}
                        disabled={disabled || !courtId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t(
                              "coach.courtBookingSelector.slotPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCourtSlots.map((slot) => (
                            <SelectItem
                              key={getSlotKey(slot)}
                              value={getSlotKey(slot)}
                            >
                              {slot.startTime} - {slot.endTime}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="locationDescription">
            {t("coach.courtBookingSelector.manualLocationLabel")}
          </Label>
          <Input
            id="locationDescription"
            value={locationDescription}
            onChange={(e) => onLocationDescriptionChange(e.target.value)}
            placeholder={t(
              "coach.courtBookingSelector.manualLocationPlaceholder"
            )}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            {t("coach.courtBookingSelector.manualLocationHint")}
          </p>
        </div>
      )}
    </div>
  )
}
