import { Building2, CalendarDays } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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

import type { CourtExpenseRow } from "./expense-types"
import { formatVnd } from "./expense-utils"

export function CourtBookingExpensesCard({
  expenseRows,
  totalCourtExpense,
}: {
  expenseRows: CourtExpenseRow[]
  totalCourtExpense: number
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-xl">Court Booking Expenses</CardTitle>
            <CardDescription className="mt-1">
              Every cost in this tab comes from booked courts.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            <Building2 className="mr-1.5 size-3.5" />
            Table-driven and ready for future types
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        <div className="overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
              <TableRow>
                <TableHead className="px-6 py-4">Court Name</TableHead>
                <TableHead className="px-6 py-4">Date</TableHead>
                <TableHead className="px-6 py-4">Time</TableHead>
                <TableHead className="px-6 py-4">Duration</TableHead>
                <TableHead className="px-6 py-4 text-right">Cost</TableHead>
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
                        <p>{row.courtName}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.type === "COURT_BOOKING"
                            ? "Court booking"
                            : "Other expense"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {row.date}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {row.time}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {row.duration}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right font-medium">
                    {formatVnd(row.cost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-4 text-sm">
                  Total Court Expense
                </TableCell>
                <TableCell className="px-6 py-4 text-right text-base">
                  {formatVnd(totalCourtExpense)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            All entries are court booking expenses today. If the business
            expands later, the same table and aggregation patterns can be
            extended with more expense categories.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
