"use client"

import { CalendarDays, Coins, Wallet } from "lucide-react"

import { formatCurrency } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import { BookingStatusBadge } from "@/features/sport-center-management/components/booking-list/booking-status-badge"
import type { RecentBooking } from "@/features/sport-center-management/types/customer"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { formatDateTimeLong } from "../customer.utils"
import { CustomerDetailEmptyState } from "./customer-detail-empty-state"
import { CustomerDetailSectionTitle } from "./customer-detail-section-title"
import { CustomerDetailValueCard } from "./customer-detail-value-card"

interface CustomerDetailBookingSectionProps {
  recentBookings: RecentBooking[]
}

export function CustomerDetailBookingSection({
  recentBookings,
}: CustomerDetailBookingSectionProps) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="space-y-3">
      <CustomerDetailSectionTitle
        icon={CalendarDays}
        title={t("customer.detail.recentBookingsTitle")}
        toneClassName="text-violet-500"
      />
      <div className="space-y-3">
        {recentBookings.length > 0 ? (
          recentBookings.map((booking) => (
            <RecentBookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <CustomerDetailEmptyState
            text={t("customer.detail.noRecentBookings")}
          />
        )}
      </div>
    </section>
  )
}

function RecentBookingCard({ booking }: { booking: RecentBooking }) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <div className="space-y-3 rounded-2xl bg-muted/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{booking.center.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTimeLong(booking.createdAt)}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <CustomerDetailValueCard
          label={t("bookingList.detail.totalPrice")}
          value={formatCurrency(booking.totalPrice)}
          icon={Coins}
          toneClassName="text-emerald-500"
          variant="ghost"
        />
        <CustomerDetailValueCard
          label={t("customer.detail.appliedCredit")}
          value={formatCurrency(booking.creditApplied)}
          icon={Wallet}
          toneClassName="text-orange-500"
          variant="ghost"
        />
        <CustomerDetailValueCard
          label={t("customer.detail.remainingBalance")}
          value={formatCurrency(booking.paymentRemaining)}
          icon={Coins}
          toneClassName="text-violet-500"
          variant="ghost"
        />
      </div>
    </div>
  )
}

export default CustomerDetailBookingSection
