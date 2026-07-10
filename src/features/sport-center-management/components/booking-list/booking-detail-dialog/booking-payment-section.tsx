"use client"

import {
  CalendarDays,
  Coins,
  CreditCard,
  DollarSign,
  Image,
} from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
import { formatBookingCreatedAt, formatCurrency } from "../booking-list.utils"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
}

export function BookingPaymentSection({ booking }: Props) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="text-md flex items-center gap-2 font-semibold">
        <CreditCard className="size-5 text-orange-500" />
        {t("bookingList.detail.paymentTitle")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label={t("bookingList.detail.totalPrice")}
          value={formatCurrency(booking.totalPrice)}
          icon={DollarSign}
          toneClassName="text-orange-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.remainingBalance")}
          value={formatCurrency(booking.paymentRemaining)}
          icon={Coins}
          toneClassName="text-orange-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.appliedCredit")}
          value={formatCurrency(booking.creditApplied)}
          icon={Coins}
          toneClassName="text-orange-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.createdAt")}
          value={formatBookingCreatedAt(booking.createdAt)}
          icon={CalendarDays}
          toneClassName="text-orange-500"
        />
        {booking.paymentProofUrl ? (
          <div className="rounded-2xl border bg-background/80 p-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Image className="size-4 text-orange-500" />
              <span>{t("bookingList.detail.paymentProof")}</span>
            </div>
            <div className="mt-2">
              <a
                href={booking.paymentProofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                <img
                  src={booking.paymentProofUrl}
                  alt={t("bookingList.detail.paymentProofAlt")}
                  className="max-h-40 w-auto rounded-md object-contain"
                />
              </a>
            </div>
          </div>
        ) : (
          <BookingDetailField
            label={t("bookingList.detail.paymentProof")}
            value={t("bookingList.detail.notPaid")}
            icon={Image}
            toneClassName="text-orange-500"
          />
        )}
      </div>
    </section>
  )
}

export default BookingPaymentSection
