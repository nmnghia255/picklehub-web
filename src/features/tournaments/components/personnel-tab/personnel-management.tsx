"use client"

import { Mail, Shield, Users } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { usePersonnelStore } from "../../stores/use-personnel-store"
import type { TournamentEvent } from "../../types/tournament-event"
import { MatchAssignments } from "./match-assignments"
import { RefereeInvitationsList } from "./referee-invitations-list"
import { RefereesRoster } from "./referees-roster"

interface PersonnelManagementProps {
  tournamentId: string
  events: TournamentEvent[]
}

export function PersonnelManagement({
  tournamentId,
  events,
}: PersonnelManagementProps) {
  const { t } = useTournamentTranslation()

  // Store actions and state
  const setTournamentId = usePersonnelStore((s) => s.setTournamentId)
  const activeSubTab = usePersonnelStore((s) => s.activeSubTab)
  const setActiveSubTab = usePersonnelStore((s) => s.setActiveSubTab)
  const fetchRoster = usePersonnelStore((s) => s.fetchRoster)
  const fetchMatches = usePersonnelStore((s) => s.fetchMatches)
  const fetchInvitations = usePersonnelStore((s) => s.fetchInvitations)
  const reset = usePersonnelStore((s) => s.reset)

  // Initialize and synchronize tournament store data
  useEffect(() => {
    setTournamentId(tournamentId)
    fetchRoster()
    fetchMatches()
    fetchInvitations()

    return () => {
      reset()
    }
  }, [
    tournamentId,
    setTournamentId,
    fetchRoster,
    fetchMatches,
    fetchInvitations,
    reset,
  ])

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Top Banner and Tabs */}
      <div className="flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
            <Shield className="h-6 w-6 text-emerald-600" />
            {t("personnel.title")}
          </h2>
          <p className="text-sm text-gray-500">{t("personnel.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-lg bg-gray-100 p-1 md:self-auto">
          <Button
            variant={activeSubTab === "roster" ? "secondary" : "ghost"}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeSubTab === "roster"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-600 hover:text-emerald-600"
            }`}
            onClick={() => setActiveSubTab("roster")}
          >
            <Users className="mr-2 h-4 w-4" />
            {t("personnel.tabs.roster")}
          </Button>
          <Button
            variant={activeSubTab === "assignments" ? "secondary" : "ghost"}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeSubTab === "assignments"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-600 hover:text-emerald-600"
            }`}
            onClick={() => setActiveSubTab("assignments")}
          >
            <Shield className="mr-2 h-4 w-4" />
            {t("personnel.tabs.assignments")}
          </Button>
          <Button
            variant={activeSubTab === "invitations" ? "secondary" : "ghost"}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeSubTab === "invitations"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-600 hover:text-emerald-600"
            }`}
            onClick={() => setActiveSubTab("invitations")}
          >
            <Mail className="mr-2 h-4 w-4" />
            {t("personnel.tabs.invitations", { defaultValue: "Invitations" })}
          </Button>
        </div>
      </div>

      {activeSubTab === "roster" && <RefereesRoster />}
      {activeSubTab === "assignments" && <MatchAssignments events={events} />}
      {activeSubTab === "invitations" && <RefereeInvitationsList />}
    </div>
  )
}
