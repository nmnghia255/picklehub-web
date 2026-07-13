import { GripVertical, ListPlus, Loader2, Lock, Shuffle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

import type { Seed } from "../../types/seeding"
import type { TournamentEvent } from "../../types/tournament-event"
import { useSeedingStore } from "./use-seeding-store"

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

interface SeedingTableProps {
  selectedEvent?: TournamentEvent
  canManageSeeding: boolean
  isLocked: boolean
}

export function SeedingTable({
  selectedEvent,
  canManageSeeding,
  isLocked,
}: SeedingTableProps) {
  const { t } = useTournamentTranslation()

  const seedsList = useSeedingStore((s) => s.seedsList)
  const isLoading = useSeedingStore((s) => s.isLoading)
  const isGenerating = useSeedingStore((s) => s.isGenerating)
  const draggedIndex = useSeedingStore((s) => s.draggedIndex)
  const dragOverIndex = useSeedingStore((s) => s.dragOverIndex)

  const setDraggedIndex = useSeedingStore((s) => s.setDraggedIndex)
  const setDragOverIndex = useSeedingStore((s) => s.setDragOverIndex)
  const handleAutoSeed = useSeedingStore((s) => s.handleAutoSeed)
  const handleDrop = useSeedingStore((s) => s.handleDrop)

  return (
    <Card className="gap-0 overflow-hidden pb-0">
      <CardHeader className="border-b border-gray-100 py-4">
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
            {canManageSeeding && (
              <Button
                onClick={() => handleAutoSeed(t)}
                disabled={isGenerating}
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
                      draggable={canManageSeeding && !isLocked}
                      onDragStart={(e) => {
                        if (!canManageSeeding || isLocked) return
                        setDraggedIndex(index)
                        e.dataTransfer.effectAllowed = "move"
                        e.dataTransfer.setData("text/plain", index.toString())
                      }}
                      onDragOver={(e) => {
                        if (!canManageSeeding || isLocked) return
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
                        if (!canManageSeeding || isLocked) return
                        handleDrop(index, t)
                      }}
                      className={cn(
                        "transition-all duration-150 select-none",
                        isDraggingThis && "bg-gray-100 opacity-40",
                        isDragOverThis &&
                          draggedIndex !== index &&
                          "border-t-2 border-emerald-500 bg-emerald-50",
                        canManageSeeding &&
                          !isLocked &&
                          "cursor-grab hover:bg-gray-50/80 active:cursor-grabbing"
                      )}
                    >
                      <TableCell className="text-center align-middle">
                        {canManageSeeding && !isLocked ? (
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
  )
}
