import { differenceInMinutes, format } from "date-fns"
import { CalendarDays } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import type { CourtBookingExpense } from "../../../types/finance"

export function CourtBookingExpensesCard({
  expenseRows,
  totalCourtExpense,
}: {
  expenseRows: CourtBookingExpense[]
  totalCourtExpense: number
}) {
  const { t } = useSocialsTranslation()

  return (
    <Card className="gap-0 overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-xl">
              {t("expenses.courtBookings.title")}
            </CardTitle>
            <CardDescription className="mt-1">
              {t("expenses.courtBookings.description")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        <div className="overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
              <TableRow>
                <TableHead className="px-6 py-4">
                  {t("expenses.courtBookings.headers.courtName")}
                </TableHead>
                <TableHead className="px-6 py-4">
                  {t("expenses.courtBookings.headers.date")}
                </TableHead>
                <TableHead className="px-6 py-4">
                  {t("expenses.courtBookings.headers.time")}
                </TableHead>
                <TableHead className="px-6 py-4">
                  {t("expenses.courtBookings.headers.duration")}
                </TableHead>
                <TableHead className="px-6 py-4 text-right">
                  {t("expenses.courtBookings.headers.cost")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CalendarDays className="size-4" />
                      </span>
                      <div>
                        <p>{row.courtNames || row.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("expenses.courtBookings.rowTypeCourtBooking")}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {format(new Date(row.startTime), "PP")}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {format(new Date(row.startTime), "p")} -{" "}
                    {format(new Date(row.endTime), "p")}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {(() => {
                      const diffInMinutes = differenceInMinutes(
                        new Date(row.endTime),
                        new Date(row.startTime)
                      )
                      const hours = Math.floor(diffInMinutes / 60)
                      const minutes = diffInMinutes % 60

                      if (hours > 0 && minutes > 0) {
                        return `${t("common.hours", { count: hours })} ${t("common.minutes", { count: minutes })}`
                      }
                      if (hours > 0) {
                        return t("common.hours", { count: hours })
                      }
                      return t("common.minutes", { count: minutes })
                    })()}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right font-medium">
                    {formatCurrencyVnd(row.bookingCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-4 text-sm">
                  {t("expenses.courtBookings.footerLabel")}
                </TableCell>
                <TableCell className="px-6 py-4 text-right text-base">
                  {formatCurrencyVnd(totalCourtExpense)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* <div className="px-6 pb-6">
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("expenses.courtBookings.note")}
          </div>
        </div> */}
      </CardContent>
    </Card>
  )
}
