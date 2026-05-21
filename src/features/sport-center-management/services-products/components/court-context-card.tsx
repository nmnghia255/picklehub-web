"use client"

import { MapPin, Store, WifiOff } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { CourtInventoryRecord } from "../types"
import {
  formatMockDateTime,
  getCourtStatusClass,
  getCourtStatusLabel,
} from "../utils"

interface CourtContextCardProps {
  courts: CourtInventoryRecord[]
  selectedCourtId: string
  onSelectedCourtChange: (courtId: string) => void
}

export function CourtContextCard({
  courts,
  selectedCourtId,
  onSelectedCourtChange,
}: CourtContextCardProps) {
  const selectedCourt =
    courts.find((court) => court.courtId === selectedCourtId) ?? courts[0]

  if (!selectedCourt) return null

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="flex flex-wrap items-center gap-3 text-xl">
              <span>{selectedCourt.courtName}</span>
              <Badge className={getCourtStatusClass(selectedCourt.status)}>
                {getCourtStatusLabel(selectedCourt.status)}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Mỗi sân có danh mục sản phẩm và dịch vụ riêng để phục vụ vận hành
              tại chỗ.
            </p>
          </div>

          <div className="min-w-0 lg:w-72">
            <Select
              value={selectedCourt.courtId}
              onValueChange={onSelectedCourtChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn sân" />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court) => (
                  <SelectItem key={court.courtId} value={court.courtId}>
                    {court.courtName} - {court.courtType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="size-4" />
            Loại sân
          </div>
          <p className="font-medium">{selectedCourt.courtType}</p>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            Vị trí
          </div>
          <p className="font-medium">{selectedCourt.location}</p>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <WifiOff className="size-4" />
            Cập nhật gần nhất
          </div>
          <p className="font-medium">
            {formatMockDateTime(selectedCourt.updatedAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
