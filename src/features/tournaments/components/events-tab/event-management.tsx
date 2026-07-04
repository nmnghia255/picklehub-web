"use client"

import { Plus, Trophy } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import { getTeamEventsAction } from "../../actions/team-actions"
import {
  awardPrizeToTeamAction,
  deleteTournamentEventAction,
  saveEventPrizesAction,
} from "../../actions/tournament-event-actions"
import type { Team } from "../../types/player"
import type { TournamentPrize, TournamentPrizeRequest } from "../../types/prize"
import type { Tournament } from "../../types/tournament"
import type { TournamentEvent } from "../../types/tournament-event"
import { EventForm } from "./event-form"
import { EventPrizeDialog } from "./event-prize-dialog"
import { EventPrizes } from "./event-prizes"
import { EventTable } from "./event-table"

export function EventManagement({
  tournament,
  events,
  prizes,
  isHost,
}: {
  tournament: Tournament
  events: TournamentEvent[]
  prizes: TournamentPrize[]
  isHost: boolean
}) {
  const { t } = useTournamentTranslation()
  const params = useParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const tournamentId = params.tournamentId as string

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TournamentEvent | null>(null)

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [isPrizeDialogOpen, setIsPrizeDialogOpen] = useState(false)

  const [eventTeams, setEventTeams] = useState<Team[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [isAwardingPrize, setIsAwardingPrize] = useState<number | null>(null)

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null
  const selectedEventPrizes = selectedEventId
    ? prizes.filter((p) => Number(p.eventId) === selectedEventId)
    : []

  useEffect(() => {
    let active = true

    Promise.resolve().then(async () => {
      if (!selectedEventId) {
        if (active) setEventTeams([])
        return
      }

      if (active) setIsLoadingTeams(true)
      try {
        const res = await getTeamEventsAction(
          String(selectedEventId),
          tournamentId
        )
        if (active) {
          if (res.success && res.data) {
            setEventTeams(res.data)
          } else {
            setEventTeams([])
          }
        }
      } catch (error) {
        console.error("Error fetching teams:", error)
        if (active) setEventTeams([])
      } finally {
        if (active) setIsLoadingTeams(false)
      }
    })

    return () => {
      active = false
    }
  }, [selectedEventId, tournamentId])

  const handleAwardPrize = async (prizeId: number, teamIdStr: string) => {
    setIsAwardingPrize(prizeId)
    const teamId = teamIdStr === "" ? null : teamIdStr

    try {
      const res = await awardPrizeToTeamAction(
        tournamentId,
        String(prizeId),
        teamId
      )
      if (res.success) {
        toast.success(
          t("events.award.success", {
            defaultValue: "Prize awarded successfully!",
          })
        )
        startTransition(() => {
          router.refresh()
        })
      } else {
        toast.error(
          res.error ||
            t("events.award.error", { defaultValue: "Failed to award prize" })
        )
      }
    } catch (error) {
      console.error("Error awarding prize:", error)
      toast.error(
        t("events.award.error", { defaultValue: "Failed to award prize" })
      )
    } finally {
      setIsAwardingPrize(null)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (
      !confirm(
        t("events.dialog.deleteConfirm", {
          defaultValue: "Are you sure you want to delete this event?",
        })
      )
    ) {
      return
    }

    try {
      const res = await deleteTournamentEventAction(tournamentId, eventId)
      if (res.success) {
        toast.success(
          t("events.deleteSuccess", {
            defaultValue: "Event deleted successfully",
          })
        )
        if (Number(eventId) === selectedEventId) {
          setSelectedEventId(null)
        }
        startTransition(() => {
          router.refresh()
        })
      } else {
        toast.error(
          res.error ||
            t("events.deleteError", { defaultValue: "Failed to delete event" })
        )
      }
    } catch (error) {
      console.error("Failed to delete event:", error)
      toast.error(
        t("events.deleteError", { defaultValue: "Failed to delete event" })
      )
    }
  }

  const handleEditClick = (event: TournamentEvent) => {
    setEditingEvent(event)
    setIsDialogOpen(true)
  }

  const handleSavePrizes = async (
    newPrizes: Omit<TournamentPrizeRequest, "eventId">[]
  ) => {
    if (!selectedEventId) return

    try {
      const res = await saveEventPrizesAction(
        tournamentId,
        selectedEventId,
        newPrizes
      )
      if (res.success) {
        toast.success(
          t("events.prizes.saveSuccess", {
            defaultValue: "Placement prizes saved successfully",
          })
        )
        setIsPrizeDialogOpen(false)
        startTransition(() => {
          router.refresh()
        })
      } else {
        toast.error(
          res.error ||
            t("events.prizes.saveError", {
              defaultValue: "Failed to save placement prizes",
            })
        )
      }
    } catch (error) {
      console.error("Failed to save event prizes:", error)
      toast.error(
        t("events.prizes.saveError", {
          defaultValue: "Failed to save placement prizes",
        })
      )
    }
  }

  const canManageEvents = isHost && tournament?.status === "draft"

  return (
    <div className="space-y-8 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-semibold text-gray-900">
                {t("events.title")}
              </h1>
              <p className="text-gray-600">{t("events.subtitle")}</p>
            </div>
            {canManageEvents && (
              <Button
                onClick={() => {
                  setEditingEvent(null)
                  setIsDialogOpen(true)
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("events.createEvent")}
              </Button>
            )}
          </div>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("events.table.title", { count: events.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventTable
              events={events}
              canManageEvents={canManageEvents}
              isPending={isPending}
              selectedEventId={selectedEventId}
              onRowClick={setSelectedEventId}
              onEditClick={handleEditClick}
              onDeleteClick={handleDelete}
            />
          </CardContent>
        </Card>

        {/* Prizes Section (Always Displayed) */}
        <EventPrizes
          selectedEvent={selectedEvent}
          selectedEventPrizes={selectedEventPrizes}
          canManageEvents={canManageEvents}
          onConfigurePrizesClick={() => setIsPrizeDialogOpen(true)}
        />

        {/* Award Prizes Section (Host only) */}
        {isHost && selectedEvent && selectedEventPrizes.length > 0 && (
          <Card className="border border-amber-200 bg-amber-50/10 dark:bg-zinc-800/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Trophy className="h-5 w-5 text-amber-500" />
                {t("events.award.title", {
                  defaultValue: "Award Prizes to Winners",
                })}
              </CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                {t("events.award.subtitle", {
                  defaultValue:
                    "Select the winning team for each configured reward.",
                })}
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingTeams ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  {t("events.award.loadingTeams", {
                    defaultValue: "Loading event teams...",
                  })}
                </div>
              ) : eventTeams.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-white py-6 text-center text-sm text-gray-400 dark:bg-zinc-900">
                  {t("events.award.noTeams", {
                    defaultValue: "No teams registered in this event yet.",
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {selectedEventPrizes.map((prize) => {
                    return (
                      <div
                        key={prize.id}
                        className="flex flex-col justify-between gap-4 rounded-lg border bg-white p-4 shadow-xs md:flex-row md:items-center dark:bg-zinc-900"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-gray-900 dark:text-zinc-100">
                            {prize.name}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {prize.rewardType === "cash"
                              ? `${t("events.dialog.rewardTypes.cash", { defaultValue: "Cash" })}: ${formatCurrencyVnd(prize.value)}`
                              : `${t("events.dialog.rewardTypes.physical", { defaultValue: "Trophy / Physical" })}`}
                          </span>
                          {prize.description && (
                            <span className="block truncate text-xs text-gray-400 italic">
                              {prize.description}
                            </span>
                          )}
                        </div>

                        <div className="w-full shrink-0 md:w-64">
                          <select
                            value={prize.winnerTeamId || ""}
                            onChange={(e) =>
                              handleAwardPrize(prize.id, e.target.value)
                            }
                            disabled={isAwardingPrize === prize.id}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                          >
                            <option value="">
                              --{" "}
                              {t("events.award.selectTeam", {
                                defaultValue: "Select Winner Team",
                              })}{" "}
                              --
                            </option>
                            {eventTeams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.player1.name}
                                {team.player2 ? ` & ${team.player2.name}` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialog for Create/Edit Event */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingEvent(null)
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEvent
                  ? t("events.dialog.editTitle", {
                      defaultValue: "Edit Event",
                    })
                  : t("events.dialog.title")}
              </DialogTitle>
              <DialogDescription>
                {editingEvent
                  ? t("events.dialog.editDescription", {
                      defaultValue:
                        "Edit the details of this tournament event.",
                    })
                  : t("events.dialog.description")}
              </DialogDescription>
            </DialogHeader>
            <EventForm
              tournamentId={tournamentId}
              editingEvent={editingEvent}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog for Configure Event Prizes */}
        {selectedEvent && isPrizeDialogOpen && (
          <EventPrizeDialog
            eventName={selectedEvent.name}
            eventId={selectedEvent.id}
            capacity={selectedEvent.capacity}
            initialPrizes={prizes}
            isOpen={isPrizeDialogOpen}
            onOpenChange={setIsPrizeDialogOpen}
            onSave={handleSavePrizes}
          />
        )}
      </div>
    </div>
  )
}
