import { useQuery } from "@tanstack/react-query"
import { CalendarDays } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getBookingTimeString } from "@/features/socials/utils"
import { getMyBookingsAction } from "@/features/sport-center/actions/get-my-bookings"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type { SocialFormData } from "../../types/social"

interface SocialFormBookingCardProps {
  formData: SocialFormData
  setFormData: (
    updater: SocialFormData | ((prev: SocialFormData) => SocialFormData)
  ) => void
}

export function SocialFormBookingCard({
  formData,
  setFormData,
}: SocialFormBookingCardProps) {
  const { t, i18n } = useSocialsTranslation()
  const [selectedCenterId, setSelectedCenterId] = useState<string>("")

  const { data: bookingsResponse, isLoading } = useQuery({
    queryKey: ["my-bookings-for-social"],
    queryFn: () =>
      getMyBookingsAction({
        limit: 200,
      }),
  })

  const bookings = bookingsResponse?.data || []

  const availableBookings = useMemo(() => {
    return bookings.filter((b) => b.status === "CONFIRMED" && b.centerId)
  }, [bookings])

  const centers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; address: string }>()
    availableBookings.forEach((booking) => {
      if (!booking.centerId || map.has(booking.centerId)) return
      map.set(booking.centerId, {
        id: booking.centerId,
        name:
          booking.center?.name ||
          t("sessionForm.defaultCourt", "Sân Pickleball"),
        address: booking.center?.address || "",
      })
    })
    return Array.from(map.values())
  }, [availableBookings, t])

  const filteredBookings = useMemo(() => {
    if (!selectedCenterId) return []
    return availableBookings.filter(
      (booking) => booking.centerId === selectedCenterId
    )
  }, [availableBookings, selectedCenterId])

  const bookingOptions = useMemo(() => {
    return filteredBookings.map((b) => {
      const timeString = getBookingTimeString(b)
      return {
        value: b.id,
        label: `${new Date(b.date).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US")}`,
        description: t("sessionForm.timeLabel", {
          time: timeString || t("common.na"),
        }),
      }
    })
  }, [filteredBookings, getBookingTimeString, i18n.language, t])

  const derivedCenterId = useMemo(() => {
    if (!formData.bookingIds?.length || !availableBookings.length)
      return undefined
    const selectedBooking = availableBookings.find((booking) =>
      formData.bookingIds.includes(booking.id)
    )
    return selectedBooking?.centerId
  }, [availableBookings, formData.bookingIds])

  const effectiveSelectedCenterId = selectedCenterId || derivedCenterId

  const handleCenterChange = (centerId: string) => {
    setSelectedCenterId(centerId)
    setFormData((prev) => ({
      ...prev,
      bookingIds: prev.bookingIds.filter((bookingId) => {
        const booking = availableBookings.find((item) => item.id === bookingId)
        return !booking || booking.centerId === centerId
      }),
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-5 text-primary" />
          {t("sessionForm.bookingLabel", "Chọn sân")}
        </CardTitle>
        <CardDescription>
          {t(
            "sessionForm.bookingDesc",
            "Chọn trung tâm trước, sau đó chọn các sân bạn đã đặt ở trung tâm đó."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("sessionForm.centerLabel", "Trung tâm")}</Label>
            <Select
              value={effectiveSelectedCenterId}
              onValueChange={handleCenterChange}
            >
              <SelectTrigger className="h-12 min-h-15 w-full px-3">
                <SelectValue
                  placeholder={t(
                    "sessionForm.centerPlaceholder",
                    "Chọn trung tâm"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {centers.map((center) => (
                  <SelectItem
                    key={center.id}
                    value={center.id}
                    className="h-14 p-2"
                  >
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-base font-semibold text-foreground">
                        {center.name}
                      </span>
                      {center.address ? (
                        <span className="text-sm text-muted-foreground">
                          {center.address}
                        </span>
                      ) : null}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCenterId ? (
              <div className="space-y-2">
                <Label>{t("sessionForm.addressLabel", "Địa chỉ")}</Label>
                <Input
                  value={
                    centers.find((center) => center.id === selectedCenterId)
                      ?.address || ""
                  }
                  readOnly
                  className="h-8"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>{t("sessionForm.bookingLabel", "Sân")}</Label>
            <MultiSelect
              options={bookingOptions}
              selected={formData.bookingIds || []}
              onSelectionChange={(selectedIds) => {
                setFormData((prev) => ({
                  ...prev,
                  bookingIds: selectedIds,
                }))
              }}
              placeholder={
                selectedCenterId
                  ? t("sessionForm.bookingPlaceholder", "Chọn sân")
                  : t(
                      "sessionForm.centerFirstPlaceholder",
                      "Vui lòng chọn trung tâm trước"
                    )
              }
              emptyMessage={
                isLoading
                  ? t("common.loading", "Đang tải...")
                  : !selectedCenterId
                    ? t(
                        "sessionForm.centerFirstPlaceholder",
                        "Vui lòng chọn trung tâm trước"
                      )
                    : t(
                        "sessionForm.noBookingsAvailable",
                        "Không có sân nào phù hợp"
                      )
              }
              disabled={!selectedCenterId}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
