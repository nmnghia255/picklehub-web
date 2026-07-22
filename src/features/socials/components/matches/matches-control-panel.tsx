"use client"

import { Sparkles } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMatchesGeneratorStore } from "@/features/socials/stores/matches-generator-store"
import type { SuggestedMatchRequest } from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface MatchesControlPanelProps {
  onGenerateMatches: (request: SuggestedMatchRequest) => Promise<void>
  numberOfCourts?: number
}

export function MatchesControlPanel({
  onGenerateMatches,
  numberOfCourts = 0,
}: MatchesControlPanelProps) {
  const { t } = useSocialsTranslation()
  const { players } = useMatchesGeneratorStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [singlesCount, setSinglesCount] = useState<number | "">(0)
  const [doublesCount, setDoublesCount] = useState<number | "">(0)
  const [roundDurationMins, setRoundDurationMins] = useState<number | "">(15)

  const handleGenerate = async () => {
    const sCount = singlesCount === "" ? 0 : singlesCount
    const dCount = doublesCount === "" ? 0 : doublesCount
    const duration = roundDurationMins === "" ? 15 : roundDurationMins

    const requiredPlayers = sCount * 2 + dCount * 4
    if (players.length < requiredPlayers) {
      toast.error(
        t("matches.controlPanel.notEnoughPlayers", {
          requiredPlayers,
          got: players.length,
        })
      )
      return
    }

    setIsGenerating(true)
    try {
      await onGenerateMatches({
        singlesCount: sCount,
        doublesCount: dCount,
        roundDurationMins: duration,
        excludeParticipantIds: [],
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground dark:text-slate-50">
          {t("matches.controlPanel.title")}
        </h2>
        {numberOfCourts > 0 && (
          <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {t("matches.controlPanel.bookedCourts", {
              count: numberOfCourts,
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label
            htmlFor="singles-count"
            className="text-foreground dark:text-slate-200"
          >
            {t("matches.controlPanel.singlesCount")}
          </Label>
          <Input
            id="singles-count"
            type="number"
            min={0}
            max={12}
            value={singlesCount}
            onChange={(e) => {
              const val = e.target.value
              setSinglesCount(val === "" ? "" : Math.max(0, parseInt(val) || 0))
            }}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="doubles-count"
            className="text-foreground dark:text-slate-200"
          >
            {t("matches.controlPanel.doublesCount")}
          </Label>
          <Input
            id="doubles-count"
            type="number"
            min={0}
            max={12}
            value={doublesCount}
            onChange={(e) => {
              const val = e.target.value
              setDoublesCount(val === "" ? "" : Math.max(0, parseInt(val) || 0))
            }}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="round-duration"
            className="text-foreground dark:text-slate-200"
          >
            {t("matches.controlPanel.roundDuration")}
          </Label>
          <Input
            id="round-duration"
            type="number"
            min={5}
            max={120}
            step={5}
            value={roundDurationMins}
            onChange={(e) => {
              const val = e.target.value
              setRoundDurationMins(
                val === "" ? "" : Math.max(5, parseInt(val) || 0)
              )
            }}
            className="h-10"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="lg"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating
            ? t("matches.controlPanel.generating")
            : t("matches.controlPanel.generate")}
        </Button>
      </div>

      {/* Info Box */}
      <Card className="border-sky-200 bg-sky-50 p-4 dark:border-cyan-900/60 dark:bg-slate-950/60">
        <div className="space-y-1 text-sm">
          <p className="font-medium text-sky-900 dark:text-cyan-200">
            {t("matches.controlPanel.howItWorks")}
          </p>
          <ul className="ml-4 list-disc space-y-1 text-xs text-sky-800 dark:text-slate-300">
            <li>{t("matches.controlPanel.step1")}</li>
            <li>{t("matches.controlPanel.step2")}</li>
            <li>{t("matches.controlPanel.step3")}</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
