"use client"

import { CreditCard, Image as ImageIcon } from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
import { formatCurrency } from "../booking-list.utils"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
  variant?: "card" | "ghost"
}

export function BookingPaymentSection({ booking, variant = "card" }: Props) {
  const { t } = useSportCenterManagementTranslation()

  return (
    <section
      className={
        variant === "ghost"
          ? "space-y-4"
          : "space-y-4 rounded-3xl border bg-card p-4 shadow-sm"
      }
    >
      <div className="text-md flex items-center gap-2 font-semibold">
        <CreditCard className="size-5 text-orange-500" />
        {t("bookingList.detail.paymentTitle")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label={t("bookingList.detail.amountPaid")}
          value={formatCurrency(booking.creditApplied)}
        />
        <BookingDetailField
          label={t("bookingList.detail.amountDue")}
          value={formatCurrency(booking.paymentRemaining)}
        />
        {booking.paymentProofUrl ? (
          <div className="rounded-2xl border bg-background/80 p-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="size-4 text-orange-500" />
              <span>{t("bookingList.detail.paymentProof")}</span>
            </div>
            <div className="mt-2">
              <a
                href={booking.paymentProofUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline"
              >
                {t("bookingList.detail.viewProof")}
              </a>
            </div>
          </div>
        ) : (
          <BookingDetailField
            label={t("bookingList.detail.paymentProof")}
            value={t("bookingList.detail.notPaid")}
            icon={ImageIcon}
            toneClassName="text-orange-500"
          />
        )}
      </div>
    </section>
  )
}
