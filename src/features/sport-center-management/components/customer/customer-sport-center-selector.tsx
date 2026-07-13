"use client"

import { Check, ChevronDown, MapPinned } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCourtScheduleStore } from "@/features/sport-center-management/stores/court-schedule-store"
import { useCustomerManagementStore } from "@/features/sport-center-management/stores/customer-management-store"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

export function CustomerSportCenterSelector() {
  const { t } = useSportCenterManagementTranslation()
  const sportCenters = useCourtScheduleStore((state) => state.sportCenters)
  const loadingSportCenters = useCourtScheduleStore(
    (state) => state.loadingSportCenters
  )
  const centerFilterId = useCustomerManagementStore(
    (state) => state.centerFilterId
  )
  const setCenterFilterId = useCustomerManagementStore(
    (state) => state.setCenterFilterId
  )

  const selectedCenter = sportCenters.find(
    (center) => center.id === centerFilterId
  )
  const displayName =
    selectedCenter?.name ?? t("customer.detail.selector.allCenters")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between gap-2 sm:w-auto"
          disabled={loadingSportCenters}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <MapPinned className="h-4 w-4" />
            <span className="truncate">{displayName}</span>
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem
          onClick={() => setCenterFilterId(null)}
          className="flex flex-col items-start"
        >
          <span className="inline-flex w-full items-center">
            <span className="mr-2 inline-flex w-4 items-center justify-center">
              {centerFilterId == null ? <Check className="h-4 w-4" /> : null}
            </span>

            <span className="font-medium">
              {t("customer.detail.selector.allCenters")}
            </span>
          </span>
        </DropdownMenuItem>

        {loadingSportCenters ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {t("customer.detail.selector.loadingCenters")}
          </div>
        ) : sportCenters.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {t("customer.detail.selector.noCenters")}
          </div>
        ) : (
          sportCenters.map((center) => (
            <DropdownMenuItem
              key={center.id}
              onClick={() => setCenterFilterId(center.id)}
              className="flex flex-col items-start"
            >
              <span className="inline-flex w-full items-center">
                <span className="mr-2 inline-flex w-4 items-center justify-center">
                  {centerFilterId === center.id ? (
                    <Check className="h-4 w-4" />
                  ) : null}
                </span>
                <span className="font-medium">{center.name}</span>
              </span>
              <span className="pl-6 text-xs text-muted-foreground">
                {center.address}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CustomerSportCenterSelector
