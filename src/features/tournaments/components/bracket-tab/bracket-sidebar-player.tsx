"use client"

import { Maximize2, RefreshCw, ZoomIn, ZoomOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface PlayerBracketSidebarProps {
  selectedEventId: number | null
  isLoading: boolean
  zoom: number
  setZoom: (zoom: number) => void
  resetView: () => void
  loadBrackets: (tournamentId: number, eventId: number) => Promise<void>
  tournamentId: number
}

export function PlayerBracketSidebar({
  selectedEventId,
  isLoading,
  zoom,
  setZoom,
  resetView,
  loadBrackets,
  tournamentId,
}: PlayerBracketSidebarProps) {
  const { t } = useTournamentTranslation()

  return (
    <div className="flex h-full min-h-0 w-16 shrink-0 flex-col bg-transparent">
      {/* Scrollable Upper Content */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className="h-10 w-10 p-0 dark:text-zinc-100"
            title={t("brackets.sidebar.zoomIn")}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="h-10 w-10 p-0 dark:text-zinc-100"
            title={t("brackets.sidebar.zoomOut")}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetView}
            className="h-10 w-10 p-0 dark:text-zinc-100"
            title={t("brackets.sidebar.fitScreen", { zoom })}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (selectedEventId) {
                loadBrackets(tournamentId, selectedEventId)
              }
            }}
            disabled={isLoading || !selectedEventId}
            className="h-10 w-10 p-0 dark:text-zinc-100"
            title={t("brackets.sidebar.refresh", { defaultValue: "Refresh" })}
          >
            <RefreshCw
              className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>
    </div>
  )
}
