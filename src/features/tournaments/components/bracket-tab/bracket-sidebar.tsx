"use client"

import type { TournamentEvent } from "../../types/tournament-event"
import { HostBracketSidebar } from "./bracket-sidebar-host"
import { PlayerBracketSidebar } from "./bracket-sidebar-player"

interface BracketSidebarProps {
  events: TournamentEvent[]
  selectedEventId: number | null
  setSelectedEventId: (id: number | null) => void
  currentEvent: TournamentEvent | undefined
  totalMatches: number
  completedMatches: number
  inProgressMatches: number
  remainingMatches: number
  hasBrackets: boolean
  handleGenerateBracket: () => Promise<void>
  handleDeleteBracket: () => Promise<void>
  handleLockBracket: () => Promise<void>
  isLocked: boolean
  isLoading: boolean
  isPending: boolean
  zoom: number
  setZoom: (zoom: number) => void
  resetView: () => void
  viewMode: string
  setViewMode: (mode: string) => void
  loadBrackets: (tournamentId: number, eventId: number) => Promise<void>
  tournamentId: number
  isHost: boolean
  hideEventSelect?: boolean
}

export function BracketSidebar(props: BracketSidebarProps) {
  if (props.isHost) {
    return <HostBracketSidebar {...props} />
  }
  return (
    <PlayerBracketSidebar
      selectedEventId={props.selectedEventId}
      isLoading={props.isLoading}
      zoom={props.zoom}
      setZoom={props.setZoom}
      resetView={props.resetView}
      loadBrackets={props.loadBrackets}
      tournamentId={props.tournamentId}
    />
  )
}
