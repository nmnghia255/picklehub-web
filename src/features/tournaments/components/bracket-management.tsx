import {
  AlertTriangle,
  Calendar,
  Clock,
  Download,
  Lock,
  MapPin,
  Maximize2,
  Search,
  Shuffle,
  Trophy,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  finalMatch,
  leftBracket,
  rightBracket,
} from "../mock-data/bracket-management"
import type { Match } from "../types/match"

// Left Bracket (Seeds 1-8)

// Right Bracket (Seeds 2, 3, 6, 7, 10, 11, 14, 15)

export function BracketManagement() {
  const { t } = useTournamentTranslation()
  const [selectedFormat, setSelectedFormat] = useState("single-elimination")
  const [viewMode, setViewMode] = useState("standard")
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [zoom, setZoom] = useState(100)

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Left Sidebar */}
      <div className="flex w-80 flex-col border-r border-gray-200 bg-white p-6">
        <div className="mb-8">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            {t("brackets.sidebar.title")}
          </h2>
          <p className="mb-2 text-sm text-gray-600">
            {t("brackets.sidebar.subtitle")}
          </p>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700">
              {t("brackets.sidebar.badges.singles")}
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-700">
              {t("brackets.sidebar.badges.inProgress")}
            </Badge>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            {t("brackets.sidebar.quickActions")}
          </h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Shuffle className="mr-2 h-4 w-4" />
              {t("brackets.sidebar.generateBracket")}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shuffle className="mr-2 h-4 w-4" />
              {t("brackets.sidebar.autoSeed")}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Lock className="mr-2 h-4 w-4" />
              {t("brackets.sidebar.lockBracket")}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" />
              {t("brackets.sidebar.exportPdf")}
            </Button>
            <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700">
              <Upload className="mr-2 h-4 w-4" />
              {t("brackets.sidebar.publishBracket")}
            </Button>
          </div>
        </div>

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
              onClick={() => setZoom(100)}
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              {t("brackets.sidebar.fitScreen", { zoom })}
            </Button>
          </div>
        </div>

        <div className="mt-auto border-t pt-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("brackets.sidebar.stats.total")}
              </span>
              <span className="font-semibold text-gray-900">15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("brackets.sidebar.stats.completed")}
              </span>
              <span className="font-semibold text-emerald-600">9</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("brackets.sidebar.stats.inProgress")}
              </span>
              <span className="font-semibold text-yellow-600">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("brackets.sidebar.stats.remaining")}
              </span>
              <span className="font-semibold text-gray-900">5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col bg-gray-50">
        {/* Top Toolbar */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center gap-4">
            <div className="max-w-sm flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t("brackets.toolbar.searchPlaceholder")}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single-elimination">
                  {t("brackets.toolbar.formats.single")}
                </SelectItem>
                <SelectItem value="double-elimination">
                  {t("brackets.toolbar.formats.double")}
                </SelectItem>
                <SelectItem value="round-robin">
                  {t("brackets.toolbar.formats.roundRobin")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">
                  {t("brackets.toolbar.viewModes.compact")}
                </SelectItem>
                <SelectItem value="standard">
                  {t("brackets.toolbar.viewModes.standard")}
                </SelectItem>
                <SelectItem value="full">
                  {t("brackets.toolbar.viewModes.full")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bracket Content */}
        <ScrollArea className="flex-1">
          <div className="flex min-h-full items-center justify-center p-8">
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center",
              }}
            >
              <TwoSidedBracket
                leftBracket={leftBracket}
                rightBracket={rightBracket}
                finalMatch={finalMatch}
                viewMode={viewMode}
                onMatchClick={setSelectedMatch}
              />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Match Details Drawer */}
      <Sheet open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <SheetContent className="w-[500px] px-[16px] py-[0px]">
          <SheetHeader>
            <SheetTitle>{t("brackets.match.details.title")}</SheetTitle>
            <SheetDescription>
              {t("brackets.match.details.description")}
            </SheetDescription>
          </SheetHeader>
          {selectedMatch && <MatchDetailsContent match={selectedMatch} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function TwoSidedBracket({
  leftBracket,
  rightBracket,
  finalMatch,
  viewMode,
  onMatchClick,
}: {
  leftBracket: { r16: Match[]; qf: Match[]; sf: Match[] }
  rightBracket: { r16: Match[]; qf: Match[]; sf: Match[] }
  finalMatch: Match
  viewMode: string
  onMatchClick: (match: Match) => void
}) {
  const { t } = useTournamentTranslation()
  return (
    <div className="inline-flex items-center gap-16 pb-8">
      {/* LEFT BRACKET */}
      <div className="flex gap-12">
        {/* R16 */}
        <div className="flex flex-col justify-around gap-8">
          <div className="mb-4 text-center text-sm font-semibold text-gray-700">
            {t("brackets.rounds.r16")}
          </div>
          {leftBracket.r16.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              viewMode={viewMode}
              onClick={() => onMatchClick(match)}
            />
          ))}
        </div>

        {/* QF */}
        <div className="flex flex-col justify-around gap-8">
          <div className="mb-4 text-center text-sm font-semibold text-gray-700">
            {t("brackets.rounds.qf")}
          </div>
          {leftBracket.qf.map((match, idx) => (
            <div
              key={match.id}
              style={{ marginTop: idx === 0 ? "80px" : "240px" }}
            >
              <MatchCard
                match={match}
                viewMode={viewMode}
                onClick={() => onMatchClick(match)}
              />
            </div>
          ))}
        </div>

        {/* SF */}
        <div className="flex flex-col justify-center">
          <div className="mb-4 text-center text-sm font-semibold text-gray-700">
            {t("brackets.rounds.sf")}
          </div>
          {leftBracket.sf.map((match) => (
            <div key={match.id} style={{ marginTop: "240px" }}>
              <MatchCard
                match={match}
                viewMode={viewMode}
                onClick={() => onMatchClick(match)}
                size="large"
              />
            </div>
          ))}
        </div>
      </div>

      {/* CHAMPIONSHIP FINAL */}
      <div className="flex flex-col items-center">
        <div className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Trophy className="h-6 w-6 text-yellow-600" />
          {t("brackets.rounds.final")}
        </div>
        <ChampionshipCard
          match={finalMatch}
          onClick={() => onMatchClick(finalMatch)}
        />
      </div>

      {/* RIGHT BRACKET */}
      <div className="flex gap-12">
        {/* SF */}
        <div className="flex flex-col justify-center">
          <div className="mb-4 text-center text-sm font-semibold text-gray-700">
            {t("brackets.rounds.sf")}
          </div>
          {rightBracket.sf.map((match) => (
            <div key={match.id} style={{ marginTop: "240px" }}>
              <MatchCard
                match={match}
                viewMode={viewMode}
                onClick={() => onMatchClick(match)}
                size="large"
              />
            </div>
          ))}
        </div>

        {/* QF */}
        <div className="flex flex-col justify-around gap-8">
          <div className="mb-4 text-center text-sm font-semibold text-gray-700">
            {t("brackets.rounds.qf")}
          </div>
          {rightBracket.qf.map((match, idx) => (
            <div
              key={match.id}
              style={{ marginTop: idx === 0 ? "80px" : "240px" }}
            >
              <MatchCard
                match={match}
                viewMode={viewMode}
                onClick={() => onMatchClick(match)}
              />
            </div>
          ))}
        </div>

        {/* R16 */}
        <div className="flex flex-col justify-around gap-8">
          <div className="mb-4 text-center text-sm font-semibold text-gray-700">
            {t("brackets.rounds.r16")}
          </div>
          {rightBracket.r16.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              viewMode={viewMode}
              onClick={() => onMatchClick(match)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ChampionshipCard({
  match,
  onClick,
}: {
  match: Match
  onClick: () => void
}) {
  const { t } = useTournamentTranslation()
  return (
    <Card
      className="w-[480px] cursor-pointer border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 via-white to-yellow-50 transition-all hover:shadow-2xl"
      onClick={onClick}
    >
      <CardContent className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <Badge className="bg-yellow-500 px-3 py-1 text-sm text-yellow-900">
            {t("brackets.match.finalBadge")}
          </Badge>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {match.time}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {match.court}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Team 1 Placeholder */}
          <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                <Trophy className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-400">
                  {t("brackets.match.winnerSf1")}
                </div>
                <div className="text-sm text-gray-500">
                  {t("brackets.match.leftChamp")}
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-300">-</div>
          </div>

          {/* VS */}
          <div className="flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
              <span className="text-2xl font-bold text-white">VS</span>
            </div>
          </div>

          {/* Team 2 Placeholder */}
          <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                <Trophy className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-400">
                  {t("brackets.match.winnerSf2")}
                </div>
                <div className="text-sm text-gray-500">
                  {t("brackets.match.rightChamp")}
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-300">-</div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <Trophy className="h-5 w-5" />
            <span className="text-sm font-semibold">
              {t("brackets.match.championshipMatch")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MatchCard({
  match,
  viewMode,
  onClick,
  size = "normal",
}: {
  match: Match
  viewMode: string
  onClick: () => void
  size?: "normal" | "large"
}) {
  const { t } = useTournamentTranslation()
  const statusConfig = {
    scheduled: {
      labelKey: "brackets.match.statuses.scheduled",
      color: "bg-gray-100 text-gray-700",
    },
    ready: {
      labelKey: "brackets.match.statuses.ready",
      color: "bg-blue-100 text-blue-700",
    },
    in_progress: {
      labelKey: "brackets.match.statuses.in_progress",
      color: "bg-yellow-100 text-yellow-700",
    },
    completed: {
      labelKey: "brackets.match.statuses.completed",
      color: "bg-emerald-100 text-emerald-700",
    },
    walkover: {
      labelKey: "brackets.match.statuses.walkover",
      color: "bg-purple-100 text-purple-700",
    },
    pending: {
      labelKey: "brackets.match.statuses.pending",
      color: "bg-gray-100 text-gray-400",
    },
  }

  const cardWidth = size === "large" ? "w-96" : "w-80"

  const t1 = typeof match.team1 === "object" ? match.team1 : undefined
  const t2 = typeof match.team2 === "object" ? match.team2 : undefined

  return (
    <Card
      className={`${cardWidth} cursor-pointer transition-all hover:shadow-lg ${size === "large" ? "border-2 border-emerald-300" : ""}`}
      onClick={onClick}
    >
      <CardContent className={size === "large" ? "p-5" : "p-4"}>
        {t1 || t2 ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <Badge
                className={`text-xs ${statusConfig[match.status as keyof typeof statusConfig].color}`}
              >
                {t(
                  statusConfig[match.status as keyof typeof statusConfig]
                    .labelKey
                )}
              </Badge>
              {match.time && viewMode !== "compact" && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {match.time}
                </div>
              )}
            </div>

            {match.court && viewMode === "full" && (
              <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                {match.court}
              </div>
            )}

            <div className="space-y-2">
              {/* Team 1 */}
              <div
                className={`flex items-center justify-between rounded-lg p-3 ${
                  match.winner === 1
                    ? "bg-emerald-50 ring-2 ring-emerald-200"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      #{t1?.seed}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`truncate text-sm ${match.winner === 1 ? "font-semibold text-gray-900" : "text-gray-700"}`}
                    >
                      {t1?.name}
                    </div>
                    {viewMode !== "compact" && (
                      <div className="text-xs text-gray-500">{t1?.rating}</div>
                    )}
                  </div>
                </div>
                {t1?.score !== undefined && (
                  <div
                    className={`ml-2 text-xl font-bold ${match.winner === 1 ? "text-emerald-600" : "text-gray-600"}`}
                  >
                    {t1.score}
                  </div>
                )}
              </div>

              {/* Team 2 */}
              {t2 && (
                <div
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    match.winner === 2
                      ? "bg-emerald-50 ring-2 ring-emerald-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        #{t2.seed}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate text-sm ${match.winner === 2 ? "font-semibold text-gray-900" : "text-gray-700"}`}
                      >
                        {t2.name}
                      </div>
                      {viewMode !== "compact" && (
                        <div className="text-xs text-gray-500">{t2.rating}</div>
                      )}
                    </div>
                  </div>
                  {t2.score !== undefined && (
                    <div
                      className={`ml-2 text-xl font-bold ${match.winner === 2 ? "text-emerald-600" : "text-gray-600"}`}
                    >
                      {t2.score}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="mb-1 text-sm text-gray-400">
              {t("brackets.match.tbd")}
            </div>
            {match.time && (
              <div className="text-xs text-gray-400">{match.time}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MatchDetailsContent({ match }: { match: Match }) {
  const { t } = useTournamentTranslation()
  const t1 = typeof match.team1 === "object" ? match.team1 : undefined
  const t2 = typeof match.team2 === "object" ? match.team2 : undefined

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="mb-2 text-sm font-medium text-gray-500">
          {t("brackets.match.details.status")}
        </div>
        <Badge
          className={
            match.status === "completed"
              ? "bg-emerald-100 text-emerald-700"
              : match.status === "in_progress"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-blue-100 text-blue-700"
          }
        >
          {t(
            match.status === "completed"
              ? "brackets.match.statuses.completed"
              : match.status === "in_progress"
                ? "brackets.match.statuses.in_progress"
                : "brackets.match.statuses.scheduled"
          )}
        </Badge>
      </div>

      <div>
        <h4 className="mb-3 font-semibold text-gray-900">
          {t("brackets.match.details.participants")}
        </h4>
        {t1 && (
          <div className="mb-3 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{t1.name}</div>
                <div className="text-sm text-gray-600">
                  {t("brackets.match.details.seed", { seed: t1.seed })} •{" "}
                  {t("brackets.match.details.rating", { rating: t1.rating })}
                </div>
              </div>
              {t1.score !== undefined && (
                <div className="text-2xl font-bold text-emerald-600">
                  {t1.score}
                </div>
              )}
            </div>
          </div>
        )}
        {t2 && (
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{t2.name}</div>
                <div className="text-sm text-gray-600">
                  {t("brackets.match.details.seed", { seed: t2.seed })} •{" "}
                  {t("brackets.match.details.rating", { rating: t2.rating })}
                </div>
              </div>
              {t2.score !== undefined && (
                <div className="text-2xl font-bold text-emerald-600">
                  {t2.score}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {match.court && (
        <div>
          <h4 className="mb-3 font-semibold text-gray-900">
            {t("brackets.match.details.info")}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {t("brackets.match.details.court")}
              </span>
              <span className="font-medium text-gray-900">{match.court}</span>
            </div>
            {match.time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {t("brackets.match.details.time")}
                </span>
                <span className="font-medium text-gray-900">{match.time}</span>
              </div>
            )}
            {match.round && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {t("brackets.match.details.round")}
                </span>
                <span className="font-medium text-gray-900">{match.round}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2 border-t pt-4">
        <h4 className="mb-3 font-semibold text-gray-900">
          {t("brackets.match.details.actions")}
        </h4>
        <Button variant="outline" className="w-full justify-start">
          {t("brackets.match.details.editMatch")}
        </Button>
        <Button variant="outline" className="w-full justify-start">
          {t("brackets.match.details.reassignCourt")}
        </Button>
        <Button variant="outline" className="w-full justify-start">
          {t("brackets.match.details.updateScore")}
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-yellow-600 hover:text-yellow-700"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          {t("brackets.match.details.markWalkover")}
        </Button>
      </div>
    </div>
  )
}
