"use client"

import { format } from "date-fns"
import { Calendar } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentBooking } from "../../types/booking"
import type { TournamentCenter } from "../../types/tournament-center"

interface BookingsHistoryProps {
  bookings: TournamentBooking[]
  centers: TournamentCenter[]
  onCancelBooking: (bookingId: string) => Promise<void>
}

export function BookingsHistory({
  bookings,
  centers,
  onCancelBooking,
}: BookingsHistoryProps) {
  const { t } = useTournamentTranslation()
  const [selectedBooking, setSelectedBooking] =
    useState<TournamentBooking | null>(null)

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase()
    switch (s) {
      case "CONFIRMED":
        return (
          <Badge className="border-none bg-emerald-100 font-medium text-emerald-800 hover:bg-emerald-100">
            {t("booking.status.confirmed")}
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className="border-none bg-amber-100 font-medium text-amber-800 hover:bg-amber-100">
            {t("booking.status.pending")}
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="border-none bg-rose-100 font-medium text-rose-800 hover:bg-rose-100">
            {t("booking.status.cancelled")}
          </Badge>
        )
      case "EXPIRED":
      default:
        return (
          <Badge variant="secondary" className="font-medium">
            {t("booking.status.expired")}
          </Badge>
        )
    }
  }

  return (
    <>
      <Card className="gap-0 border-gray-200 shadow-sm lg:col-span-2 dark:border-zinc-800">
        <CardHeader className="border-b bg-gray-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <CardTitle className="text-base font-bold text-gray-800 dark:text-zinc-100">
            {t("booking.historyCard.title")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("booking.historyCard.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="p-6 py-16 text-center text-sm text-gray-500 dark:text-zinc-400">
              <Calendar className="mx-auto mb-2 h-8 w-8 animate-pulse text-gray-300 dark:text-zinc-700" />
              {t("booking.historyCard.noBookings")}
            </div>
          ) : (
            <Table className="table-auto">
              <TableHeader>
                <TableRow className="bg-gray-50/20 text-sm dark:bg-zinc-900/20">
                  <TableHead className="w-[120px] px-4 py-3 font-semibold text-gray-600 dark:text-zinc-400">
                    {t("booking.historyCard.table.id")}
                  </TableHead>
                  <TableHead className="min-w-[150px] px-4 py-3 font-semibold text-gray-600 dark:text-zinc-400">
                    {t("booking.historyCard.table.venue")}
                  </TableHead>
                  <TableHead className="min-w-[90px] px-4 py-3 font-semibold text-gray-600 dark:text-zinc-400">
                    {t("booking.historyCard.table.date")}
                  </TableHead>
                  <TableHead className="min-w-[180px] px-4 py-3 font-semibold text-gray-600 dark:text-zinc-400">
                    {t("booking.historyCard.table.courts")}
                  </TableHead>
                  <TableHead className="min-w-[100px] px-4 py-3 font-semibold text-gray-600 dark:text-zinc-400">
                    {t("booking.historyCard.table.price")}
                  </TableHead>
                  <TableHead className="min-w-[100px] px-4 py-3 font-semibold text-gray-600 dark:text-zinc-400">
                    {t("booking.historyCard.table.status")}
                  </TableHead>
                  <TableHead className="w-[80px] px-4 py-3 text-right font-semibold text-gray-600 dark:text-zinc-400">
                    {t("booking.historyCard.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const centerName =
                    centers.find((c) => c.centerId === booking.centerId)
                      ?.name || `Center: ${booking.centerId}`
                  const displayId = String(
                    booking.externalBookingId || booking.id
                  )
                  return (
                    <TableRow
                      key={booking.id}
                      className="cursor-pointer text-sm transition-colors hover:bg-gray-50/50 dark:hover:bg-zinc-900/50"
                      onClick={() => {
                        if (booking.items && booking.items.length > 0) {
                          setSelectedBooking(booking)
                        }
                      }}
                    >
                      <TableCell className="w-[120px] px-4 py-3 font-mono font-medium text-gray-500 dark:text-zinc-400">
                        <span
                          className="block max-w-[100px] truncate"
                          title={displayId}
                        >
                          {displayId}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[150px] px-4 py-3 text-sm font-semibold whitespace-normal text-gray-900 dark:text-zinc-100">
                        {centerName}
                      </TableCell>
                      <TableCell className="min-w-[90px] px-4 py-3 text-sm whitespace-nowrap text-gray-600 dark:text-zinc-300">
                        {booking.date
                          ? format(new Date(booking.date), "dd/MM/yyyy")
                          : "TBD"}
                      </TableCell>
                      <TableCell className="max-w-[220px] min-w-[180px] px-4 py-3 whitespace-normal">
                        {booking.items && booking.items.length > 0 ? (
                          <div className="space-y-1">
                            {booking.items.slice(0, 2).map((it, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1 text-sm font-medium whitespace-nowrap text-gray-500 dark:text-zinc-400"
                              >
                                <span className="dark:text-zinc-350 font-bold text-gray-700">
                                  {it.court?.name || `Court ${it.courtId}`}
                                </span>
                                <span>
                                  ({it.startTime} - {it.endTime})
                                </span>
                              </div>
                            ))}
                            {booking.items.length > 2 && (
                              <div className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                + {booking.items.length - 2}{" "}
                                {t("booking.more", { defaultValue: "more" })}...
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-zinc-500">
                            {t("booking.historyCard.noCourts")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[100px] px-4 py-3 font-bold whitespace-nowrap text-gray-900 dark:text-zinc-100">
                        {booking.totalPrice !== null ? (
                          <span>
                            {t("booking.historyCard.priceValue", {
                              price: booking.totalPrice.toLocaleString(),
                            })}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-zinc-500">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[100px] px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(booking.statusMirror)}
                      </TableCell>
                      <TableCell
                        className="w-[80px] px-4 py-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {booking.statusMirror.toUpperCase() !== "CANCELLED" &&
                          booking.statusMirror.toUpperCase() !== "EXPIRED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onCancelBooking(booking.id.toString())
                              }
                              className="dark:text-rose-450 dark:hover:text-rose-350 h-8 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-800 dark:hover:bg-rose-950/20"
                            >
                              {t("booking.cancelBtn")}
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
      >
        <DialogContent className="max-w-md gap-0 border bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-zinc-100">
              {t("booking.detailDialog.title", {
                defaultValue: "Chi tiết Khung giờ Đặt sân",
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-zinc-950 dark:text-zinc-300">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                  {t("booking.historyCard.table.id")}:
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  {selectedBooking?.externalBookingId || selectedBooking?.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                  {t("booking.historyCard.table.venue")}:
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  {selectedBooking &&
                    (centers.find(
                      (c) => c.centerId === selectedBooking.centerId
                    )?.name ||
                      `Center: ${selectedBooking.centerId}`)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                  {t("booking.historyCard.table.date")}:
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  {selectedBooking?.date
                    ? format(new Date(selectedBooking.date), "dd/MM/yyyy")
                    : "TBD"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-md font-semibold text-gray-700 dark:text-zinc-200">
                {t("booking.detailDialog.slotsTitle", {
                  defaultValue: "Danh sách sân và khung giờ đặt:",
                })}
              </h4>
              <div className="max-h-[300px] divide-y divide-gray-50 overflow-y-auto rounded-lg border border-gray-100 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
                {selectedBooking?.items?.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-2.5 text-xs"
                  >
                    <span className="text-sm font-semibold text-gray-800 dark:text-zinc-100">
                      {it.court?.name || `Court ${it.courtId}`}
                    </span>
                    <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                      {it.startTime} - {it.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
