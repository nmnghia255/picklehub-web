"use client"

import { GripVertical, ListPlus, Loader2, Lock, Shuffle } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import {
  generateSeedsEventAction,
  getEventSeedingAction,
  lockSeedsEventAction,
  reorderSeedsAction,
} from "../../actions/seeding-actions"
import type { Seed } from "../../types/seeding"
import type { TournamentStatus } from "../../types/tournament"
import type { TournamentEvent } from "../../types/tournament-event"

function getTeamName(team: unknown): string {
  if (!team) return ""
  if (typeof team === "string") return team
  if (typeof team === "object") {
    const t = team as {
      player1?: { name?: string }
      player2?: { name?: string } | null
      name?: string
    }
    if (t.name) return t.name
    if (t.player1?.name) {
      return t.player2?.name
        ? `${t.player1.name} / ${t.player2.name}`
        : t.player1.name
    }
  }
  return String(team)
}

function getTeamId(seed: Seed): string | undefined {
  if (seed.teamId) return String(seed.teamId)
  const teamObj = seed.team as unknown
  if (teamObj && typeof teamObj === "object") {
    const t = teamObj as { id?: number | string }
    if (t.id) return String(t.id)
  }
  return undefined
}

interface SeedingProps {
  tournamentId: number
  tournamentStatus?: TournamentStatus
  events?: TournamentEvent[]
  isHost?: boolean
}

