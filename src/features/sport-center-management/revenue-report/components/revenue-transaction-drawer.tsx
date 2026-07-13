"use client"

import { BadgeCheck, CalendarClock, CreditCard } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { RevenueTransaction } from "../types"
import { formatCurrencyVnd, formatDate, formatDateTime } from "../utils/format"

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function resolveTransactionDate(transaction: RevenueTransaction) {
  return (
    transaction.receivedAt ||
    transaction.reviewedAt ||
    transaction.createdAt ||
    ""
  )
}

export function RevenueTransactionDrawer({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: RevenueTransaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        {transaction ? (
          <div className="flex h-full flex-col overflow-y-auto">
            <SheetHeader className="border-b px-6 py-5">
              <SheetTitle className="text-xl">Chi tiết giao dịch</SheetTitle>
              <SheetDescription>
                Theo dõi thông tin thanh toán và trạng thái xử lý.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-6 py-5">
              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BadgeCheck className="size-4 text-emerald-500" />
                  Thông tin giao dịch
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock label="Mã giao dịch" value={transaction.id} />
                  <DetailBlock label="Trạng thái" value={transaction.status} />
                  <DetailBlock label="Phương thức" value={transaction.method} />
                  <DetailBlock
                    label="Ngày thanh toán"
                    value={formatDate(resolveTransactionDate(transaction))}
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CreditCard className="size-4 text-sky-500" />
                  Thông tin số tiền
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock
                    label="Tổng tiền"
                    value={formatCurrencyVnd(transaction.amount)}
                  />
                  <DetailBlock
                    label={t("revenue.drawer.courtCost")}
                    value={
                      transaction.courtCostVnd !== undefined &&
                      transaction.courtCostVnd !== null
                        ? formatCurrencyVnd(transaction.courtCostVnd)
                        : "-"
                    }
                  />
                  <DetailBlock
                    label={t("revenue.drawer.netRevenue")}
                    value={
                      transaction.netRevenueVnd !== undefined &&
                      transaction.netRevenueVnd !== null
                        ? formatCurrencyVnd(transaction.netRevenueVnd)
                        : "-"
                    }
                  />
                  <DetailBlock
                    label="Phí"
                    value={
                      transaction.fee !== undefined && transaction.fee !== null
                        ? formatCurrencyVnd(transaction.fee)
                        : transaction.platformFee !== undefined &&
                            transaction.platformFee !== null
                          ? formatCurrencyVnd(transaction.platformFee)
                          : "-"
                    }
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarClock className="size-4 text-amber-500" />
                  Thời điểm xử lý
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock
                    label="Tạo lúc"
                    value={formatDateTime(transaction.createdAt)}
                  />
                  <DetailBlock
                    label="Nhận lúc"
                    value={formatDateTime(transaction.receivedAt)}
                  />
                  <DetailBlock
                    label="Duyệt lúc"
                    value={formatDateTime(transaction.reviewedAt)}
                  />
                  <DetailBlock
                    label="Từ chối lúc"
                    value={formatDateTime(transaction.rejectedAt)}
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock
                    label="Trung tâm"
                    value={transaction.center?.name ?? transaction.centerId}
                  />
                  <DetailBlock
                    label="Mã booking"
                    value={transaction.bookingId}
                  />
                  <DetailBlock
                    label="Ngày booking"
                    value={formatDate(transaction.booking?.date)}
                  />
                  <DetailBlock
                    label="Số tiền booking"
                    value={
                      transaction.booking?.totalPrice
                        ? formatCurrencyVnd(transaction.booking.totalPrice)
                        : "-"
                    }
                  />
                </div>
                {transaction.rejectedReason ? (
                  <div className="rounded-2xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">
                      Lý do từ chối
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {transaction.rejectedReason}
                    </p>
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-6 py-10 text-sm text-muted-foreground">
            Chưa chọn giao dịch nào.
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
