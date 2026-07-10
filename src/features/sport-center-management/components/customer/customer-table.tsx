"use client"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CustomerListItem } from "@/features/sport-center-management/types/customer"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { CustomerManagementTableRow } from "./customer-table-row"

interface CustomerManagementTableProps {
  customers: CustomerListItem[]
  onCustomerSelect: (customerId: string) => void
}

export function CustomerTable({
  customers,
  onCustomerSelect,
}: CustomerManagementTableProps) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="max-h-[68vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
            <TableRow>
              <TableHead className="w-[18%]">
                {t("customer.table.customer")}
              </TableHead>
              <TableHead className="w-[14%]">
                {t("customer.table.contact")}
              </TableHead>
              <TableHead className="w-[14%]">
                {t("customer.table.visits")}
              </TableHead>
              <TableHead className="w-[18%]">
                {t("customer.table.bookings")}
              </TableHead>
              <TableHead className="w-[14%]">
                {t("customer.table.spend")}
              </TableHead>
              <TableHead className="w-[14%]">
                {t("customer.table.lastVisit")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <CustomerManagementTableRow
                key={customer.customer.id}
                customer={customer}
                onSelect={onCustomerSelect}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default CustomerTable
