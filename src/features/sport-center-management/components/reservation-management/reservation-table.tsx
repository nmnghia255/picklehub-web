"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  formatCurrencyVnd,
  formatReservationDate,
  formatReservationTime,
  type ReservationRecord,
} from "../../../../app/(protected)/sport-center-management/reservation-management/mock-data"
import { ReservationActionsDropdown } from "./reservation-actions-dropdown"
import { ReservationStatusBadge } from "./reservation-status-badge"

interface ReservationTableProps {
  reservations: ReservationRecord[]
  onView: (reservation: ReservationRecord) => void
  onRowClick: (reservation: ReservationRecord) => void
  onConfirmBooking: (reservation: ReservationRecord) => void
  onExtendHold: (reservation: ReservationRecord) => void
  onMarkPaid: (reservation: ReservationRecord) => void
  onCancelReservation: (reservation: ReservationRecord) => void
}

function PaymentBadge({
  paymentStatus,
}: {
  paymentStatus: ReservationRecord["paymentStatus"]
}) {
  const styles: Record<ReservationRecord["paymentStatus"], string> = {
    PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-700",
    PAID: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
    FAILED: "border-rose-500/20 bg-rose-500/10 text-rose-700",
    REFUNDED: "border-slate-500/20 bg-slate-500/10 text-slate-600",
  }

  return (
    <Badge
      className={`border px-2.5 py-1 font-medium ${styles[paymentStatus]}`}
      variant="outline"
    >
      {paymentStatus.replace("_", " ")}
    </Badge>
  )
}

function SourceBadge({ source }: { source: ReservationRecord["source"] }) {
  return <Badge variant="secondary">{source}</Badge>
}

export function ReservationTable({
  reservations,
  onView,
  onRowClick,
  onConfirmBooking,
  onExtendHold,
  onMarkPaid,
  onCancelReservation,
}: ReservationTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="max-h-[68vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
            <TableRow>
              <TableHead>Reservation ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Court</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time slot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Countdown</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Total price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow
                key={reservation.id}
                className={`group cursor-pointer transition-colors hover:bg-accent/50 ${reservation.status === "HOLDING" || reservation.status === "AWAITING_PAYMENT" ? "bg-blue-500/[0.03]" : ""}`}
                onClick={() => onRowClick(reservation)}
              >
                <TableCell className="font-medium text-foreground">
                  {reservation.id}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {reservation.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.phone}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{reservation.courtName}</Badge>
                </TableCell>
                <TableCell>
                  {formatReservationDate(reservation.reservationDate)}
                </TableCell>
                <TableCell>{reservation.timeSlot}</TableCell>
                <TableCell>
                  <ReservationStatusBadge status={reservation.status} />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {reservation.countdownText}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.countdownMode === "expired"
                        ? "Already released"
                        : `Ends ${formatReservationTime(reservation.holdExpiresAt)}`}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <PaymentBadge paymentStatus={reservation.paymentStatus} />
                </TableCell>
                <TableCell>
                  <SourceBadge source={reservation.source} />
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrencyVnd(reservation.totalPrice)}
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ReservationActionsDropdown
                    reservation={reservation}
                    onView={onView}
                    onConfirmBooking={onConfirmBooking}
                    onExtendHold={onExtendHold}
                    onMarkPaid={onMarkPaid}
                    onCancelReservation={onCancelReservation}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
