import React from "react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useSocialsTranslation } from "@/features/socials/use-socials-translation"

export default function FiltersDrawer({
  open,
  onOpenChange,
  filters,
  setFilters,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: {
    status: string
    genderPolicy: string
    ageGroup: string
    format: string
    availableSlots: boolean
  }
  setFilters: (filters: {
    status: string
    genderPolicy: string
    ageGroup: string
    format: string
    availableSlots: boolean
  }) => void
}) {
  const { t } = useSocialsTranslation()

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="flex h-full flex-col">
          <DrawerHeader>
            <DrawerTitle>{t("filters.title")}</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-5">
              <div className="grid gap-2">
                <Label>{t("filters.status")}</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("filters.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t("filters.all")}</SelectItem>
                    <SelectItem value="PUBLISHED">
                      {t("labels.published")}
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                      {t("labels.completed")}
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                      {t("labels.cancelled")}
                    </SelectItem>
                    <SelectItem value="DRAFT">{t("labels.draft")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>{t("filters.genderPolicy")}</Label>
                <Select
                  value={filters.genderPolicy}
                  onValueChange={(value) =>
                    setFilters({ ...filters, genderPolicy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("filters.selectGenderPolicy")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t("filters.all")}</SelectItem>
                    <SelectItem value="MIXED">{t("labels.mixed")}</SelectItem>
                    <SelectItem value="MALE_ONLY">
                      {t("labels.menOnly")}
                    </SelectItem>
                    <SelectItem value="FEMALE_ONLY">
                      {t("labels.womenOnly")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>{t("filters.ageGroup")}</Label>
                <Select
                  value={filters.ageGroup}
                  onValueChange={(value) =>
                    setFilters({ ...filters, ageGroup: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("filters.selectAgeGroup")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t("filters.all")}</SelectItem>
                    <SelectItem value="JUNIOR">{t("labels.junior")}</SelectItem>
                    <SelectItem value="ADULT">{t("labels.adult")}</SelectItem>
                    <SelectItem value="SENIOR">{t("labels.senior")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>{t("filters.format")}</Label>
                <Select
                  value={filters.format}
                  onValueChange={(value) =>
                    setFilters({ ...filters, format: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("filters.selectFormat")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t("filters.all")}</SelectItem>
                    <SelectItem value="SOCIAL">{t("labels.social")}</SelectItem>
                    <SelectItem value="TOURNAMENT">
                      {t("labels.tournament")}
                    </SelectItem>
                    <SelectItem value="TRAINING">
                      {t("labels.training")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <Button
                className="w-full"
                variant={filters.availableSlots ? "default" : "outline"}
                onClick={() =>
                  setFilters({
                    ...filters,
                    availableSlots: !filters.availableSlots,
                  })
                }
              >
                {filters.availableSlots
                  ? t("listing.showingAvailableSlotsOnly")
                  : t("listing.showAllAvailability")}
              </Button>
            </div>
          </div>

          <DrawerFooter>
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  status: "ALL",
                  genderPolicy: "ALL",
                  ageGroup: "ALL",
                  format: "ALL",
                  availableSlots: false,
                })
              }
            >
              {t("filters.clearAll")}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
