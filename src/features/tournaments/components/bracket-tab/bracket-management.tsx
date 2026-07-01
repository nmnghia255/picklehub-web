"use client"

import { useEffect } from "react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useBracketStore } from "../../stores/bracket-store"
import type { Bracket } from "../../types/bracket"
import type { TournamentStatus } from "../../types/tournament"
import type { TournamentEvent } from "../../types/tournament-event"
import type { RoundGroup } from "./bracket-canvas"
import { BracketCanvas } from "./bracket-canvas"
import { BracketSidebar } from "./bracket-sidebar"
import { MatchDetailsContent } from "./match-details"

interface BracketManagementProps {
  tournamentId: number
  events: TournamentEvent[]
  isHost: boolean
  tournamentStatus?: TournamentStatus
}

export function BracketManagement({
  tournamentId,
  events = [],
  isHost,
}: BracketManagementProps) {
  const { t } = useTournamentTranslation()

  const {
    selectedEventId,
    viewMode,
    selectedMatch,
    zoom,
    brackets,
    isLoading,
    isPending,
    searchQuery,
    isLocked,
    setSelectedEventId,
    setViewMode,
    setSelectedMatch,
    setZoom,
    resetView,
    loadBrackets,
    generateBracket,
    deleteBracket,
    lockBracket,
  } = useBracketStore()

  useEffect(() => {
    if (selectedEventId === null && events.length > 0) {
      setSelectedEventId(events[0].id)
    }
  }, [events, selectedEventId, setSelectedEventId])

  useEffect(() => {
    if (selectedEventId !== null) {
      loadBrackets(tournamentId, selectedEventId)
    }
  }, [selectedEventId, tournamentId, loadBrackets])

  const handleGenerateBracket = async () => {
    if (!selectedEventId) return
    const successMsg = t("brackets.generateSuccess", {
      defaultValue: "Bracket generated successfully!",
    })
    const errorMsg = t("brackets.generateError", {
      defaultValue: "Failed to generate bracket",
    })
    await generateBracket(tournamentId, selectedEventId, successMsg, errorMsg)
  }

  const handleDeleteBracket = async () => {
    if (!selectedEventId) return
    const successMsg = t("brackets.deleteSuccess", {
      defaultValue: "Bracket deleted successfully!",
    })
    const errorMsg = t("brackets.deleteError", {
      defaultValue: "Failed to delete bracket",
    })
    await deleteBracket(tournamentId, selectedEventId, successMsg, errorMsg)
  }

  const handleLockBracket = async () => {
    if (!selectedEventId) return
    const successMsg = t("brackets.lockSuccess", {
      defaultValue: "Bracket matchups locked successfully!",
    })
    const errorMsg = t("brackets.lockError", {
      defaultValue: "Failed to lock bracket matchups",
    })
    await lockBracket(tournamentId, selectedEventId, successMsg, errorMsg)
  }

  const currentEvent = events.find((e) => e.id === selectedEventId)
  const safeBrackets = Array.isArray(brackets) ? brackets : []

  // Filter brackets based on search query
  const filteredBrackets = safeBrackets.filter((match) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const name1 = match.team1?.name?.toLowerCase() || ""
    const name2 = match.team2?.name?.toLowerCase() || ""
    const roundName = match.round?.toLowerCase() || ""
    return name1.includes(q) || name2.includes(q) || roundName.includes(q)
  })

  // Group brackets by round
  const roundsMap: Record<string, Bracket[]> = {}
  filteredBrackets.forEach((match) => {
    const roundName = match.round || "Round"
    if (!roundsMap[roundName]) {
      roundsMap[roundName] = []
    }
    roundsMap[roundName].push(match)
  })

  // Sort matches within each round by bracketPosition
  Object.keys(roundsMap).forEach((roundName) => {
    roundsMap[roundName].sort((a, b) => a.bracketPosition - b.bracketPosition)
  })

  // Sort rounds by number of matches descending (largest round first)
  const sortedRounds = Object.keys(roundsMap).sort((a, b) => {
    return roundsMap[b].length - roundsMap[a].length
  })

  const leftRounds: RoundGroup[] = []
  const rightRounds: RoundGroup[] = []

  const finalRoundName = sortedRounds[sortedRounds.length - 1]
  const finalRound: RoundGroup | null = finalRoundName
    ? { roundName: finalRoundName, matches: roundsMap[finalRoundName] }
    : null

  // Process all rounds except the final round
  for (let index = 0; index < sortedRounds.length - 1; index++) {
    const roundName = sortedRounds[index]
    const matches = roundsMap[roundName]
    const half = Math.ceil(matches.length / 2)
    leftRounds.push({
      roundName,
      matches: matches.slice(0, half),
    })
    rightRounds.push({
      roundName,
      matches: matches.slice(half),
    })
  }

  // Calculated Stats
  const totalMatches = safeBrackets.length
  const completedMatches = safeBrackets.filter(
    (b) => b.status === "completed"
  ).length
  const inProgressMatches = safeBrackets.filter(
    (b) => b.status === "in_progress"
  ).length
  const remainingMatches = totalMatches - completedMatches

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden border-t border-gray-200">
      <BracketSidebar
        events={events}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        currentEvent={currentEvent}
        totalMatches={totalMatches}
        completedMatches={completedMatches}
        inProgressMatches={inProgressMatches}
        remainingMatches={remainingMatches}
        hasBrackets={safeBrackets.length > 0}
        handleGenerateBracket={handleGenerateBracket}
        handleDeleteBracket={handleDeleteBracket}
        handleLockBracket={handleLockBracket}
        isLocked={isLocked}
        isLoading={isLoading}
        isPending={isPending}
        zoom={zoom}
        setZoom={setZoom}
        resetView={resetView}
        viewMode={viewMode}
        setViewMode={setViewMode}
        loadBrackets={loadBrackets}
        tournamentId={tournamentId}
        isHost={isHost}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50/50">
        <BracketCanvas
          isLoading={isLoading}
          safeBrackets={safeBrackets}
          leftRounds={leftRounds}
          rightRounds={rightRounds}
          finalRound={finalRound}
          zoom={zoom}
          viewMode={viewMode}
          isHost={isHost}
          selectedEventId={selectedEventId}
          handleGenerateBracket={handleGenerateBracket}
          isPending={isPending}
          setSelectedMatch={setSelectedMatch}
        />
      </div>

      {/* Match Details Drawer */}
      <Sheet open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <SheetContent className="w-[500px] gap-0 overflow-y-auto px-6 py-2 sm:max-w-[500px]">
          <SheetHeader className="px-0">
            <SheetTitle className="text-xl font-bold">
              {t("brackets.match.details.title")}
            </SheetTitle>
          </SheetHeader>
          {selectedMatch && (
            <MatchDetailsContent
              match={selectedMatch}
              isHost={isHost}
              tournamentId={tournamentId}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
