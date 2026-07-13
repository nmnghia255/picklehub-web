"use client"

import { Loader2, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { confirmMatchResultAction } from "@/features/socials/actions/suggested-matches"
import type { PlaySessionCardMatch } from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface MatchResultDialogProps {
  match: PlaySessionCardMatch
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (result: {
    winner: string
    scoreA: number
    scoreB: number
    sets: number[][]
  }) => void
}

export function MatchResultDialog({
  match,
  open,
  onOpenChange,
  onSuccess,
}: MatchResultDialogProps) {
  const { t } = useSocialsTranslation()
  const [isPending, setIsPending] = useState(false)

  // Get formatted team display names
  const getTeamName = (team: typeof match.team1) => {
    const names = [team.player1?.name, team.player2?.name].filter(Boolean)
    return names.length > 0 ? names.join(" & ") : t("common.unknownTeam")
  }

  const teamAName = getTeamName(match.team1)
  const teamBName = getTeamName(match.team2)

  // Getter helpers for initial state (avoiding useEffect to reset state)
  const getInitialSets = (): Array<[number, number]> => {
    if (match.sets && match.sets.length > 0) {
      return match.sets.map((set) => [set[0], set[1]] as [number, number])
    }
    if (match.score) {
      return [
        [match.score.team1Score, match.score.team2Score] as [number, number],
      ]
    }
    return [[0, 0] as [number, number]]
  }

  const getInitialAutoCalculate = (): boolean => {
    if (match.sets && match.sets.length > 0) {
      return false
    }
    return true
  }

  const getInitialWinner = (): string => {
    if (match.sets && match.sets.length > 0) {
      return match.winner || "DRAW"
    }
    if (match.score) {
      return match.score.team1Score > match.score.team2Score
        ? "TEAM_A"
        : match.score.team1Score < match.score.team2Score
          ? "TEAM_B"
          : "DRAW"
    }
    return "DRAW"
  }

  const getInitialScoreA = (): number => {
    if (match.sets && match.sets.length > 0) {
      return match.score?.team1Score ?? 0
    }
    if (match.score) {
      return match.score.team1Score
    }
    return 0
  }

  const getInitialScoreB = (): number => {
    if (match.sets && match.sets.length > 0) {
      return match.score?.team2Score ?? 0
    }
    if (match.score) {
      return match.score.team2Score
    }
    return 0
  }

  const [sets, setSets] = useState<Array<[number, number]>>(getInitialSets)
  const [autoCalculate, setAutoCalculate] = useState<boolean>(
    getInitialAutoCalculate
  )
  const [winner, setWinner] = useState<string>(getInitialWinner)
  const [scoreA, setScoreA] = useState<number>(getInitialScoreA)
  const [scoreB, setScoreB] = useState<number>(getInitialScoreB)

  // Sync calculated winner and final score when sets or autoCalculate toggled
  const syncCalculatedValues = (
    updatedSets: Array<[number, number]>,
    isAuto: boolean
  ) => {
    if (!isAuto) return

    let winsA = 0
    let winsB = 0

    updatedSets.forEach(([sa, sb]) => {
      if (sa > sb) winsA++
      else if (sb > sa) winsB++
    })

    // Determine winner
    let calculatedWinner = "DRAW"
    if (winsA > winsB) calculatedWinner = "TEAM_A"
    else if (winsB > winsA) calculatedWinner = "TEAM_B"

    // Determine final scores
    let calculatedScoreA = 0
    let calculatedScoreB = 0

    if (updatedSets.length === 1) {
      calculatedScoreA = updatedSets[0][0]
      calculatedScoreB = updatedSets[0][1]
    } else {
      calculatedScoreA = winsA
      calculatedScoreB = winsB
    }

    setWinner(calculatedWinner)
    setScoreA(calculatedScoreA)
    setScoreB(calculatedScoreB)
  }

  const handleAutoCalcChange = (checked: boolean) => {
    setAutoCalculate(checked)
    syncCalculatedValues(sets, checked)
  }

  // Handle set score input updates
  const updateSetScore = (setIndex: number, teamIndex: 0 | 1, val: string) => {
    const numericValue = Math.max(0, parseInt(val.replace(/\D/g, "")) || 0)
    const nextSets = sets.map((set, idx) => {
      if (idx === setIndex) {
        const updatedSet = [...set] as [number, number]
        updatedSet[teamIndex] = numericValue
        return updatedSet
      }
      return set
    })
    setSets(nextSets)
    syncCalculatedValues(nextSets, autoCalculate)
  }

  // Add a new set row
  const addSet = () => {
    if (sets.length >= 5) {
      toast.warning(t("matches.maxSetsLimit"))
      return
    }
    const nextSets = [...sets, [0, 0] as [number, number]]
    setSets(nextSets)
    syncCalculatedValues(nextSets, autoCalculate)
  }

  // Remove the specified set row
  const removeSet = (index: number) => {
    if (sets.length <= 1) return
    const nextSets = sets.filter((_, idx) => idx !== index)
    setSets(nextSets)
    syncCalculatedValues(nextSets, autoCalculate)
  }

  // Submit handler
  const handleSave = async () => {
    setIsPending(true)

    // Construct the payload type matching user's specification
    const payload = {
      winner,
      scoreA,
      scoreB,
      sets,
    }

    try {
      await confirmMatchResultAction(match.id, payload)
      toast.success(t("matches.submitSuccess"))

      if (onSuccess) {
        onSuccess(payload)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving match result:", error)
      const message = error instanceof Error ? error.message : ""
      toast.error(message || t("matches.submitError"))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("matches.matchResultTitle")}</DialogTitle>
          <DialogDescription>
            {t("matches.resultDialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Teams Title Overview */}
          <div className="rounded-xl border bg-muted/40 p-4 text-center">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="truncate text-sm font-semibold text-primary">
                {teamAName}
              </div>
              <div className="rounded border bg-background px-2 py-1 text-xs font-semibold text-muted-foreground">
                {t("matches.versus")}
              </div>
              <div className="truncate text-sm font-semibold text-primary">
                {teamBName}
              </div>
            </div>
            <div className="mt-1 grid grid-cols-2 text-[10px] text-muted-foreground">
              <div>{t("matches.teamA")}</div>
              <div>{t("matches.teamB")}</div>
            </div>
          </div>

          {/* Sets list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                {t("matches.sets")}
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addSet}
                disabled={sets.length >= 5}
                className="h-8 gap-1"
              >
                <Plus className="size-3.5" />
                {t("matches.addSet")}
              </Button>
            </div>

            <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
              {sets.map((set, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg border bg-background/50 p-3 transition-colors hover:bg-background/80"
                >
                  <span className="min-w-14 text-xs font-medium text-muted-foreground">
                    {t("matches.setNumber", { number: idx + 1 })}
                  </span>
                  <div className="grid flex-1 grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`set-${idx}-a`} className="sr-only">
                        {t("matches.teamA")}
                      </Label>
                      <Input
                        id={`set-${idx}-a`}
                        type="text"
                        inputMode="numeric"
                        className="text-center font-semibold"
                        value={set[0]}
                        onChange={(e) => updateSetScore(idx, 0, e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`set-${idx}-b`} className="sr-only">
                        {t("matches.teamB")}
                      </Label>
                      <Input
                        id={`set-${idx}-b`}
                        type="text"
                        inputMode="numeric"
                        className="text-center font-semibold"
                        value={set[1]}
                        onChange={(e) => updateSetScore(idx, 1, e.target.value)}
                      />
                    </div>
                  </div>
                  {sets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSet(idx)}
                      className="size-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Auto Calculate Switch */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3">
            <div className="space-y-0.5">
              <Label htmlFor="auto-calc" className="text-sm font-semibold">
                {t("matches.autoCalculate")}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {t("matches.autoCalculateDescription")}
              </p>
            </div>
            <Switch
              id="auto-calc"
              checked={autoCalculate}
              onCheckedChange={handleAutoCalcChange}
            />
          </div>

          {/* Final Results Overview */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border bg-background p-4">
            <div className="col-span-2">
              <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {t("matches.winner")}
              </Label>
              <NativeSelect
                size="default"
                className="mt-1.5 w-full"
                value={winner}
                disabled={autoCalculate}
                onChange={(e) => setWinner(e.target.value)}
              >
                <NativeSelectOption value="TEAM_A">
                  {t("matches.teamAGreen")}
                </NativeSelectOption>
                <NativeSelectOption value="TEAM_B">
                  {t("matches.teamBRed")}
                </NativeSelectOption>
                <NativeSelectOption value="DRAW">
                  {t("matches.draw")}
                </NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="score-a"
                className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
              >
                {t("matches.scoreA")}
              </Label>
              <Input
                id="score-a"
                type="text"
                inputMode="numeric"
                className="text-lg font-bold"
                disabled={autoCalculate}
                value={scoreA}
                onChange={(e) =>
                  setScoreA(
                    Math.max(
                      0,
                      parseInt(e.target.value.replace(/\D/g, "")) || 0
                    )
                  )
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="score-b"
                className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
              >
                {t("matches.scoreB")}
              </Label>
              <Input
                id="score-b"
                type="text"
                inputMode="numeric"
                className="text-lg font-bold"
                disabled={autoCalculate}
                value={scoreB}
                onChange={(e) =>
                  setScoreB(
                    Math.max(
                      0,
                      parseInt(e.target.value.replace(/\D/g, "")) || 0
                    )
                  )
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("expenses.expenseDialog.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("matches.saveResult")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
