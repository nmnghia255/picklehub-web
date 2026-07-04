"use client"

import {
  AlertCircle,
  Calendar,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserMinus,
} from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { usePersonnelStore } from "../../stores/use-personnel-store"
import type { Referee } from "../../types/referee"
import { EnrollRefereeDialog } from "./enroll-referee-dialog"

export function RefereesRoster() {
  const { t } = useTournamentTranslation()
  const [isPending, startTransition] = useTransition()

  // Store Hooks
  const referees = usePersonnelStore((s) => s.referees)
  const isLoadingReferees = usePersonnelStore((s) => s.isLoadingReferees)
  const refereeSearch = usePersonnelStore((s) => s.refereeSearch)
  const setRefereeSearch = usePersonnelStore((s) => s.setRefereeSearch)
  const fetchRoster = usePersonnelStore((s) => s.fetchRoster)
  const unenrollReferee = usePersonnelStore((s) => s.unenrollReferee)

  // Local Component State
  const [isEnrollOpen, setIsEnrollOpen] = useState(false)
  const [refereeToUnenroll, setRefereeToUnenroll] = useState<Referee | null>(
    null
  )

  // Handlers
  const handleUnenrollConfirm = async () => {
    if (!refereeToUnenroll) return

    startTransition(async () => {
      const res = await unenrollReferee(refereeToUnenroll.refereeId)
      if (res.success) {
        toast.success(
          t("personnel.roster.unenrollSuccess", {
            defaultValue: "Referee unenrolled from tournament",
          })
        )
        setRefereeToUnenroll(null)
      } else {
        toast.error(
          res.error ||
            t("personnel.roster.unenrollFailed", {
              defaultValue:
                "Failed to unenroll referee. Make sure they have no active assignments.",
            })
        )
      }
    })
  }

  // Derived stats
  const totalReferees = referees.length
  const totalAssignments = referees.reduce(
    (sum, r) => sum + (r.workload || 0),
    0
  )
  const avgWorkload =
    totalReferees > 0 ? (totalAssignments / totalReferees).toFixed(1) : "0"

  // Roster Filter (Client Side search matching)
  const filteredReferees = referees.filter((r) => {
    const query = refereeSearch.toLowerCase()
    return (
      r.refereeName.toLowerCase().includes(query) ||
      r.refereeEmail.toLowerCase().includes(query) ||
      r.refereeId.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="overflow-hidden border border-emerald-100 bg-white shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">
                  {t("personnel.stats.totalReferees")}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalReferees}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-emerald-100 bg-white shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">
                  {t("personnel.stats.activeAssignments")}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalAssignments}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-emerald-100 bg-white shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">
                  {t("personnel.stats.avgWorkload")}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {avgWorkload}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <RefreshCw className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roster Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("personnel.roster.searchPlaceholder")}
            className="bg-white pl-9"
            value={refereeSearch}
            onChange={(e) => setRefereeSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchRoster} className="bg-white">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("personnel.roster.reload")}
          </Button>
          <Button
            onClick={() => setIsEnrollOpen(true)}
            className="bg-emerald-600 font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("personnel.roster.enrollBtn")}
          </Button>
        </div>
      </div>

      {/* Roster Grid */}
      {isLoadingReferees ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-500">
            {t("personnel.roster.loading", {
              defaultValue: "Loading referees roster...",
            })}
          </p>
        </div>
      ) : filteredReferees.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 p-12 text-center">
          <UserMinus className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <CardTitle className="mb-1 text-lg font-medium text-gray-900">
            {t("personnel.roster.emptyTitle")}
          </CardTitle>
          <CardDescription className="mb-6 max-w-xs">
            {refereeSearch
              ? t("personnel.roster.emptySearch")
              : t("personnel.roster.emptyDesc")}
          </CardDescription>
          {!refereeSearch && (
            <Button
              onClick={() => setIsEnrollOpen(true)}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("personnel.roster.enrollFirst")}
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReferees.map((referee) => (
            <Card
              key={referee.id}
              className="group gap-0 overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-start gap-4 pb-4">
                <Avatar className="h-14 w-14 rounded-xl border border-gray-100 shadow-xs">
                  <AvatarImage
                    src={referee.refereeAvatar}
                    alt={referee.refereeName}
                  />
                  <AvatarFallback className="rounded-xl bg-emerald-50 text-lg font-semibold text-emerald-700">
                    {referee.refereeName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="truncate text-base font-semibold text-gray-900">
                      {referee.refereeName}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-lg text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setRefereeToUnenroll(referee)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge
                    variant="outline"
                    className="cursor-help border-gray-200 bg-gray-50 px-2 py-0 font-mono text-[10px] text-gray-600"
                    title={referee.refereeId}
                  >
                    {t("personnel.roster.idLabel")}:{" "}
                    {referee.refereeId.length > 30
                      ? `${referee.refereeId.substring(0, 16)}...${referee.refereeId.substring(referee.refereeId.length - 12)}`
                      : referee.refereeId}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">{referee.refereeEmail}</span>
                  </div>
                  {referee.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span>{referee.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span>
                      {t("personnel.roster.enrolledDate", {
                        date: new Date(referee.enrolledAt).toLocaleDateString(
                          "vi-VN"
                        ),
                      })}
                    </span>
                  </div>
                </div>

                {/* Workload Indicator */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-500">
                      {t("personnel.roster.workload")}
                    </span>
                    <span className="font-semibold text-emerald-700">
                      {t("personnel.roster.matchesCount", {
                        count: referee.workload || 0,
                      })}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{
                        width: `${Math.min((referee.workload || 0) * 20, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enroll Form Dialog */}
      <EnrollRefereeDialog
        isOpen={isEnrollOpen}
        onOpenChange={setIsEnrollOpen}
      />

      {/* Unenroll Confirmation Dialog */}
      <AlertDialog
        open={!!refereeToUnenroll}
        onOpenChange={(open) => !open && setRefereeToUnenroll(null)}
      >
        <AlertDialogContent className="rounded-xl bg-white shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-950">
              <AlertCircle className="h-5.5 w-5.5 text-red-600" />
              {t("personnel.roster.unenrollTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              {t("personnel.roster.unenrollDesc", {
                name: refereeToUnenroll?.refereeName,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>
              {t("personnel.roster.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnenrollConfirm}
              className="bg-red-600 font-semibold text-white hover:bg-red-700"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("personnel.roster.unenrollConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
