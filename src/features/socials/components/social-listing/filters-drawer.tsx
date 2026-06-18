import { Filter, FilterX } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import type { Filters } from "@/features/socials/stores/social-filter-store"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import {
  getAgeGroupOptions,
  getFormatOptions,
  getGenderPolicyOptions,
  getStatusOptions,
} from "../../types/filter-options"
import { FilterItem } from "./filter-item"

interface FiltersDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: Filters
  setFilters: (
    update: Partial<Filters> | ((prevFilters: Filters) => Partial<Filters>)
  ) => void
  resetFilters: () => void
  isMySocials?: boolean
  onApply?: () => void
}

export const FiltersDrawer: React.FC<FiltersDrawerProps> = ({
  open,
  onOpenChange,
  filters,
  setFilters,
  resetFilters,
  isMySocials = false,
  onApply,
}) => {
  const { t } = useSocialsTranslation()
  if (!open) return null

  const statusOptions = getStatusOptions(t)
  const genderPolicyOptions = getGenderPolicyOptions(t)
  const ageGroupOptions = getAgeGroupOptions(t)
  const formatOptions = getFormatOptions(t)

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="flex h-full flex-col">
          <DrawerHeader>
            <DrawerTitle>
              <div>
                <Filter className="mr-2 inline h-4 w-4" />
                {t("filters.title")}
              </div>
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-5">
              {isMySocials && (
                <>
                  <FilterItem
                    label={t("detail.schedule")}
                    selectionOptions={[
                      { value: null, label: t("filters.all") },
                      { value: "upcoming", label: t("filters.upcoming") },
                      { value: "history", label: t("filters.history") },
                    ]}
                    selectedValue={filters.tab}
                    onValueChange={(value) => setFilters({ tab: value })}
                  />
                  <FilterItem
                    label={t("labels.role")}
                    selectionOptions={[
                      { value: null, label: t("filters.all") },
                      { value: "host", label: t("labels.host") },
                      { value: "player", label: t("labels.player") },
                    ]}
                    selectedValue={filters.role}
                    onValueChange={(value) => setFilters({ role: value })}
                  />
                  <FilterItem
                    label={t("labels.status")}
                    selectionOptions={statusOptions}
                    selectedValue={filters.status}
                    onValueChange={(value) => setFilters({ status: value })}
                  />
                </>
              )}

              {!isMySocials && (
                <>
                  {/* start */}

                  {/* end */}

                  <FilterItem
                    label={t("labels.upcoming")}
                    selectionOptions={[
                      { value: null, label: t("filters.upcomingOptions.all") },
                      { value: true, label: t("filters.upcomingOptions.yes") },
                      { value: false, label: t("filters.upcomingOptions.no") },
                    ]}
                    selectedValue={filters.upcoming}
                    onValueChange={(value) =>
                      setFilters({ ...filters, upcoming: value })
                    }
                  />

                  <FilterItem
                    label={t("labels.hasAvailableSlots")}
                    selectionOptions={[
                      {
                        value: null,
                        label: t("filters.hasAvailableSlotsOptions.all"),
                      },
                      {
                        value: true,
                        label: t("filters.hasAvailableSlotsOptions.yes"),
                      },
                      {
                        value: false,
                        label: t("filters.hasAvailableSlotsOptions.no"),
                      },
                    ]}
                    selectedValue={filters.hasAvailableSlots}
                    onValueChange={(value) =>
                      setFilters({ ...filters, hasAvailableSlots: value })
                    }
                  />

                  <FilterItem
                    label={t("labels.minimumLevel")}
                    selectionOptions={[
                      { value: null, label: t("filters.levelOptions.all") },
                      { value: 1, label: "1" },
                      { value: 2, label: "2" },
                      { value: 3, label: "3" },
                      { value: 4, label: "4" },
                      { value: 5, label: "5" },
                    ]}
                    selectedValue={filters.minimumLevel}
                    onValueChange={(value) =>
                      setFilters({ ...filters, minimumLevel: value })
                    }
                  />

                  <FilterItem
                    label={t("labels.maximumLevel")}
                    selectionOptions={[
                      { value: null, label: t("filters.levelOptions.all") },
                      { value: 1, label: "1" },
                      { value: 2, label: "2" },
                      { value: 3, label: "3" },
                      { value: 4, label: "4" },
                      { value: 5, label: "5" },
                    ]}
                    selectedValue={filters.maximumLevel}
                    onValueChange={(value) =>
                      setFilters({ ...filters, maximumLevel: value })
                    }
                  />

                  <FilterItem
                    label={t("labels.genderPolicy")}
                    selectionOptions={genderPolicyOptions}
                    selectedValue={filters.genderPolicy}
                    onValueChange={(value) =>
                      setFilters({ ...filters, genderPolicy: value })
                    }
                  />

                  <FilterItem
                    label={t("labels.ageGroup")}
                    selectionOptions={ageGroupOptions}
                    selectedValue={filters.ageGroup}
                    onValueChange={(value) =>
                      setFilters({ ...filters, ageGroup: value })
                    }
                  />

                  <FilterItem
                    label={t("labels.format")}
                    selectionOptions={formatOptions}
                    selectedValue={filters.format}
                    onValueChange={(value) =>
                      setFilters({ ...filters, format: value })
                    }
                  />
                </>
              )}
            </div>

            <Separator className="my-6" />
            <Button variant="outline" onClick={resetFilters} className="w-full">
              <FilterX className="mr-2 inline h-4 w-4" />
              {t("filters.clearAll")}
            </Button>
          </div>

          <DrawerFooter className="flex-row gap-3 pt-2 pb-6">
            <Button className="flex-1" onClick={onApply}>
              {t("filters.apply", { defaultValue: "Áp dụng" })}
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("filters.close")}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
