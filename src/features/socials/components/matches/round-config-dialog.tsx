"use client"

import { CheckSquare, Play, Sparkles, Square } from "lucide-react"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Player, SuggestBatchDto } from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface RoundConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRoundNumber: number
  availableCourts?: Array<{ id: string; name: string }>
  initialPlayers?: Player[]
  onGenerate: (config: SuggestBatchDto) => Promise<void>
}

export function RoundConfigDialog({
  open,
  onOpenChange,
  currentRoundNumber,
  availableCourts = [],
  initialPlayers = [],
  onGenerate,
}: RoundConfigDialogProps) {
  const { t } = useSocialsTranslation()
  const [roundNumber, setRoundNumber] = useState(currentRoundNumber + 1)
  const [matchType, setMatchType] = useState<"DOUBLES" | "SINGLES">("DOUBLES")
  const [roundDurationMins, setRoundDurationMins] = useState(15)
  const [scheduledAt, setScheduledAt] = useState(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })
  const [selectedCourtIds, setSelectedCourtIds] = useState<string[]>([])
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<
    string[]
  >([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    let isMounted = true
    queueMicrotask(() => {
      if (!isMounted) return
      setRoundNumber(currentRoundNumber + 1)
      setSelectedCourtIds(availableCourts.map((c) => c.id))
      setSelectedParticipantIds(initialPlayers.map((p) => p.id))

      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      setScheduledAt(now.toISOString().slice(0, 16))
    })

    return () => {
      isMounted = false
    }
  }, [open, currentRoundNumber, availableCourts, initialPlayers])

  const toggleAllCourts = () => {
    if (selectedCourtIds.length === availableCourts.length) {
      setSelectedCourtIds([])
    } else {
      setSelectedCourtIds(availableCourts.map((c) => c.id))
    }
  }

  const toggleAllParticipants = () => {
    if (selectedParticipantIds.length === initialPlayers.length) {
      setSelectedParticipantIds([])
    } else {
      setSelectedParticipantIds(initialPlayers.map((p) => p.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedCourtIds.length === 0) {
      toast.error(t("matches.validation.noCourtsSelected"))
      return
    }

    if (selectedParticipantIds.length < 2) {
      toast.error(t("matches.validation.noParticipantsSelected"))
      return
    }

    setIsSubmitting(true)
    try {
      const scheduledIso = scheduledAt
        ? new Date(scheduledAt).toISOString()
        : new Date().toISOString()

      await onGenerate({
        courtIds: selectedCourtIds,
        matchType,
        roundDurationMins: Number(roundDurationMins) || 15,
        scheduledAt: scheduledIso,
        selectedParticipantIds,
      })
      onOpenChange(false)
    } catch {
      // Handled in parent
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              {t("matches.roundDialog.title", {
                round: roundNumber,
              })}
            </DialogTitle>
            <DialogDescription>
              {t("matches.roundDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Section 1: Court Checklist */}
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Label className="font-bold">
                  {t("matches.roundDialog.courtSelection")} (
                  {selectedCourtIds.length}/{availableCourts.length})
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllCourts}
                  className="h-7 text-xs text-primary"
                >
                  {selectedCourtIds.length === availableCourts.length
                    ? t("matches.roundDialog.deselectAll")
                    : t("matches.roundDialog.selectAllCourts")}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {availableCourts.length > 0 ? (
                  availableCourts.map((c) => (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedCourtIds.includes(c.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCourtIds((prev) => [...prev, c.id])
                          } else {
                            setSelectedCourtIds((prev) =>
                              prev.filter((id) => id !== c.id)
                            )
                          }
                        }}
                      />
                      <span className="truncate font-medium">{c.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="col-span-2 text-xs text-muted-foreground">
                    Chưa có sân thi đấu nào khả dụng.
                  </p>
                )}
              </div>
            </div>

            {/* Section 2: Participant Checklist */}
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Label className="font-bold">
                  {t("matches.roundDialog.participantSelection")} (
                  {selectedParticipantIds.length}/{initialPlayers.length})
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllParticipants}
                  className="h-7 text-xs text-primary"
                >
                  {selectedParticipantIds.length === initialPlayers.length
                    ? t("matches.roundDialog.deselectAll")
                    : t("matches.roundDialog.selectAllParticipants")}
                </Button>
              </div>

              <div className="max-h-40 space-y-1 overflow-y-auto pt-1">
                {initialPlayers.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-xs transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        checked={selectedParticipantIds.includes(p.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedParticipantIds((prev) => [...prev, p.id])
                          } else {
                            setSelectedParticipantIds((prev) =>
                              prev.filter((id) => id !== p.id)
                            )
                          }
                        }}
                      />
                      <Avatar className="size-6">
                        <AvatarImage src={p.avatarUrl || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {p.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>Rating: {p.skillLevel || "N/A"}</span>
                      {p.duprRating && (
                        <span className="rounded bg-sky-500/10 px-1 py-0.5 font-bold text-sky-600 dark:text-sky-400">
                          DUPR {p.duprRating}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 3: Match Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("matches.roundDialog.matchType")}</Label>
                <Select
                  value={matchType}
                  onValueChange={(val: "DOUBLES" | "SINGLES") =>
                    setMatchType(val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOUBLES">
                      {t("matches.roundDialog.doubles")}
                    </SelectItem>
                    <SelectItem value="SINGLES">
                      {t("matches.roundDialog.singles")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{t("matches.roundDialog.duration")}</Label>
                <Input
                  type="number"
                  min={5}
                  max={60}
                  value={roundDurationMins}
                  onChange={(e) => setRoundDurationMins(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t("matches.roundDialog.startTime")}</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              <Play className="size-4" />
              {isSubmitting
                ? t("common.loading")
                : t("matches.roundDialog.generateBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
