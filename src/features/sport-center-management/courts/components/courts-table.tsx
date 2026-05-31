"use client"

import { ChevronRight, LayoutGrid } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { Court } from "../../types/court"
import { CourtStatusBadge, CourtTypeBadge } from "./court-badges"

export function CourtsTable({
  courts,
  loading,
  onView,
}: {
  courts: Court[]
  loading: boolean
  onView: (court: Court) => void
}) {
  if (loading) {
    return (
      <div className="space-y-2 rounded-2xl border p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (courts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
        <LayoutGrid className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">Chưa có sân nào</p>
        <p className="text-xs text-muted-foreground">
          Không tìm thấy sân phù hợp với bộ lọc hiện tại.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên sân</TableHead>
            <TableHead>Loại sân</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[1%] text-right">Chi tiết</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courts.map((court) => (
            <TableRow
              key={court.id}
              className="cursor-pointer"
              onClick={() => onView(court)}
            >
              <TableCell className="font-medium">{court.name}</TableCell>
              <TableCell>
                <CourtTypeBadge type={court.type} />
              </TableCell>
              <TableCell>
                <CourtStatusBadge status={court.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation()
                    onView(court)
                  }}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
