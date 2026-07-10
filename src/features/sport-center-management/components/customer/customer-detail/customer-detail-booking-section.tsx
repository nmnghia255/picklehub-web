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
    <section className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
      <CustomerDetailSectionTitle
        icon={CalendarDays}
        title={t("customer.detail.recentBookingsTitle")}
        toneClassName="text-violet-500"
      />
      <div className="space-y-2">
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
    <div className="space-y-2 rounded-2xl border bg-background/80 p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{booking.center.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatDateTimeLong(booking.createdAt)}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <CustomerDetailValueCard
          label={t("bookingList.detail.totalPrice")}
          value={formatCurrency(booking.totalPrice)}
          icon={Coins}
          toneClassName="text-emerald-500"
        />
        <CustomerDetailValueCard
          label={t("customer.detail.appliedCredit")}
          value={formatCurrency(booking.creditApplied)}
          icon={Wallet}
          toneClassName="text-orange-500"
        />
        <CustomerDetailValueCard
          label={t("customer.detail.remainingBalance")}
          value={formatCurrency(booking.paymentRemaining)}
          icon={Coins}
          toneClassName="text-violet-500"
        />
      </div>
    </div>
  )
}

export default CustomerDetailBookingSection
