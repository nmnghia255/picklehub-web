import { AlertTriangle, Check, Clock, Sparkles, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMatchesGeneratorStore } from "@/features/socials/stores/matches-generator-store"
import type { SuggestedMatchRequest } from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface MatchesControlPanelProps {
  onGenerateMatches: (request: SuggestedMatchRequest) => Promise<void>
  numberOfCourts?: number
  bookingIds?: string[]
  availableCourts?: Array<{ id: string; name: string }>
}

function getDefaultTimeStr() {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, "0")
  const mm = String(now.getMinutes()).padStart(2, "0")
  return `${hh}:${mm}`
}

export function MatchesControlPanel({
  onGenerateMatches,
  numberOfCourts = 0,
  bookingIds,
  availableCourts,
}: MatchesControlPanelProps) {
  const { t } = useSocialsTranslation()
  const { players } = useMatchesGeneratorStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [matchType, setMatchType] = useState<"DOUBLES" | "SINGLES">("DOUBLES")
  const [roundDurationMins, setRoundDurationMins] = useState<number | "">(15)
  const [startTimeStr, setStartTimeStr] = useState<string>(getDefaultTimeStr())
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<
    string[]
  >(() => players.map((p) => p.id))
  const [selectedCourtIds, setSelectedCourtIds] = useState<string[]>([])

  useEffect(() => {
    if (players.length === 0) return
    let isMounted = true
    queueMicrotask(() => {
      if (isMounted) setSelectedParticipantIds(players.map((p) => p.id))
    })
    return () => {
      isMounted = false
    }
  }, [players])

  const courtOptions = useMemo(() => {
    if (availableCourts && availableCourts.length > 0) {
      const map = new Map<string, { value: string; label: string }>()
      availableCourts.forEach((c) => {
        const key = c.name || c.id
        if (!map.has(key)) {
          map.set(key, { value: c.id, label: c.name })
        }
      })
      return Array.from(map.values())
    }
    if (bookingIds && bookingIds.length > 0) {
      const uniqueBookingIds = Array.from(new Set(bookingIds))
      return uniqueBookingIds.map((id, idx) => ({
        value: id,
        label: `Sân ${idx + 1}`,
      }))
    }
    return []
  }, [availableCourts, bookingIds])

  useEffect(() => {
    if (courtOptions.length === 0) return
    let isMounted = true
    queueMicrotask(() => {
      if (isMounted) setSelectedCourtIds(courtOptions.map((c) => c.value))
    })
    return () => {
      isMounted = false
    }
  }, [courtOptions])

  const participantOptions = useMemo(() => {
    return players.map((p) => ({
      value: p.id,
      label: `${p.name}${
        p.matchesPlayed !== undefined ? ` (${p.matchesPlayed} trận)` : ""
      }`,
    }))
  }, [players])

  const handleGenerate = async () => {
    const activeParticipants =
      selectedParticipantIds.length > 0
        ? selectedParticipantIds
        : players.map((p) => p.id)

    const activeSet = new Set(activeParticipants)
    const excludeParticipantIds = players
      .map((p) => p.id)
      .filter((id) => !activeSet.has(id))

    const duration = roundDurationMins === "" ? 15 : roundDurationMins
    const requiredMin = matchType === "DOUBLES" ? 4 : 2

    if (activeParticipants.length < requiredMin) {
      toast.error(
        t("matches.controlPanel.notEnoughPlayers", {
          requiredPlayers: requiredMin,
          got: activeParticipants.length,
          defaultValue: `Cần ít nhất ${requiredMin} người chơi cho trận ${matchType === "DOUBLES" ? "Đôi" : "Đơn"}`,
        })
      )
      return
    }

    const isUuid = (val: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        val
      )

    const rawCourtIds =
      selectedCourtIds.length > 0
        ? selectedCourtIds
        : bookingIds && bookingIds.length > 0
          ? bookingIds
          : []
    const validCourtUuids = Array.from(
      new Set(rawCourtIds.map((id) => id.split("_")[0]).filter(isUuid))
    )

    setIsGenerating(true)
    try {
      const dateObj = new Date()
      if (startTimeStr && startTimeStr.includes(":")) {
        const [h, m] = startTimeStr.split(":").map(Number)
        if (!isNaN(h) && !isNaN(m)) {
          dateObj.setHours(h, m, 0, 0)
        }
      }
      const scheduledAtIso = dateObj.toISOString()

      await onGenerateMatches({
        scheduledAt: scheduledAtIso,
        roundDurationMins: duration,
        matchType,
        selectedParticipantIds: activeParticipants,
        excludeParticipantIds,
        courtIds: validCourtUuids.length > 0 ? validCourtUuids : rawCourtIds,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground dark:text-slate-50">
          {t("matches.controlPanel.title", "Tạo Vòng Đấu Tiếp Theo")}
        </h2>
        {(courtOptions.length > 0 || numberOfCourts > 0) && (
          <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {t("matches.controlPanel.bookedCourts", {
              count: courtOptions.length || numberOfCourts,
              defaultValue: `${courtOptions.length || numberOfCourts} Sân Đã Đặt`,
            })}
          </div>
        )}
      </div>

      {/* HÀNG 1: Giờ Bắt Đầu Trận | Thời Lượng | Loại Trận Đấu */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="w-full space-y-2">
          <Label
            htmlFor="start-time"
            className="flex h-5 items-center gap-1.5 text-sm leading-none font-semibold"
          >
            <Clock className="size-4 shrink-0 text-primary" />
            <span>
              {t("matches.controlPanel.startTime", "Giờ Bắt Đầu Trận")}
            </span>
          </Label>
          <Input
            id="start-time"
            type="time"
            value={startTimeStr}
            onChange={(e) => setStartTimeStr(e.target.value)}
            className="h-10 w-full"
          />
        </div>

        <div className="w-full space-y-2">
          <Label
            htmlFor="round-duration"
            className="flex h-5 items-center text-sm leading-none font-semibold"
          >
            <span>{t("matches.controlPanel.roundDuration")}</span>
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
            className="h-10 w-full"
          />
        </div>

        <div className="w-full space-y-2">
          <Label
            htmlFor="match-type"
            className="flex h-5 items-center text-sm leading-none font-semibold"
          >
            <span>{t("matches.controlPanel.matchType")}</span>
          </Label>
          <Select
            value={matchType}
            onValueChange={(val: "DOUBLES" | "SINGLES") => setMatchType(val)}
          >
            <SelectTrigger id="match-type" className="h-10 w-full">
              <SelectValue placeholder={t("matches.roundDialog.matchType")} />
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
      </div>

      {/* HÀNG 2: Chọn Sân Thi Đấu Vòng Này */}
      {courtOptions.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-semibold">
            <span>
              {t(
                "matches.controlPanel.selectCourts",
                "Chọn Sân Thi Đấu Vòng Này"
              )}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              ({selectedCourtIds.length}/{courtOptions.length} sân)
            </span>
          </Label>
          <MultiSelect
            options={courtOptions}
            selected={selectedCourtIds}
            onSelectionChange={setSelectedCourtIds}
            placeholder={t(
              "matches.controlPanel.selectCourtsPlaceholder",
              "Chọn danh sách sân thi đấu..."
            )}
          />
        </div>
      )}

      {courtOptions.length === 0 &&
        (!bookingIds || bookingIds.length === 0) && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{t("matches.controlPanel.noBookingsLinked")}</span>
          </div>
        )}

      {/* HÀNG 3: Danh Sách VĐV Tham Gia Lượt Này */}

      {/* Participant Selection Checklist */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="flex items-center gap-2 font-semibold">
            <Users className="size-4 text-primary" />
            <span>{t("matches.controlPanel.selectParticipants")}</span>
            <span className="text-xs font-normal text-muted-foreground">
              ({selectedParticipantIds.length}/{players.length}{" "}
              {t("playSessionOverview.players")})
            </span>
          </Label>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() =>
                setSelectedParticipantIds(players.map((p) => p.id))
              }
            >
              {t("matches.roundDialog.selectAllParticipants")}
            </Button>
            <span className="text-xs text-muted-foreground/40">•</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setSelectedParticipantIds([])}
            >
              {t("matches.roundDialog.deselectAll")}
            </Button>
          </div>
        </div>

        <div className="grid max-h-64 grid-cols-1 gap-2.5 overflow-y-auto rounded-xl border border-border/80 bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => {
            const isSelected = selectedParticipantIds.includes(p.id)
            return (
              <div
                key={p.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedParticipantIds(
                      selectedParticipantIds.filter((id) => id !== p.id)
                    )
                  } else {
                    setSelectedParticipantIds([...selectedParticipantIds, p.id])
                  }
                }}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all select-none ${
                  isSelected
                    ? "border-primary/60 bg-card text-foreground shadow-2xs dark:bg-primary/10"
                    : "border-border/60 bg-muted/30 text-muted-foreground opacity-65 hover:opacity-100"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={p.avatarUrl || undefined} />
                    <AvatarFallback className="text-[11px] font-bold">
                      {(p.name || "P").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.matchesPlayed !== undefined
                        ? `${p.matchesPlayed} trận`
                        : "0 trận"}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40 bg-transparent"
                  }`}
                >
                  {isSelected && <Check className="size-3.5 stroke-[3]" />}
                </div>
              </div>
            )
          })}
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
            <li>{t("matches.controlPanel.howItWorksRule1")}</li>
            <li>{t("matches.controlPanel.howItWorksRule2")}</li>
            <li>{t("matches.controlPanel.howItWorksRule3")}</li>
            <li>{t("matches.controlPanel.howItWorksRule4")}</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
