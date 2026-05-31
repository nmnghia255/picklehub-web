"use client"

import { formatDate } from "date-fns"
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
import { useCourtCreditsTranslation } from "@/i18n/use-court-credits-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import type { CreditRecord } from "../../types/credit"

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
  const { t } = useCourtCreditsTranslation()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        {credit ? (
          <div className="flex h-full flex-col overflow-y-auto">
            <SheetHeader className="border-b px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <SheetTitle className="text-xl">
                    {t("detail.title")}
                  </SheetTitle>
                  <SheetDescription>{t("detail.description")}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6 px-6 py-5">
              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <UserRound className="size-4 text-sky-500" />
                  {t("detail.customerInformation")}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock
                    label={t("detail.name")}
                    value={credit.customerName}
                  />
                  <DetailBlock
                    label={t("detail.phoneNumber")}
                    value={credit.phone}
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="size-4 text-emerald-500" />
                  {t("detail.originalBookingInformation")}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock
                    label={t("detail.bookingId")}
                    value={credit.originalBookingId}
                  />
                  <DetailBlock
                    label={t("detail.courtName")}
                    value={credit.courtName}
                  />
                  <DetailBlock
                    label={t("detail.bookingDate")}
                    value={formatDate(credit.bookingDate, "MMMM d, yyyy")}
                  />
                  <DetailBlock
                    label={t("detail.timeSlot")}
                    value={credit.timeSlot}
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Coins className="size-4 text-orange-500" />
                  {t("detail.creditInformation")}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock
                    label={t("detail.creditAmount")}
                    value={formatCurrencyVnd(credit.creditAmount)}
                  />
                  <DetailBlock
                    label={t("detail.remainingAmount")}
                    value={formatCurrencyVnd(credit.remainingAmount)}
                  />
                  <DetailBlock
                    label={t("detail.createdDate")}
                    value={formatDate(credit.createdAt, "MMMM d, yyyy")}
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ReceiptText className="size-4 text-violet-500" />
                  {t("detail.cancellationInformation")}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock
                    label={t("detail.cancellationReason")}
                    value={t(`reasons.${credit.cancellationReason}` as never)}
                  />
                  <DetailBlock
                    label={t("detail.manualCredit")}
                    value={
                      credit.manualCredit ? t("detail.yes") : t("detail.no")
                    }
                  />
                </div>
                <div className="rounded-2xl border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("detail.notes")}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-foreground">
                    {credit.notes}
                  </p>
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <History className="size-4 text-slate-500" />
                  {t("detail.creditUsageHistory")}
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
                              {t("detail.usedAmount", {
                                amount: formatCurrencyVnd(entry.amount),
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(entry.timestamp, "MMMM d, yyyy")}
                              {" · "}
                              {t("detail.bookingLabel", {
                                bookingId: entry.bookingId,
                              })}
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
                      {t("detail.noUsageRecorded")}
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
                  {t("detail.cancelCredit")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-6 py-10 text-sm text-muted-foreground">
            {t("detail.noCreditSelected")}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
