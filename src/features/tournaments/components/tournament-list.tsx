"use client"

import { format } from "date-fns"
import { Calendar, Loader2, MapPin, Plus, Search, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

import { Pagination } from "@/components/common/pagination"
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

import {
  getMyTournamentsAction,
  getTournamentsAction,
} from "../actions/tournament-actions"
import { useTournamentListStore } from "../stores/tournament-list-store"
import type { Tournament, TournamentStatus } from "../types/tournament"
import { statusConfig } from "../utils/status"

interface TournamentListProps {
  initialTournaments?: Tournament[]
  initialTotalItems?: number
  initialTotalPages?: number
  mode?: "public" | "management"
}

export function TournamentList({
  initialTournaments,
  initialTotalItems,
  initialTotalPages,
  mode = "public",
}: TournamentListProps) {
  const router = useRouter()
  const { t } = useTournamentTranslation()

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd-MM-yyyy")
    } catch {
      return dateStr
    }
  }

  const tournaments = useTournamentListStore((state) => state.tournaments)
  const search = useTournamentListStore((state) => state.filters.search)
  const status = useTournamentListStore((state) => state.filters.status)
  const role = useTournamentListStore((state) => state.filters.role)
  const currentPage = useTournamentListStore((state) => state.currentPage)
  const pageSize = useTournamentListStore((state) => state.pageSize)
  const totalPages = useTournamentListStore((state) => state.totalPages)
  const isLoading = useTournamentListStore((state) => state.isLoading)

  const setSearch = useTournamentListStore((state) => state.setSearch)
  const setRole = useTournamentListStore((state) => state.setRole)
  const setStatus = useTournamentListStore((state) => state.setStatus)
  const setCurrentPage = useTournamentListStore((state) => state.setCurrentPage)
  const setTournaments = useTournamentListStore((state) => state.setTournaments)
  const setPagination = useTournamentListStore((state) => state.setPagination)
  const setIsLoading = useTournamentListStore((state) => state.setIsLoading)

  const isInitialized = useRef(false)

  // Sync initial values into the store on mount
  useEffect(() => {
    if (!isInitialized.current && initialTournaments) {
      setTournaments(initialTournaments)
      if (initialTotalItems !== undefined && initialTotalPages !== undefined) {
        setPagination(initialTotalItems, initialTotalPages)
      }
      isInitialized.current = true
    }
  }, [
    initialTournaments,
    initialTotalItems,
    initialTotalPages,
    setTournaments,
    setPagination,
  ])

  // Fetch data on filter or page changes
  useEffect(() => {
    // Skip the very first fetch on mount since the server already loaded the initial page
    if (!isInitialized.current) {
      return
    }

    let active = true
    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true)
      try {
        const result =
          mode === "management"
            ? await getMyTournamentsAction(role, currentPage, pageSize)
            : await getTournamentsAction(search, status, currentPage, pageSize)
        if (active) {
          if (result.success && result.data) {
            setTournaments(result.data)
            const total = result.meta?.total ?? result.data.length
            setPagination(
              total,
              result.meta?.totalPages ?? Math.ceil(total / pageSize)
            )
          }
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }, 200) // 400ms debounce

    return () => {
      active = false
      clearTimeout(delayDebounceFn)
    }
  }, [
    mode,
    search,
    status,
    role,
    currentPage,
    pageSize,
    setTournaments,
    setPagination,
    setIsLoading,
  ])

  function handleNavigation(tournament: Tournament) {
    if (mode === "management") {
      router.push(`/tournament-management/${tournament.id}`)
    } else {
      router.push(`/tournaments/${tournament.id}`)
    }
  }

  function handleCreateTournament() {
    router.push("/tournament-management/create")
  }

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
          {mode === "management" && (
            <Button
              onClick={handleCreateTournament}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("list.createTournament")}
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          {mode === "management" ? (
            <Select value={role} onValueChange={(val) => setRole(val)}>
              <SelectTrigger className="h-12! w-64 bg-white">
                <SelectValue
                  placeholder={t("list.roles.all", {
                    defaultValue: "All Roles",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("list.roles.all", { defaultValue: "All Roles" })}
                </SelectItem>
                <SelectItem value="organizer">
                  {t("list.roles.organizer", { defaultValue: "Organizer" })}
                </SelectItem>
                <SelectItem value="player">
                  {t("list.roles.player", { defaultValue: "Player" })}
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <>
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
                onValueChange={(val) =>
                  setStatus(val as TournamentStatus | "all")
                }
              >
                <SelectTrigger className="h-12! w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("list.statuses.all")}</SelectItem>
                  <SelectItem value="draft">
                    {t("list.statuses.draft")}
                  </SelectItem>
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
            </>
          )}
        </div>
      </div>

      {/* Tournament Content */}
      <div className="relative min-h-100">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
        )}

        {tournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              {t("list.noResultsTitle", {
                defaultValue: "No tournaments found",
              })}
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
              {tournaments.map((tournament) => (
                <Card
                  key={tournament.id}
                  onClick={() => handleNavigation(tournament)}
                  className="cursor-pointer overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden bg-gray-200">
                    <img
                      src={tournament.banner || undefined}
                      alt={tournament.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      {(() => {
                        const statusKey = (
                          tournament.status || "draft"
                        ).toLowerCase() as TournamentStatus
                        const config =
                          statusConfig[statusKey] || statusConfig.draft
                        return (
                          <Badge className={config.color}>
                            {t(config.labelKey)}
                          </Badge>
                        )
                      })()}
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
                        {formatDate(tournament.startDate)} •{" "}
                        {formatDate(tournament.endDate)}
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
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  variant="simple"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
