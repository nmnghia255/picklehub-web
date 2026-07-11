"use client"

import {
  Lock,
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

interface HostBracketSidebarProps {
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
  loadBrackets: (tournamentId: number, eventId: number) => Promise<void>
  tournamentId: number
  hideEventSelect?: boolean
  isEditable: boolean
}

export function HostBracketSidebar({
  events,
  selectedEventId,
  setSelectedEventId,
  currentEvent,
  totalMatches,
  remainingMatches,
  hasBrackets,
  handleGenerateBracket,
  handleDeleteBracket,
  handleLockBracket,
  isLocked,
  isLoading,
  isPending,
  zoom,
  setZoom,
  resetView,
  loadBrackets,
  tournamentId,
  hideEventSelect = false,
  isEditable,
}: HostBracketSidebarProps) {
  const { t } = useTournamentTranslation()
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isLockAlertOpen, setIsLockAlertOpen] = useState(false)

  return (
    <div className="flex h-full min-h-0 w-80 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Scrollable Upper Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!hideEventSelect && (
          <div className="mb-6">
            <label
              htmlFor="event-select"
              className="mb-2 block text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-zinc-400"
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
                className="w-full border-gray-300 focus:ring-emerald-500 dark:text-zinc-100"
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
        )}

        <div className="mb-8">
          <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-zinc-100">
            {currentEvent?.name || t("brackets.sidebar.title")}
          </h2>
          <p className="mb-2 text-sm text-gray-600 dark:text-zinc-300">
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

        {selectedEventId && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-zinc-200">
              {t("brackets.sidebar.quickActions")}
            </h3>
            <div className="space-y-2">
              {!hasBrackets ? (
                <Button
                  onClick={handleGenerateBracket}
                  disabled={isLoading || isPending || !isEditable}
                  className="w-full justify-start bg-emerald-600 font-medium text-white hover:bg-emerald-700"
                >
                  <Shuffle className="mr-2 h-4 w-4" />
                  {t("brackets.sidebar.generateBracket")}
                </Button>
              ) : (
                <>
                  {isLocked ? (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm font-medium text-gray-600 dark:text-zinc-300">
                      <Lock className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{t("brackets.sidebar.lockedStatus")}</span>
                    </div>
                  ) : (
                    <AlertDialog
                      open={isLockAlertOpen}
                      onOpenChange={setIsLockAlertOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={isLoading || isPending}
                          className="w-full justify-start bg-emerald-600 font-medium text-white hover:bg-emerald-700"
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          {t("brackets.sidebar.lockBracket")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("brackets.lockConfirmTitle")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("brackets.lockConfirmDesc")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isLoading || isPending}>
                            {t("brackets.dialog.cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            disabled={isLoading || isPending}
                            onClick={async (e) => {
                              e.preventDefault()
                              await handleLockBracket()
                              setIsLockAlertOpen(false)
                            }}
                          >
                            {t("brackets.dialog.lock")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isLoading || isPending || isLocked}
                        className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("brackets.sidebar.deleteBracket")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("brackets.deleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("brackets.deleteConfirm")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading || isPending}>
                          {t("brackets.dialog.cancel")}
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
                          {t("brackets.dialog.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-zinc-200">
            {t("brackets.sidebar.viewControls")}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="flex-1 dark:text-zinc-100"
              >
                <ZoomOut className="mr-1 h-4 w-4" />
                {t("brackets.sidebar.zoomOut")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="flex-1 dark:text-zinc-100"
              >
                <ZoomIn className="mr-1 h-4 w-4" />
                {t("brackets.sidebar.zoomIn")}
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start dark:text-zinc-100"
              onClick={resetView}
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              {t("brackets.sidebar.fitScreen", { zoom })}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start dark:text-zinc-100"
              onClick={() => {
                if (selectedEventId) {
                  loadBrackets(tournamentId, selectedEventId)
                }
              }}
              disabled={isLoading || !selectedEventId}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {t("brackets.sidebar.refresh", { defaultValue: "Refresh" })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
