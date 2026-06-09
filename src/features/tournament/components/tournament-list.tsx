"use client"

import { Calendar, MapPin, Plus, Search, Users } from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { tournaments } from "../mock-data/tournament-list"

const statusConfig = {
  draft: {
    labelKey: "list.statuses.draft",
    color: "bg-gray-100 text-gray-700",
  },
  published: {
    labelKey: "list.statuses.published",
    color: "bg-blue-100 text-blue-700",
  },
  open_registration: {
    labelKey: "list.statuses.open_registration",
    color: "bg-emerald-100 text-emerald-700",
  },
  in_progress: {
    labelKey: "list.statuses.in_progress",
    color: "bg-yellow-100 text-yellow-700",
  },
  completed: {
    labelKey: "list.statuses.completed",
    color: "bg-purple-100 text-purple-700",
  },
}

export function TournamentList() {
  const router = useRouter()
  const { t } = useTournamentTranslation()
  return (
    <div className="mx-auto max-w-7xl p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-semibold text-gray-900">
              {t("list.title")}
            </h1>
            <p className="text-gray-600">{t("list.subtitle")}</p>
          </div>
          <Button
            onClick={() => router.push("/tournament/create")}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("list.createTournament")}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t("list.searchPlaceholder")}
              className="pl-10"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("list.statuses.all")}</SelectItem>
              <SelectItem value="draft">{t("list.statuses.draft")}</SelectItem>
              <SelectItem value="published">
                {t("list.statuses.published")}
              </SelectItem>
              <SelectItem value="open_registration">
                {t("list.statuses.open_registration")}
              </SelectItem>
              <SelectItem value="in_progress">
                {t("list.statuses.in_progress")}
              </SelectItem>
              <SelectItem value="completed">
                {t("list.statuses.completed")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tournament Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tournament) => (
          <Card
            key={tournament.id}
            onClick={() => router.push(`/tournament/${tournament.id}`)}
            className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
          >
            <div className="relative aspect-video overflow-hidden bg-gray-200">
              <img
                src={tournament.banner}
                alt={tournament.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge
                  className={
                    statusConfig[tournament.status as keyof typeof statusConfig]
                      .color
                  }
                >
                  {t(
                    statusConfig[tournament.status as keyof typeof statusConfig]
                      .labelKey
                  )}
                </Badge>
              </div>
            </div>
            <CardContent className="p-5">
              <h3 className="mb-3 font-semibold text-gray-900">
                {tournament.name}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {tournament.venue}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {tournament.startDate} - {tournament.endDate}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  {t("list.registered", {
                    count: tournament.registered,
                    capacity: tournament.capacity,
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
