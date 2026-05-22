"use client"

import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  History,
  ReceiptText,
  ShieldCheck,
  TimerReset,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import {
  formatCurrencyVnd,
  formatReservationDate,
  formatReservationTime,
  type ReservationRecord,
} from "../../../../app/(protected)/sport-center-management/reservation-management/mock-data"
import { ReservationStatusBadge } from "./reservation-status-badge"

interface ReservationDetailDrawerProps {
  reservation: ReservationRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmBooking: (reservation: ReservationRecord) => void
  onExtendHold: (reservation: ReservationRecord) => void
  onMarkPaid: (reservation: ReservationRecord) => void
  onCancelReservation: (reservation: ReservationRecord) => void
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

export function ReservationDetailDrawer({
  reservation,
  open,
  onOpenChange,
  onConfirmBooking,
  onExtendHold,
  onMarkPaid,
  onCancelReservation,
}: ReservationDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        {reservation ? (
          <div className="flex h-full flex-col overflow-y-auto">
            <SheetHeader className="border-b px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <SheetTitle className="text-xl">
                    Reservation details
                  </SheetTitle>
                  <SheetDescription>
                    Review the temporary hold, payment status, and audit trail.
                  </SheetDescription>
                </div>
                <ReservationStatusBadge status={reservation.status} />
              </div>
            </SheetHeader>

            <div className="space-y-6 px-6 py-5">
              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <UserRound className="size-4 text-sky-500" />
                  Customer info
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock label="Name" value={reservation.customerName} />
                  <DetailBlock label="Phone" value={reservation.phone} />
                </div>
                <div className="rounded-2xl border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm leading-6 text-foreground">
                    {reservation.notes}
                  </p>
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="size-4 text-emerald-500" />
                  Court info
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock label="Court" value={reservation.courtName} />
                  <DetailBlock
                    label="Date"
                    value={formatReservationDate(reservation.reservationDate)}
                  />
                  <DetailBlock label="Time slot" value={reservation.timeSlot} />
                  <DetailBlock
                    label="Duration"
                    value={`${reservation.durationMinutes} minutes`}
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Wallet className="size-4 text-orange-500" />
                  Payment info
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock
                    label="Payment status"
                    value={reservation.paymentStatus.replace("_", " ")}
                  />
                  <DetailBlock
                    label="Method"
                    value={reservation.paymentMethod}
                  />
                  <DetailBlock
                    label="Transaction ID"
                    value={reservation.transactionId ?? "Not assigned"}
                  />
                  <DetailBlock label="Source" value={reservation.source} />
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <History className="size-4 text-violet-500" />
                  Timeline
                </div>
                <div className="space-y-3">
                  {reservation.timeline.map((entry) => (
                    <div
                      key={`${entry.label}-${entry.timestamp.toISOString()}`}
                      className="flex gap-3 rounded-2xl border bg-muted/20 p-3"
                    >
                      <div className="mt-0.5 rounded-full border bg-background p-2 text-muted-foreground">
                        <Clock3 className="size-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {entry.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatReservationTime(entry.timestamp)} ·{" "}
                          {entry.actor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="size-4 text-slate-500" />
                  Audit log
                </div>
                <div className="space-y-2">
                  {reservation.auditLog.map((entry) => (
                    <div
                      key={`${entry.action}-${entry.timestamp.toISOString()}`}
                      className="flex items-start justify-between gap-3 rounded-2xl border bg-muted/20 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {entry.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.actor}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatReservationTime(entry.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border bg-slate-950 p-4 text-white shadow-sm ring-1 ring-white/5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                  <ReceiptText className="size-4 text-cyan-300" />
                  Management snapshot
                </div>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Reservation hold text: {reservation.countdownText}. Total
                  value: {formatCurrencyVnd(reservation.totalPrice)}.
                </p>
              </section>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => onExtendHold(reservation)}
                >
                  <TimerReset className="mr-2 size-4" />
                  Extend hold
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onMarkPaid(reservation)}
                >
                  <BadgeCheck className="mr-2 size-4" />
                  Mark paid
                </Button>
                <Button
                  onClick={() => onConfirmBooking(reservation)}
                  className="sm:col-span-2"
                >
                  <BadgeCheck className="mr-2 size-4" />
                  Confirm booking
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onCancelReservation(reservation)}
                  className="sm:col-span-2"
                >
                  <XCircle className="mr-2 size-4" />
                  Cancel reservation
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
