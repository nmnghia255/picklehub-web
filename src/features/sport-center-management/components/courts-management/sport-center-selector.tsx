"use client"

import { ChevronDown, MapPinned } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useCourtScheduleStore } from "../../stores/court-schedule-store"

export function SportCenterSelector() {
  const sportCenters = useCourtScheduleStore((state) => state.sportCenters)
  const centerId = useCourtScheduleStore((state) => state.centerId)
  const loadingSportCenters = useCourtScheduleStore(
    (state) => state.loadingSportCenters
  )
  const fetchSportCenters = useCourtScheduleStore(
    (state) => state.fetchSportCenters
  )
  const setCenterId = useCourtScheduleStore((state) => state.setCenterId)
  const setSelectedCenter = useCourtScheduleStore(
    (state) => state.setSelectedCenter
  )

  useEffect(() => {
    fetchSportCenters()
  }, [])

  const selectedCenter = sportCenters.find((c) => c.id === centerId)
  const displayName = selectedCenter?.name ?? "Chọn sân"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          disabled={loadingSportCenters}
        >
          <MapPinned className="h-4 w-4" />
          <span>{displayName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {loadingSportCenters ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Đang tải...
          </div>
        ) : sportCenters.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Không có sân nào
          </div>
        ) : (
          sportCenters.map((center) => (
            <DropdownMenuItem
              key={center.id}
              onClick={() => {
                setCenterId(center.id)
                setSelectedCenter(center)
              }}
              className="flex flex-col items-start"
            >
              <span className="font-medium">{center.name}</span>
              <span className="text-xs text-muted-foreground">
                {center.address}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
