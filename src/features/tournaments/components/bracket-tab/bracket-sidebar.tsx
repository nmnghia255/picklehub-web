"use client"

import {
  Maximize2,
  RefreshCw,
  Shuffle,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentEvent } from "../../types/tournament-event"

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
}

export function BracketSidebar({
  events,
  selectedEventId,
  setSelectedEventId,
  currentEvent,
  totalMatches,
  completedMatches,
  inProgressMatches,
  remainingMatches,
  hasBrackets,
  handleGenerateBracket,
  handleDeleteBracket,
  isLoading,
  isPending,
  zoom,
  setZoom,
  resetView,
  viewMode,
  setViewMode,
  loadBrackets,
  tournamentId,
  isHost,
}: BracketSidebarProps) {
  const { t } = useTournamentTranslation()
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  return (
    <div className="flex h-full min-h-0 w-80 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Scrollable Upper Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <label
            htmlFor="event-select"
            className="mb-2 block text-xs font-semibold tracking-wider text-gray-500 uppercase"
          >
            {t("brackets.sidebar.selectEvent", {
              defaultValue: "Select Event",
            })}
          </label>
          <Select
            value={selectedEventId?.toString()}
            onValueChange={(val) => setSelectedEventId(Number(val))}
          >
            <SelectTrigger
              id="event-select"
              className="w-full border-gray-300 focus:ring-emerald-500"
            >
              <SelectValue
                placeholder={t("brackets.sidebar.selectEventPlaceholder", {
                  defaultValue: "Choose an event",
                })}
              />
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id.toString()}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-8">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            {currentEvent?.name || t("brackets.sidebar.title")}
          </h2>
          <p className="mb-2 text-sm text-gray-600">
            {t("brackets.sidebar.subtitle")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-700">
              {currentEvent?.type
                ? t(
                    `brackets.sidebar.badges.${currentEvent.type.toLowerCase()}`,
                    { defaultValue: currentEvent.type }
                  )
                : t("brackets.sidebar.badges.singles")}
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-700">
              {totalMatches > 0 && remainingMatches === 0
                ? t("brackets.sidebar.badges.completed", {
                    defaultValue: "Completed",
                  })
                : totalMatches > 0
                  ? t("brackets.sidebar.badges.inProgress")
                  : t("brackets.sidebar.badges.notStarted", {
                      defaultValue: "Not Generated",
                    })}
            </Badge>
          </div>
        </div>

        {isHost && selectedEventId && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              {t("brackets.sidebar.quickActions")}
            </h3>
            <div className="space-y-2">
              {!hasBrackets ? (
                <Button
                  onClick={handleGenerateBracket}
                  disabled={isLoading || isPending}
                  className="w-full justify-start bg-emerald-600 font-medium text-white hover:bg-emerald-700"
                >
                  <Shuffle className="mr-2 h-4 w-4" />
                  {t("brackets.sidebar.generateBracket")}
                </Button>
              ) : (
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isLoading || isPending}
                      className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("brackets.sidebar.deleteBracket", {
                        defaultValue: "Delete Bracket",
                      })}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("brackets.deleteConfirmTitle", {
                          defaultValue: "Delete Bracket",
                        })}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("brackets.deleteConfirm", {
                          defaultValue:
                            "Are you sure you want to delete this bracket? This cannot be undone.",
                        })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isLoading || isPending}>
                        {t("brackets.dialog.cancel", {
                          defaultValue: "Cancel",
                        })}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        disabled={isLoading || isPending}
                        onClick={async (e) => {
                          e.preventDefault()
                          await handleDeleteBracket()
                          setIsAlertOpen(false)
                        }}
                      >
                        {t("brackets.dialog.delete", {
                          defaultValue: "Delete",
                        })}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            {t("brackets.sidebar.viewControls")}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="flex-1"
              >
                <ZoomOut className="mr-1 h-4 w-4" />
                {t("brackets.sidebar.zoomOut")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="flex-1"
              >
                <ZoomIn className="mr-1 h-4 w-4" />
                {t("brackets.sidebar.zoomIn")}
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={resetView}
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              {t("brackets.sidebar.fitScreen", { zoom })}
            </Button>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger
                  size="sm"
                  className="flex-1 border-gray-300 bg-white text-sm font-medium text-black hover:bg-gray-50/50"
                >
                  <SelectValue
                    placeholder={t("brackets.toolbar.viewModes.standard")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    {t("brackets.toolbar.viewModes.standard")}
                  </SelectItem>
                  <SelectItem value="full">
                    {t("brackets.toolbar.viewModes.full")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedEventId) {
                    loadBrackets(tournamentId, selectedEventId)
                  }
                }}
                disabled={isLoading || !selectedEventId}
                className="h-8 w-8 shrink-0 border-gray-300 px-0 text-black hover:bg-gray-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Stats */}
      {hasBrackets && (
        <div className="sticky bottom-0 z-10 shrink-0 border-t bg-white p-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("brackets.sidebar.stats.total")}
              </span>
              <span className="font-semibold text-gray-900">
                {totalMatches}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("brackets.sidebar.stats.completed")}
              </span>
              <span className="font-semibold text-emerald-600">
                {completedMatches}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("brackets.sidebar.stats.inProgress")}
              </span>
              <span className="font-semibold text-yellow-600">
                {inProgressMatches}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("brackets.sidebar.stats.remaining")}
              </span>
              <span className="font-semibold text-gray-900">
                {remainingMatches}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