export function Seeding({
  tournamentId,
  tournamentStatus,
  events = [],
  isHost = false,
}: SeedingProps) {
  const { t } = useTournamentTranslation()
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    return events.length > 0 ? events[0].id.toString() : ""
  })
  const [seedsList, setSeedsList] = useState<Seed[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLocking, setIsLocking] = useState(false)

  // Safe setter for seedsList to prevent 'map is not a function' errors
  const safeSetSeedsList = useCallback((data: unknown) => {
    if (Array.isArray(data)) {
      setSeedsList(data)
      return
    }
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>
      if ("seeds" in obj && Array.isArray(obj.seeds)) {
        setSeedsList(obj.seeds)
        return
      }
      if ("seeding" in obj && Array.isArray(obj.seeding)) {
        setSeedsList(obj.seeding)
        return
      }
      if ("data" in obj && Array.isArray(obj.data)) {
        setSeedsList(obj.data)
        return
      }
      // Fallback: find first array property in the object
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) {
          setSeedsList(obj[key] as Seed[])
          return
        }
      }
    }
    setSeedsList([])
  }, [])

  // HTML5 Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const fetchSeeding = useCallback(
    async (eventId: number) => {
      setIsLoading(true)
      try {
        const res = await getEventSeedingAction(tournamentId, eventId)
        if (res.success && res.data) {
          safeSetSeedsList(res.data)
        } else {
          setSeedsList([])
        }
      } catch (err) {
        console.error("Failed to load seeding:", err)
        toast.error(
          t("seeding.errors.loadFailed", {
            defaultValue: "Failed to load seeding data",
          })
        )
        setSeedsList([])
      } finally {
        setIsLoading(false)
      }
    },
    [tournamentId, safeSetSeedsList, t]
  )

  useEffect(() => {
    if (selectedEventId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSeeding(Number(selectedEventId))
    } else {
      setSeedsList([])
    }
  }, [selectedEventId, fetchSeeding])

  const handleAutoSeed = async () => {
    if (!selectedEventId) return
    setIsGenerating(true)
    try {
      const res = await generateSeedsEventAction(
        tournamentId,
        Number(selectedEventId)
      )
      if (res.success) {
        await fetchSeeding(Number(selectedEventId))
        toast.success(
          t("seeding.autoSeedSuccess", {
            defaultValue: "Seeds generated successfully",
          })
        )
      } else {
        toast.error(res.error || "Failed to generate seeds")
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("seeding.errors.generateFailed", {
          defaultValue: "An error occurred while generating seeds",
        })
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLockSeeding = async () => {
    if (!selectedEventId) return
    setIsLocking(true)
    try {
      const res = await lockSeedsEventAction(
        tournamentId,
        Number(selectedEventId)
      )
      if (res.success && res.data) {
        safeSetSeedsList(res.data)
        toast.success(
          t("seeding.lockSuccess", {
            defaultValue: "Seeding locked successfully",
          })
        )
      } else {
        toast.error(res.error || "Failed to lock seeding")
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("seeding.errors.lockFailed", {
          defaultValue: "An error occurred while locking seeding",
        })
      )
    } finally {
      setIsLocking(false)
    }
  }

  // Handle Drag and Drop drop event
  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const updatedSeeds = [...seedsList]
    const [movedItem] = updatedSeeds.splice(draggedIndex, 1)
    updatedSeeds.splice(dropIndex, 0, movedItem)

    // Re-calculate seed indices (1-indexed)
    const reordered = updatedSeeds.map((item, idx) => ({
      ...item,
      seed: idx + 1,
    }))

    // Optimistic local UI update
    setSeedsList(reordered)
    setDraggedIndex(null)
    setDragOverIndex(null)

    const payload = {
      seeds: reordered.map((s) => ({
        teamId: getTeamId(s),
        seed: s.seed,
      })),
    }

    try {
      const res = await reorderSeedsAction(
        tournamentId,
        Number(selectedEventId),
        payload
      )
      if (res.success && res.data) {
        safeSetSeedsList(res.data)
        toast.success(
          t("seeding.reorderSuccess", {
            defaultValue: "Seeding order saved successfully",
          })
        )
      } else {
        toast.error(res.error || "Failed to save reordered seeds")
        // Revert to server state
        fetchSeeding(Number(selectedEventId))
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("seeding.errors.reorderFailed", {
          defaultValue: "Failed to reorder seeds",
        })
      )
      fetchSeeding(Number(selectedEventId))
    }
  }

  const isLocked =
    seedsList.length > 0 && seedsList.some((s) => s.status === "locked")
  isHost = true
  const isEditable = tournamentStatus === "closed_registration"
  // const isEditable = tournamentStatus === "closed_registration" && isHost

  const selectedEvent = events.find((e) => e.id.toString() === selectedEventId)

  if (events.length === 0) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-semibold text-gray-900">
              {t("seeding.title")}
            </h1>
            <p className="text-gray-600">{t("seeding.subtitle")}</p>
          </div>
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4">
              <Shuffle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-950">
              {t("seeding.noEventsCreatedYet")}
            </h3>
            <p className="max-w-md text-sm text-gray-600">
              {t("seeding.noEventsDescription")}
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-semibold text-gray-900">
                {t("seeding.title")}
              </h1>
              <p className="text-gray-600">{t("seeding.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              <>
                <Button
                  variant="outline"
                  onClick={handleAutoSeed}
                  disabled={
                    isGenerating || isLocked || !selectedEventId || !isEditable
                  }
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Shuffle className="mr-2 h-4 w-4" />
                  )}
                  {t("seeding.autoSeed")}
                </Button>
                <Button
                  onClick={handleLockSeeding}
                  disabled={
                    isLocking ||
                    isLocked ||
                    !selectedEventId ||
                    seedsList.length === 0 ||
                    !isEditable
                  }
                  className={cn(
                    isLocked
                      ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-500"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {isLocking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  {isLocked
                    ? t("seeding.table.locked")
                    : t("seeding.lockSeeding")}
                </Button>
              </>
            </div>
          </div>

          {/* Event Dropdown Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              {t("seeding.selectEvent")}
            </label>
            <div className="w-full sm:w-[280px]">
              <Select
                value={selectedEventId}
                onValueChange={(val) => setSelectedEventId(val)}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder={t("seeding.chooseEvent")} />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.name} ({event.skillRange})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Status Validation Warning Banner */}
        {isHost && !isEditable && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <Lock className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h4 className="text-sm font-semibold text-amber-950">
                {t("seeding.statusNoticeTitle")}
              </h4>
              <p className="mt-1 text-sm text-amber-900">
                {t("seeding.statusNoticeDescription", {
                  status: t(`list.statuses.${tournamentStatus}`, {
                    defaultValue: tournamentStatus,
                  }),
                })}
              </p>
            </div>
          </div>
        )}

        {/* Seeding Table Card */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
            <CardTitle className="text-lg font-medium text-gray-900">
              {selectedEvent
                ? t("seeding.eventSeeding", { eventName: selectedEvent.name })
                : t("seeding.table.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm">{t("seeding.loadingSeeds")}</p>
              </div>
            ) : seedsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 rounded-full bg-gray-50 p-4">
                  <ListPlus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-gray-900">
                  {t("seeding.emptyState.title")}
                </h3>
                <p className="mb-6 max-w-sm text-sm text-gray-500">
                  {t("seeding.emptyState.description")}
                </p>
                {isHost && (
                  <Button
                    onClick={handleAutoSeed}
                    disabled={isGenerating || !isEditable}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Shuffle className="mr-2 h-4 w-4" />
                    )}
                    {t("seeding.emptyState.button")}
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/30">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="w-[10%] min-w-[80px]">
                        {t("seeding.table.seed")}
                      </TableHead>
                      <TableHead className="w-[45%] min-w-[200px]">
                        {t("seeding.table.team")}
                      </TableHead>
                      <TableHead className="w-[15%] min-w-[100px]">
                        {t("seeding.table.rating")}
                      </TableHead>
                      <TableHead className="w-[15%] min-w-[100px]">
                        {t("seeding.table.record")}
                      </TableHead>
                      <TableHead className="w-[15%] min-w-[120px]">
                        {t("seeding.table.status")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seedsList.map((seed, index) => {
                      const isDraggingThis = draggedIndex === index
                      const isDragOverThis = dragOverIndex === index

                      return (
                        <TableRow
                          key={getTeamId(seed) || `seed-${seed.seed}-${index}`}
                          draggable={isHost && !isLocked && isEditable}
                          onDragStart={(e) => {
                            if (!isHost || isLocked || !isEditable) return
                            setDraggedIndex(index)
                            e.dataTransfer.effectAllowed = "move"
                            e.dataTransfer.setData(
                              "text/plain",
                              index.toString()
                            )
                          }}
                          onDragOver={(e) => {
                            if (!isHost || isLocked || !isEditable) return
                            e.preventDefault()
                            if (dragOverIndex !== index) {
                              setDragOverIndex(index)
                            }
                          }}
                          onDragEnd={() => {
                            setDraggedIndex(null)
                            setDragOverIndex(null)
                          }}
                          onDrop={() => {
                            if (!isHost || isLocked || !isEditable) return
                            handleDrop(index)
                          }}
                          className={cn(
                            "transition-all duration-150 select-none",
                            isDraggingThis && "bg-gray-100 opacity-40",
                            isDragOverThis &&
                              draggedIndex !== index &&
                              "border-t-2 border-emerald-500 bg-emerald-50",
                            isHost &&
                              !isLocked &&
                              isEditable &&
                              "cursor-grab hover:bg-gray-50/80 active:cursor-grabbing"
                          )}
                        >
                          <TableCell className="text-center align-middle">
                            {isHost && !isLocked && isEditable ? (
                              <GripVertical className="h-4 w-4 cursor-grab text-gray-400 active:cursor-grabbing" />
                            ) : (
                              <div className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                                isLocked
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-emerald-50 text-emerald-600"
                              )}
                            >
                              #{seed.seed}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {getTeamName(seed.team)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-semibold">
                              {seed.rating}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {seed.wins}W - {seed.losses}L
                          </TableCell>
                          <TableCell>
                            {seed.status === "locked" ? (
                              <Badge className="border-none bg-gray-100 text-gray-700">
                                <Lock className="mr-1 h-3 w-3" />
                                {t("seeding.table.locked")}
                              </Badge>
                            ) : (
                              <Badge className="border-none bg-blue-50 text-blue-700">
                                {t("seeding.table.unlocked")}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {t("seeding.instructions.title")}
              </p>
              <ul className="ml-2 list-inside list-disc space-y-1">
                <li>{t("seeding.instructions.item1")}</li>
                <li>{t("seeding.instructions.item2")}</li>
                <li>{t("seeding.instructions.item3")}</li>
                <li>{t("seeding.instructions.item4")}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
