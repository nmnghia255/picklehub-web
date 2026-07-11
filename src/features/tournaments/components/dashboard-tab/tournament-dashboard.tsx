"use client"

import {
  Calendar,
  DollarSign,
  Download,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Trophy,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { getTournamentPosterImageAction } from "../../actions/tournament-actions"
import { useTournamentDashboardStore } from "../../stores/tournament-dashboard-store"
import type { TournamentPrize } from "../../types/prize"
import type { Sponsor } from "../../types/sponsor"
import type { Tournament } from "../../types/tournament"
import type { TournamentEvent } from "../../types/tournament-event"
import { RegistrationProgress } from "./registration-progress"
import { StatusControlPanel } from "./status-control-panel"
import { TournamentLifecycle } from "./tournament-lifecycle"

export interface TournamentDashboardProps {
  tournament: Tournament
  events: TournamentEvent[]
  prizes?: TournamentPrize[]
  sponsors?: Sponsor[]
  isHost?: boolean
}

export function TournamentDashboard({
  tournament: initialTournament,
  events: initialEvents,
  prizes = [],
  sponsors = [],
  isHost = false,
}: TournamentDashboardProps) {
  const { t, i18n } = useTournamentTranslation()
  const {
    tournament,
    events,
    matchesCount,
    revenue,
    loadingStats,
    setInitialData,
    fetchStats,
  } = useTournamentDashboardStore()

  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false)
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false)
  const [posterBase64, setPosterBase64] = useState<string | null>(null)

  useEffect(() => {
    setInitialData({
      tournament: initialTournament,
      events: initialEvents,
      prizes,
      sponsors,
      isHost,
    })
    fetchStats()
  }, [
    initialTournament,
    initialEvents,
    prizes,
    sponsors,
    isHost,
    setInitialData,
    fetchStats,
  ])

  // Use store data if available, fallback to initial props during hydration/first render
  const activeTournament = tournament || initialTournament
  const activeEvents = events.length > 0 ? events : initialEvents

  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const start = new Date(startStr)
      const end = new Date(endStr)
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return `${startStr} - ${endStr}`
      }
      const locale = i18n.language === "vi" ? "vi-VN" : "en-US"
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
      return `${start.toLocaleDateString(locale, options)} - ${end.toLocaleDateString(locale, options)}`
    } catch {
      return `${startStr} - ${endStr}`
    }
  }

  const formatCurrency = (amount: number) => {
    if (i18n.language === "vi") {
      return `${amount.toLocaleString("vi-VN")} VND`
    }
    return `$${amount.toLocaleString()}`
  }

  const handleCreatePoster = async () => {
    setIsPosterModalOpen(true)
    setIsGeneratingPoster(true)
    setPosterBase64(null)

    try {
      const res = await getTournamentPosterImageAction(activeTournament.id)
      if (res.success && res.base64) {
        setPosterBase64(res.base64)
      } else {
        toast.error(
          res.error ||
            t("dashboard.posterError", {
              defaultValue: "Không thể tạo poster giải đấu",
            })
        )
        setIsPosterModalOpen(false)
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("dashboard.posterUnexpectedError", {
          defaultValue: "Đã xảy ra lỗi không mong muốn khi tạo poster",
        })
      )
      setIsPosterModalOpen(false)
    } finally {
      setIsGeneratingPoster(false)
    }
  }

  const handleDownloadPoster = () => {
    if (!posterBase64) return
    const link = document.createElement("a")
    link.href = `data:image/png;base64,${posterBase64}`
    link.download = `poster-${activeTournament.name.toLowerCase().replace(/\s+/g, "-")}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const statsList = [
    {
      label: t("public.stats.participants", { defaultValue: "Participants" }),
      value: activeTournament.registered,
      icon: Users,
    },
    {
      label: t("public.stats.events", { defaultValue: "Events" }),
      value: activeEvents.length,
      icon: Calendar,
    },
    {
      label: t("public.stats.totalMatches", { defaultValue: "Matches" }),
      value: loadingStats ? "..." : (matchesCount ?? 0),
      icon: Trophy,
    },
    {
      label: t("financials.summary.totalRevenue", { defaultValue: "Revenue" }),
      value: loadingStats ? "..." : formatCurrency(revenue ?? 0),
      icon: DollarSign,
    },
  ]

  return (
    <div className="h-full w-full max-w-7xl p-8">
      {/* Tournament Info Banner */}
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 [--color-white:#ffffff] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        {activeTournament.banner ? (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={activeTournament.banner}
              alt={activeTournament.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute right-6 bottom-6 left-6 flex flex-col items-start justify-between gap-4 text-white md:flex-row md:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {activeTournament.name}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
                  <MapPin className="h-4 w-4 shrink-0 text-white/70" />
                  <span>{activeTournament.venue}</span>
                  <span className="text-white/40">•</span>
                  <Calendar className="h-4 w-4 shrink-0 text-white/70" />
                  <span>
                    {formatDateRange(
                      activeTournament.startDate,
                      activeTournament.endDate
                    )}
                  </span>
                </p>
              </div>
              <Button
                onClick={handleCreatePoster}
                className="shrink-0 bg-white/90 font-bold text-gray-900 shadow-md hover:bg-white"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                {t("dashboard.createPoster", {
                  defaultValue: "Tạo Poster",
                })}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start justify-between gap-4 bg-linear-to-r from-emerald-500 to-teal-600 p-8 text-white md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {activeTournament.name}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-emerald-100">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{activeTournament.venue}</span>
                <span className="text-emerald-300">•</span>
                <Calendar className="h-4 w-4 shrink-0" />
                <span>
                  {formatDateRange(
                    activeTournament.startDate,
                    activeTournament.endDate
                  )}
                </span>
              </p>
            </div>
            <Button
              onClick={handleCreatePoster}
              className="shrink-0 bg-white font-bold text-emerald-700 shadow-md hover:bg-emerald-50"
            >
              <ImageIcon className="mr-2 h-4 w-4 text-emerald-600" />
              {t("dashboard.createPoster", {
                defaultValue: "Tạo Poster",
              })}
            </Button>
          </div>
        )}
        {activeTournament.description && (
          <div className="border-t border-gray-50 p-6 dark:border-zinc-800">
            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-600 dark:text-zinc-300">
              {activeTournament.description}
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsList.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  {Icon && (
                    <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="mb-1 text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-zinc-400">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Registration Progress */}
        <RegistrationProgress initialEvents={initialEvents} />

        {/* Tournament Lifecycle */}
        <TournamentLifecycle initialTournament={initialTournament} />
      </div>

      {/* Host Status Actions Panel */}
      <StatusControlPanel />

      {/* Poster Generation Modal */}
      <Dialog open={isPosterModalOpen} onOpenChange={setIsPosterModalOpen}>
        <DialogContent className="max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-950">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">
              {t("dashboard.posterTitle", {
                defaultValue: "Poster Quảng Cáo Giải Đấu",
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="my-4 flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            {isGeneratingPoster ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                <span className="text-sm font-medium text-gray-500">
                  {t("dashboard.generatingPoster", {
                    defaultValue: "Đang tạo poster...",
                  })}
                </span>
              </div>
            ) : posterBase64 ? (
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <img
                  src={`data:image/png;base64,${posterBase64}`}
                  alt={t("common.previewImageAlt")}
                  className="max-h-[500px] w-full object-contain"
                />
              </div>
            ) : null}
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPosterModalOpen(false)}
            >
              {t("dashboard.close", { defaultValue: "Đóng" })}
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 font-bold text-white hover:bg-emerald-700"
              disabled={!posterBase64}
              onClick={handleDownloadPoster}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("dashboard.downloadPoster", {
                defaultValue: "Tải xuống",
              })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
