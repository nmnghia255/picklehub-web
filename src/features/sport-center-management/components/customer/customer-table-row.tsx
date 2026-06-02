"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import { BookingStatusBadge } from "@/features/sport-center-management/components/booking-list/booking-status-badge"
import type { CustomerListItem } from "@/features/sport-center-management/types/customer"
import { cn } from "@/lib/utils"

import { formatDateTimeLong, formatVisitBreakdown } from "./customer.utils"

interface CustomerManagementTableRowProps {
  customer: CustomerListItem
  onSelect: (customerId: string) => void
}

export function CustomerManagementTableRow({
  customer,
  onSelect,
}: CustomerManagementTableRowProps) {
  const { summary, latestBooking } = customer

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return

    event.preventDefault()
    onSelect(customer.customer.id)
  }

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none focus-visible:ring-inset"
      )}
      tabIndex={0}
      onClick={() => onSelect(customer.customer.id)}
      onKeyDown={handleKeyDown}
    >
      <TableCell className="w-[30%] whitespace-normal">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {customer.customer.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {customer.customer.email}
          </p>
          {/* <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className="rounded-full">
              {summary.centerCount} trung tâm
            </Badge>
            {customer.centers.slice(0, 2).map((center) => (
              <span
                key={center.centerId}
                className="text-xs text-muted-foreground"
              >
                {center.centerName}
              </span>
            ))}
          </div> */}
        </div>
      </TableCell>

      <TableCell className="w-[16%] whitespace-normal">
        <p className="font-medium text-foreground">
          {customer.customer.phoneNumber || "Chưa cập nhật"}
        </p>
      </TableCell>

      <TableCell className="w-[20%] whitespace-normal">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {summary.visitCount} lượt
          </p>
          <p className="text-xs text-muted-foreground">
            Lần cuối: {formatDateTimeLong(summary.lastVisitAt)}
          </p>
        </div>
      </TableCell>

      <TableCell className="w-[18%] whitespace-normal">
        <div className="space-y-2">
          <p className="font-medium text-foreground">
            Tổng: {summary.visitCount}
          </p>
          <div className="flex flex-wrap gap-1">
            <p className="text-sm text-muted-foreground">
              {formatVisitBreakdown(summary)}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="w-[16%] whitespace-normal">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {formatCurrency(summary.totalSpend)}
          </p>
          <p className="text-sm text-muted-foreground">
            Dư credit: {formatCurrency(summary.creditBalance)}
          </p>
        </div>
      </TableCell>

      <TableCell className="w-[18%] whitespace-normal">
        {latestBooking ? (
          <div className="space-y-2">
            <BookingStatusBadge status={latestBooking.status} />
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{latestBooking.center.name}</p>
              <p>{formatDateTimeLong(latestBooking.createdAt)}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Chưa có booking gần nhất
          </p>
        )}
      </TableCell>
    </TableRow>
  )
}

export default CustomerManagementTableRow
