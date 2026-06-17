"use client"

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  Search,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useTournamentListStore } from "../stores/tournament-list-store"
import type { Tournament, TournamentStatus } from "../types/tournament"
import { statusConfig } from "../utils/status"

interface TournamentListProps {
  initialTournaments?: Tournament[]
}

export function TournamentList({ initialTournaments }: TournamentListProps) {
  const router = useRouter()
  const { t } = useTournamentTranslation()

  const tournaments = useTournamentListStore((state) => state.tournaments)
  const search = useTournamentListStore((state) => state.filters.search)
  const status = useTournamentListStore((state) => state.filters.status)
  const currentPage = useTournamentListStore((state) => state.currentPage)
  const pageSize = useTournamentListStore((state) => state.pageSize)
  const setSearch = useTournamentListStore((state) => state.setSearch)
  const setStatus = useTournamentListStore((state) => state.setStatus)
  const setCurrentPage = useTournamentListStore((state) => state.setCurrentPage)
  const setTournaments = useTournamentListStore((state) => state.setTournaments)

  useEffect(() => {
    if (initialTournaments) {
      setTournaments(initialTournaments)
    }
  }, [initialTournaments, setTournaments])

  // Compute filtered and paginated list during render (referentially stable)
  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesStatus = status === "all" || tournament.status === status
    const matchesSearch =
      tournament.name.toLowerCase().includes(search.toLowerCase()) ||
      tournament.venue.toLowerCase().includes(search.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const totalPages = Math.ceil(filteredTournaments.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedTournaments = filteredTournaments.slice(
    startIndex,
    startIndex + pageSize
  )

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
          <div className="relative w-full flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t("list.searchPlaceholder")}
              className="text-md! h-12 pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={status}
            onValueChange={(val) => setStatus(val as TournamentStatus | "all")}
          >
            <SelectTrigger className="h-12! w-48">
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

      {/* Tournament Content */}
      {paginatedTournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-1 text-lg font-medium text-gray-900">
            {t("list.noResultsTitle", { defaultValue: "No tournaments found" })}
          </h3>
          <p className="text-sm text-gray-500">
            {t("list.noResultsDescription", {
              defaultValue: "Try adjusting your search or status filter.",
            })}
          </p>
        </div>
      ) : (
        <>
          {/* Tournament Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedTournaments.map((tournament) => (
              <Card
                key={tournament.id}
                onClick={() => router.push(`/tournament/${tournament.id}`)}
                className="cursor-pointer overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
                        statusConfig[
                          tournament.status as keyof typeof statusConfig
                        ].color
                      }
                    >
                      {t(
                        statusConfig[
                          tournament.status as keyof typeof statusConfig
                        ].labelKey
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
                        count: tournament.registered ?? 0,
                        capacity: tournament.capacity,
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="gap-1 pl-2.5"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>
                        {t("list.pagination.previous", {
                          defaultValue: "Previous",
                        })}
                      </span>
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-3 text-sm text-gray-500">
                      {t("list.pagination.pageInfo", {
                        currentPage,
                        totalPages,
                        defaultValue: `Page ${currentPage} of ${totalPages}`,
                      })}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="gap-1 pr-2.5"
                    >
                      <span>
                        {t("list.pagination.next", { defaultValue: "Next" })}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}
