"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import { BookingStatusBadge } from "@/features/sport-center-management/components/booking-list/booking-status-badge"
import type { CustomerListItem } from "@/features/sport-center-management/types/customer"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"
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
  const { t } = useSportCenterManagementTranslation()
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
        </div>
      </TableCell>

      <TableCell className="w-[16%] whitespace-normal">
        <p className="font-medium text-foreground">
          {customer.customer.phoneNumber || t("common.phoneNotUpdated")}
        </p>
      </TableCell>

      <TableCell className="w-[20%] whitespace-normal">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {t("customer.detail.visitCount", { count: summary.visitCount })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("customer.detail.lastVisit")}:{" "}
            {formatDateTimeLong(summary.lastVisitAt)}
          </p>
        </div>
      </TableCell>

      <TableCell className="w-[18%] whitespace-normal">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {t("customer.detail.visitCountLabel")}: {summary.visitCount}
          </p>
          <div className="space-y-0.5 text-xs text-muted-foreground">
            {formatVisitBreakdown(summary, {
              completed: t("bookingList.status.completed"),
              pending: t("bookingList.status.pending"),
              cancelled: t("bookingList.status.cancelled"),
            }).map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
        </div>
      </TableCell>

      <TableCell className="w-[16%] whitespace-normal">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {formatCurrency(summary.totalSpend)}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("customer.detail.creditBalance")}:{" "}
            {formatCurrency(summary.creditBalance)}
          </p>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default CustomerManagementTableRow
