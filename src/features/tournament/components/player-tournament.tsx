import { Calendar, Clock, MapPin, Trophy, Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { liveScores, participants } from "../mock-data/player-tournament"

export function PlayerTournament() {
  const { t } = useTournamentTranslation()
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-800">
        <div className="absolute inset-0 bg-black/20" />
        <img
          src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1600&q=80"
          alt="Tournament"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="relative flex h-full items-center justify-center px-4 text-center">
          <div>
            <h1 className="mb-4 text-5xl font-bold text-white">
              {t("public.hero.title")}
            </h1>
            <div className="flex items-center justify-center gap-6 text-lg text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t("public.hero.location")}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("public.hero.dates")}
              </div>
            </div>
            <div className="mt-6">
              <Badge className="bg-yellow-500 px-4 py-2 text-lg text-yellow-900">
                <Clock className="mr-2 h-4 w-4" />
                {t("public.hero.inProgress")}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-[458px] mx-auto mt-[20px] mb-[0px] max-w-7xl px-8 pb-12">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
              <div className="mb-1 text-3xl font-bold text-gray-900">156</div>
              <div className="text-sm text-gray-600">
                {t("public.stats.participants")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
              <div className="mb-1 text-3xl font-bold text-gray-900">8</div>
              <div className="text-sm text-gray-600">
                {t("public.stats.events")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
              <div className="mb-1 text-3xl font-bold text-gray-900">64</div>
              <div className="text-sm text-gray-600">
                {t("public.stats.totalMatches")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              {t("public.tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="schedule">
              {t("public.tabs.schedule")}
            </TabsTrigger>
            <TabsTrigger value="participants">
              {t("public.tabs.participants")}
            </TabsTrigger>
            <TabsTrigger value="live">
              {t("public.tabs.liveScores")}
            </TabsTrigger>
            <TabsTrigger value="results">
              {t("public.tabs.results")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("public.overview.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      {t("public.overview.description")}
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">
                        {t("public.overview.eventsLabel")}
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Men&apos;s Singles Open</li>
                        <li>• Women&apos;s Singles Open</li>
                        <li>• Men&apos;s Doubles 3.5</li>
                        <li>• Women&apos;s Doubles 4.0</li>
                        <li>• Mixed Doubles 4.5</li>
                        <li>• Men&apos;s Singles 5.0</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("public.venue.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-1 font-semibold text-gray-900">
                        {t("public.venue.location")}
                      </div>
                      <p className="text-gray-700">
                        Balboa Park Tennis & Pickleball Center
                      </p>
                      <p className="text-gray-600">
                        2221 Morley Field Dr, San Diego, CA 92104
                      </p>
                    </div>
                    <div>
                      <div className="mb-1 font-semibold text-gray-900">
                        {t("public.venue.facilities")}
                      </div>
                      <p className="text-gray-700">
                        8 outdoor courts, Pro shop, Concessions, Covered seating
                      </p>
                    </div>
                    <div>
                      <div className="mb-1 font-semibold text-gray-900">
                        {t("public.venue.parking")}
                      </div>
                      <p className="text-gray-700">
                        Free parking available on-site
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("public.tabs.participants")} ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {participants.map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 p-4"
                    >
                      <Avatar>
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {participant.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-900">
                          {participant.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("public.participantsList.rating")}{" "}
                          {participant.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="live">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  {t("public.tabs.liveScores")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liveScores.map((score, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <Badge className="mb-2 bg-yellow-600 text-white">
                            {score.court}
                          </Badge>
                          <div className="text-sm font-medium text-gray-900">
                            {score.event}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-600">
                            {score.score}
                          </div>
                          <Badge
                            className={
                              score.status === "in_progress"
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }
                          >
                            {score.status === "in_progress"
                              ? t("public.liveScores.live")
                              : t("public.liveScores.final")}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        {typeof score.team1 === "object"
                          ? score.team1?.name
                          : score.team1}{" "}
                        <span className="text-gray-400">
                          {t("public.liveScores.vs")}
                        </span>{" "}
                        {typeof score.team2 === "object"
                          ? score.team2?.name
                          : score.team2}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
