"use client"

import { Loader2 } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentCenter } from "../../types/tournament-center"

interface AssociateCenterDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  centers: TournamentCenter[]
  allSportCenters: SportCenter[]
  onAddCenter: (centerId: string) => Promise<void>
}

export function AssociateCenterDialog({
  isOpen,
  onOpenChange,
  centers,
  allSportCenters,
  onAddCenter,
}: AssociateCenterDialogProps) {
  const { t } = useTournamentTranslation()
  const [selectedCenterToAssociate, setSelectedCenterToAssociate] =
    useState<string>("")
  const [isAddingCenter, setIsAddingCenter] = useState(false)
  const [centerSearchQuery, setCenterSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const availableCenters = allSportCenters.filter(
    (sc) => !centers.some((c) => c.centerId === sc.id)
  )

  const filteredAvailableCenters = availableCenters.filter((sc) => {
    const q = centerSearchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      sc.name.toLowerCase().includes(q) ||
      (sc.address && sc.address.toLowerCase().includes(q))
    )
  })

  const handleAssociate = async () => {
    const selectedCenter = availableCenters.find(
      (c) => c.name === selectedCenterToAssociate
    )
    if (!selectedCenter) return
    setIsAddingCenter(true)
    try {
      await onAddCenter(selectedCenter.id)
      setSelectedCenterToAssociate("")
      onOpenChange(false)
      setCenterSearchQuery("")
    } finally {
      setIsAddingCenter(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          setCenterSearchQuery("")
        }
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{t("booking.dialog.associateTitle")}</DialogTitle>
          <DialogDescription>
            {t("booking.dialog.associateDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4" ref={containerRef}>
          <div className="space-y-1">
            <Label>{t("booking.form.center")}</Label>
            <Combobox
              value={selectedCenterToAssociate}
              onValueChange={(val) => {
                setSelectedCenterToAssociate(val || "")
              }}
              inputValue={centerSearchQuery}
              onInputValueChange={(val) => {
                setCenterSearchQuery(val || "")
              }}
            >
              <ComboboxInput
                placeholder={t("booking.form.selectCenterPlaceholder")}
                className="mt-1.5 w-full bg-white"
                showClear
              />
              <ComboboxContent container={containerRef}>
                <ComboboxList>
                  {filteredAvailableCenters.map((sc) => (
                    <ComboboxItem key={sc.id} value={sc.name}>
                      <div className="flex w-full flex-col py-0.5 text-left">
                        <span className="text-sm font-semibold text-gray-900">
                          {sc.name}
                        </span>
                        <span className="truncate text-xs text-gray-500">
                          {sc.address}
                        </span>
                      </div>
                    </ComboboxItem>
                  ))}
                  {filteredAvailableCenters.length === 0 && (
                    <ComboboxEmpty className="p-4 text-center text-xs text-gray-500">
                      {t("booking.form.noMatchesFound")}
                    </ComboboxEmpty>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setCenterSearchQuery("")
            }}
          >
            {t("booking.cancelBtn")}
          </Button>
          <Button
            onClick={handleAssociate}
            disabled={isAddingCenter || !selectedCenterToAssociate}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isAddingCenter ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("booking.associateBtn")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
