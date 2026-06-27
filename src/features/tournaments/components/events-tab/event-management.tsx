"use client"

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useTransition } from "react"
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

import {
  deleteTournamentEventAction,
  saveEventPrizesAction,
} from "../../actions/tournament-event-actions"
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

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null
  const selectedEventPrizes = selectedEventId
    ? prizes.filter((p) => Number(p.eventId) === selectedEventId)
    : []

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
