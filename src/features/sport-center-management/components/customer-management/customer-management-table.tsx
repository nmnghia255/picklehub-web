"use client"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CustomerListItem } from "@/features/sport-center-management/types/customer"

import { CustomerManagementTableRow } from "./customer-management-table-row"

interface CustomerManagementTableProps {
  customers: CustomerListItem[]
}

export function CustomerManagementTable({
  customers,
}: CustomerManagementTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="max-h-[68vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
            <TableRow>
              <TableHead className="w-[18%]">Khách hàng</TableHead>
              <TableHead className="w-[14%]">Liên hệ</TableHead>
              <TableHead className="w-[14%]">Lượt ghé thăm</TableHead>
              <TableHead className="w-[18%]">Số lần đặt sân</TableHead>
              <TableHead className="w-[14%]">Chi tiêu</TableHead>
              <TableHead className="w-[14%]">Lần gần nhất</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <CustomerManagementTableRow
                key={customer.customer.id}
                customer={customer}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default CustomerManagementTable
