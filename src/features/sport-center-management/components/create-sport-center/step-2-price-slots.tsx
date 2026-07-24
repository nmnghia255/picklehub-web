import { Plus, Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { PriceSlotDraft } from "./types"

export function Step2PriceSlots({
  priceSlots,
  setPriceSlots,
  addPriceSlot,
  removePriceSlot,
  priceSlotDeleteTarget,
  setPriceSlotDeleteTarget,
  confirmRemovePriceSlot,
  isDeleting,
}: {
  priceSlots: PriceSlotDraft[]
  setPriceSlots: React.Dispatch<React.SetStateAction<PriceSlotDraft[]>>
  addPriceSlot: () => void
  removePriceSlot: (slot: PriceSlotDraft) => void
  priceSlotDeleteTarget: PriceSlotDraft | null
  setPriceSlotDeleteTarget: (slot: PriceSlotDraft | null) => void
  confirmRemovePriceSlot: () => void
  isDeleting: boolean
}) {
  const { t } = useSportCenterManagementTranslation()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">
          {t("createCenter.sectionTitles.configuredSlots", {
            defaultValue: "Configured Time Slots",
          })}
        </h3>
      </div>

      <div className="space-y-4">
        {priceSlots.map((slot, index) => (
          <div
            key={slot.id}
            className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-end"
          >
            <div className="flex items-center gap-2 sm:hidden">
              <Badge variant="secondary" className="font-mono text-xs">
                {t("createCenter.labels.slot", {
                  index: index + 1,
                  defaultValue: `Slot ${index + 1}`,
                })}
              </Badge>
            </div>

            <div className="grid flex-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor={`start-time-${slot.id}`}>
                  {t("createCenter.fields.startTime", {
                    defaultValue: "Start time",
                  })}
                </Label>
                <Input
                  id={`start-time-${slot.id}`}
                  type="time"
                  value={slot.startTime}
                  onChange={(e) =>
                    setPriceSlots((current) =>
                      current.map((item) =>
                        item.id === slot.id
                          ? { ...item, startTime: e.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`end-time-${slot.id}`}>
                  {t("createCenter.fields.endTime", {
                    defaultValue: "End time",
                  })}
                </Label>
                <Input
                  id={`end-time-${slot.id}`}
                  type="time"
                  value={slot.endTime}
                  onChange={(e) =>
                    setPriceSlots((current) =>
                      current.map((item) =>
                        item.id === slot.id
                          ? { ...item, endTime: e.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`price-${slot.id}`}>
                  {t("createCenter.fields.pricePerHour", {
                    defaultValue: "Price per hour",
                  })}
                </Label>
                <div className="relative">
                  <Input
                    id={`price-${slot.id}`}
                    type="text"
                    inputMode="numeric"
                    value={
                      slot.pricePerHour
                        ? Number(
                            slot.pricePerHour.toString().replace(/\D/g, "")
                          ).toLocaleString("vi-VN")
                        : ""
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, "")
                      setPriceSlots((current) =>
                        current.map((item) =>
                          item.id === slot.id
                            ? { ...item, pricePerHour: rawValue }
                            : item
                        )
                      )
                    }}
                    placeholder="80.000"
                    className="pr-12"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      VND
                    </span>
                  </div>
                </div>
                {(!slot.pricePerHour || Number(slot.pricePerHour) <= 0) && (
                  <p className="text-[11px] text-destructive">
                    {t("createCenter.validation.slotPriceRequired", {
                      defaultValue: "Please enter a price for this slot.",
                    })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <Badge
                variant="secondary"
                className="hidden font-mono text-xs sm:inline-flex"
              >
                {t("createCenter.labels.slot", {
                  index: index + 1,
                  defaultValue: `Slot ${index + 1}`,
                })}
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removePriceSlot(slot)}
                disabled={priceSlots.length === 1 || isDeleting}
                aria-label={t("common.delete")}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addPriceSlot}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 size-4" />
          {t("createCenter.actions.addSlot", {
            defaultValue: "Add price slot",
          })}
        </Button>
      </div>

      <AlertDialog
        open={Boolean(priceSlotDeleteTarget)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setPriceSlotDeleteTarget(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("createCenter.priceSlotDelete.title", {
                defaultValue: "Delete price slot?",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("createCenter.priceSlotDelete.description", {
                defaultValue:
                  "This action removes the selected price slot from this sport center.",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmRemovePriceSlot}
            >
              {isDeleting ? t("common.saving") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
