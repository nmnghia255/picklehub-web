"use client"

import {
  CalendarDays,
  Coins,
  History,
  ReceiptText,
  Trash2,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import type { CreditRecord } from "../../credit-management/court-credits-data"
import {
  formatCreditDate,
  formatCreditDateTime,
  formatCurrencyVnd,
} from "../../credit-management/court-credits-data"

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

export function CreditDetailDrawer({
  credit,
  open,
  onOpenChange,
  onCancelCredit,
}: {
  credit: CreditRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancelCredit: (credit: CreditRecord) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        {credit ? (
          <div className="flex h-full flex-col overflow-y-auto">
            <SheetHeader className="border-b px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <SheetTitle className="text-xl">Credit details</SheetTitle>
                  <SheetDescription>
                    Review the original cancellation, remaining balance, and
                    usage timeline.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6 px-6 py-5">
              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <UserRound className="size-4 text-sky-500" />
                  Customer Information
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock label="Name" value={credit.customerName} />
                  <DetailBlock label="Phone Number" value={credit.phone} />
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="size-4 text-emerald-500" />
                  Original Booking Information
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock
                    label="Booking ID"
                    value={credit.originalBookingId}
                  />
                  <DetailBlock label="Court Name" value={credit.courtName} />
                  <DetailBlock
                    label="Booking Date"
                    value={formatCreditDate(credit.bookingDate)}
                  />
                  <DetailBlock label="Time Slot" value={credit.timeSlot} />
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Coins className="size-4 text-orange-500" />
                  Credit Information
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock
                    label="Credit Amount"
                    value={formatCurrencyVnd(credit.creditAmount)}
                  />
                  <DetailBlock
                    label="Remaining Amount"
                    value={formatCurrencyVnd(credit.remainingAmount)}
                  />
                  <DetailBlock
                    label="Created Date"
                    value={formatCreditDateTime(credit.createdAt)}
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ReceiptText className="size-4 text-violet-500" />
                  Cancellation Information
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock
                    label="Cancellation Reason"
                    value={credit.cancellationReason.replace("_", " ")}
                  />
                  <DetailBlock
                    label="Manual Credit"
                    value={credit.manualCredit ? "Yes" : "No"}
                  />
                </div>
                <div className="rounded-2xl border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm leading-6 text-foreground">
                    {credit.notes}
                  </p>
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <History className="size-4 text-slate-500" />
                  Credit Usage History
                </div>
                <div className="space-y-3">
                  {credit.usageHistory.length ? (
                    credit.usageHistory.map((entry) => (
                      <div
                        key={`${entry.bookingId}-${entry.timestamp.toISOString()}`}
                        className="rounded-2xl border bg-muted/20 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Used {formatCurrencyVnd(entry.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCreditDateTime(entry.timestamp)} · Booking{" "}
                              {entry.bookingId}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No usage recorded yet.
                    </p>
                  )}
                </div>
              </section>

              <div className="grid gap-3 sm:grid-cols-3">
                <div />
                <div />
                <Button
                  variant="destructive"
                  onClick={() => onCancelCredit(credit)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Cancel Credit
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-6 py-10 text-sm text-muted-foreground">
            No credit selected.
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
