"use client"

import { Building, CalendarDays, Loader2, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentCenter } from "../../types/tournament-center"
import type { TournamentEvent } from "../../types/tournament-event"

interface AssociatedVenuesProps {
  tournamentId: number
  centers: TournamentCenter[]
  events: TournamentEvent[]
  allSportCenters: SportCenter[]
  onAddCenter: (centerId: string) => Promise<void>
  onRemoveCenter: (centerId: string) => Promise<void>
  onOpenCenterDialog: () => Promise<void>
  isCenterDialogOpen: boolean
  setIsCenterDialogOpen: (open: boolean) => void
}

export function AssociatedVenues({
  tournamentId,
  centers,
  events,
  allSportCenters,
  onAddCenter,
  onRemoveCenter,
  onOpenCenterDialog,
  isCenterDialogOpen,
  setIsCenterDialogOpen,
}: AssociatedVenuesProps) {
  const { t } = useTournamentTranslation()
  const router = useRouter()
  const [selectedCenterToAssociate, setSelectedCenterToAssociate] =
    useState<string>("")
  const [isAddingCenter, setIsAddingCenter] = useState(false)
  const [associatedSearchQuery, setAssociatedSearchQuery] = useState("")
  const [centerSearchQuery, setCenterSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const eventContainerRef = useRef<HTMLDivElement>(null)

  // Event selection dialog state
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [pendingCenterId, setPendingCenterId] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [eventSearchQuery, setEventSearchQuery] = useState("")

  // Filter already linked/associated centers in the main card list
  const filteredAssociatedCenters = centers.filter((center) => {
    const q = associatedSearchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      center.name.toLowerCase().includes(q) ||
      (center.address && center.address.toLowerCase().includes(q))
    )
  })

  // Available centers in the system that are not linked yet
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

  const filteredEvents = events.filter((ev) => {
    const q = eventSearchQuery.toLowerCase().trim()
    if (!q) return true
    return ev.name.toLowerCase().includes(q)
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
      setIsCenterDialogOpen(false)
      setCenterSearchQuery("")
    } finally {
      setIsAddingCenter(false)
    }
  }

  function handleBookClick(centerId: string) {
    setPendingCenterId(centerId)
    setSelectedEventId("")
    setEventSearchQuery("")
    setIsEventDialogOpen(true)
  }

  function handleConfirmEventSelection() {
    if (!pendingCenterId || !selectedEventId) return
    setIsEventDialogOpen(false)
    router.push(
      `/tournament-management/${tournamentId}/booking/${pendingCenterId}?eventId=${selectedEventId}`
    )
  }

  const selectedEventLabel =
    events.find((e) => String(e.id) === selectedEventId)?.name ?? ""

  return (
    <Card className="h-fit gap-0 border-gray-200 pb-2 shadow-sm lg:col-span-1">
      <CardHeader className="border-b bg-gray-50/50 pb-0">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2">
            <CardTitle className="text-base font-bold text-gray-800">
              {t("booking.venuesCard.title")}
            </CardTitle>
            <CardDescription className="text-sm">
              {t("booking.venuesCard.description")}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCenterSearchQuery("")
              onOpenCenterDialog()
            }}
            className="h-8 border-emerald-600 px-2.5 text-xs text-emerald-700 hover:bg-emerald-50"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            {t("booking.addBtn")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {centers.length > 0 && (
          <div className="mb-4">
            <Input
              placeholder={t("booking.venuesCard.searchPlaceholder")}
              value={associatedSearchQuery}
              onChange={(e) => setAssociatedSearchQuery(e.target.value)}
              className="h-9 bg-white"
            />
          </div>
        )}

        {centers.length === 0 ? (
          <div className="rounded-md bg-gray-50/30 py-8 text-center text-sm text-gray-500">
            <Building className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            {t("booking.venuesCard.noVenues")}
          </div>
        ) : filteredAssociatedCenters.length === 0 ? (
          <div className="rounded-md bg-gray-50/30 py-8 text-center text-sm text-gray-500">
            {t("booking.venuesCard.noMatches")}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAssociatedCenters.map((center) => (
              <div
                key={center.centerId}
                className="flex items-center justify-between gap-4 rounded-lg border bg-white p-3 shadow-xs"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {center.name}
                  </div>
                  <div className="truncate text-xs text-gray-500">
                    {center.address}
                  </div>
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                    {t("booking.venuesCard.courtsCount", {
                      count: center.courts.length,
                    })}
                  </Badge>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookClick(center.centerId)}
                    className="h-8 border-emerald-600 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    {t("booking.venuesCard.bookBtn")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCenter(center.centerId)}
                    className="h-8 w-8 shrink-0 rounded-full p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Associate Center Dialog */}
      <Dialog
        open={isCenterDialogOpen}
        onOpenChange={(open) => {
          setIsCenterDialogOpen(open)
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
                setIsCenterDialogOpen(false)
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

      {/* Event Selection Dialog */}
      <Dialog
        open={isEventDialogOpen}
        onOpenChange={(open) => {
          setIsEventDialogOpen(open)
          if (!open) {
            setPendingCenterId(null)
            setSelectedEventId("")
            setEventSearchQuery("")
          }
        }}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
              {t("booking.eventDialog.title", {
                defaultValue: "Select Event to Book Courts For",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("booking.eventDialog.description", {
                defaultValue:
                  "Choose the tournament event you are booking courts for. The booking page will show the minimum courts required based on the event participants.",
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2" ref={eventContainerRef}>
            <div className="space-y-1">
              <Label>
                {t("booking.eventDialog.eventLabel", {
                  defaultValue: "Tournament Event",
                })}
              </Label>
              <Combobox
                value={selectedEventLabel}
                onValueChange={(val) => {
                  const found = events.find((e) => e.name === val)
                  setSelectedEventId(found ? String(found.id) : "")
                }}
                inputValue={eventSearchQuery}
                onInputValueChange={(val) => {
                  setEventSearchQuery(val || "")
                }}
              >
                <ComboboxInput
                  placeholder={t("booking.eventDialog.selectPlaceholder", {
                    defaultValue: "Search and select an event...",
                  })}
                  className="mt-1.5 w-full bg-white"
                  showClear
                />
                <ComboboxContent container={eventContainerRef}>
                  <ComboboxList>
                    {filteredEvents.length === 0 ? (
                      <ComboboxEmpty className="p-4 text-center text-xs text-gray-500">
                        {events.length === 0
                          ? t("booking.eventDialog.noEvents", {
                              defaultValue:
                                "No events found for this tournament.",
                            })
                          : t("booking.form.noMatchesFound")}
                      </ComboboxEmpty>
                    ) : (
                      filteredEvents.map((ev) => {
                        const isDouble =
                          ev.type?.toLowerCase() === "doubles" ||
                          ev.type?.toLowerCase() === "double"
                        const participantCount = ev.participants ?? 0
                        const totalMatches = Math.max(0, participantCount - 1)
                        return (
                          <ComboboxItem key={ev.id} value={ev.name}>
                            <div className="flex w-full flex-col gap-0.5 py-0.5 text-left">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-gray-900">
                                  {ev.name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="px-1.5 py-0 text-[9px] font-bold"
                                >
                                  {ev.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>
                                  {isDouble
                                    ? `${participantCount} teams`
                                    : `${participantCount} players`}
                                </span>
                                <span className="font-medium text-emerald-600">
                                  ~{totalMatches}{" "}
                                  {t("booking.eventDialog.matchesLabel", {
                                    defaultValue: "matches",
                                  })}
                                </span>
                              </div>
                            </div>
                          </ComboboxItem>
                        )
                      })
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {selectedEventId && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-800">
                {(() => {
                  const ev = events.find(
                    (e) => String(e.id) === selectedEventId
                  )
                  const participantCount = ev?.participants ?? 0
                  const totalMatches = Math.max(0, participantCount - 1)
                  return (
                    <span>
                      {t("booking.eventDialog.requirementHint", {
                        defaultValue: `You will need to book at least ${totalMatches} court slot(s) to cover all matches in this event.`,
                        count: totalMatches,
                      })}
                    </span>
                  )
                })()}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEventDialogOpen(false)}
            >
              {t("booking.cancelBtn")}
            </Button>
            <Button
              onClick={handleConfirmEventSelection}
              disabled={!selectedEventId}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {t("booking.eventDialog.confirmBtn", {
                defaultValue: "Continue to Booking",
              })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
