"use client"

import { CalendarDays, Coins, Wallet } from "lucide-react"

import { formatCurrency } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import { BookingStatusBadge } from "@/features/sport-center-management/components/booking-list/booking-status-badge"
import type { RecentBooking } from "@/features/sport-center-management/types/customer"

import { formatDateTimeLong } from "../customer-management.utils"
import { CustomerDetailEmptyState } from "./customer-detail-empty-state"
import { CustomerDetailSectionTitle } from "./customer-detail-section-title"
import { CustomerDetailValueCard } from "./customer-detail-value-card"

interface CustomerDetailBookingSectionProps {
  recentBookings: RecentBooking[]
}

export function CustomerDetailBookingSection({
  recentBookings,
}: CustomerDetailBookingSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <CustomerDetailSectionTitle
        icon={CalendarDays}
        title="Lịch sử đặt sân gần đây"
        toneClassName="text-violet-500"
      />
      <div className="space-y-3">
        {recentBookings.length > 0 ? (
          recentBookings.map((booking) => (
            <RecentBookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <CustomerDetailEmptyState text="Chưa có booking gần đây." />
        )}
      </div>
    </section>
  )
}

function RecentBookingCard({ booking }: { booking: RecentBooking }) {
  return (
    <div className="space-y-3 rounded-2xl border bg-background/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{booking.center.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTimeLong(booking.createdAt)}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <CustomerDetailValueCard
          label="Tổng tiền"
          value={formatCurrency(booking.totalPrice)}
          icon={Coins}
          toneClassName="text-emerald-500"
        />
        <CustomerDetailValueCard
          label="Credit áp dụng"
          value={formatCurrency(booking.creditApplied)}
          icon={Wallet}
          toneClassName="text-orange-500"
        />
        <CustomerDetailValueCard
          label="Còn lại"
          value={formatCurrency(booking.paymentRemaining)}
          icon={Coins}
          toneClassName="text-violet-500"
        />
      </div>
    </div>
  )
}

export default CustomerDetailBookingSection
