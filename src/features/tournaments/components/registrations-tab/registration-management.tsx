"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  listTournamentRegistrationsAction,
  updateRegistrationStatusAction,
} from "../../actions/tournament-registration-actions"
import type { RegistrationResponse } from "../../types/registration"
import type { TournamentEvent } from "../../types/tournament-event"
import { PlayerDetailsSheet } from "./player-details-sheet"
import { RegistrationTable } from "./registration-table"

interface RegistrationManagementProps {
  tournamentId: string
  events?: TournamentEvent[]
}

export function RegistrationManagement({
  tournamentId,
  events = [],
}: RegistrationManagementProps) {
  const { t } = useTournamentTranslation()
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState<string>("all")
  const [selectedPlayer, setSelectedPlayer] =
    useState<RegistrationResponse | null>(null)

  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true)
    try {
      const eventFilter = selectedEventId === "all" ? "" : selectedEventId
      const res = await listTournamentRegistrationsAction(
        tournamentId,
        eventFilter,
        ""
      )
      if (res.success && res.data) {
        setRegistrations(res.data)
      } else {
        toast.error(res.error || "Failed to fetch registrations")
      }
    } catch (err) {
      console.error("Failed to load registrations:", err)
      toast.error("Failed to load registrations")
    } finally {
      setIsLoading(false)
    }
  }, [tournamentId, selectedEventId])

  useEffect(() => {
    if (tournamentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchRegistrations()
    }
  }, [tournamentId, fetchRegistrations])

  const handleApprove = async (reg: RegistrationResponse) => {
    try {
      const res = await updateRegistrationStatusAction(
        tournamentId,
        reg.id,
        "approved",
        reg.paymentStatus
      )
      if (res.success) {
        toast.success(
          t("registrations.approveSuccess", {
            defaultValue: `Approved registration for ${reg.player.name}`,
          })
        )
        fetchRegistrations()
      } else {
        toast.error(res.error || "Failed to approve registration")
      }
    } catch (error) {
      console.error("Approve error:", error)
      toast.error("Failed to approve registration")
    }
  }

  const handleReject = async (reg: RegistrationResponse) => {
    try {
      const res = await updateRegistrationStatusAction(
        tournamentId,
        reg.id,
        "rejected",
        reg.paymentStatus
      )
      if (res.success) {
        toast.success(
          t("registrations.rejectSuccess", {
            defaultValue: `Rejected registration for ${reg.player.name}`,
          })
        )
        fetchRegistrations()
      } else {
        toast.error(res.error || "Failed to reject registration")
      }
    } catch (error) {
      console.error("Reject error:", error)
      toast.error("Failed to reject registration")
    }
  }

  // Calculate counts dynamically from state
  const pendingCount = registrations.filter(
    (r) => r.status === "pending"
  ).length
  const approvedCount = registrations.filter(
    (r) => r.status === "approved"
  ).length
  const rejectedCount = registrations.filter(
    (r) => r.status === "rejected"
  ).length
  const waitlistedCount = registrations.filter(
    (r) => r.status === "waitlisted"
  ).length
  const withdrawnCount = registrations.filter(
    (r) => r.status === "withdrawn"
  ).length

  return (
    <div className="p-8">
      <div className="w-full">
        {/* Header & Filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-semibold text-gray-900">
              {t("registrations.title")}
            </h1>
            <p className="text-gray-600">{t("registrations.subtitle")}</p>
          </div>
          {events.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {t("registrations.filterEvent", {
                  defaultValue: "Filter Event",
                })}
                :
              </span>
              <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
              >
                <SelectTrigger className="w-64 bg-white">
                  <SelectValue
                    placeholder={t("registrations.allEvents", {
                      defaultValue: "All Events",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("registrations.allEvents", {
                      defaultValue: "All Events",
                    })}
                  </SelectItem>
                  {events.map((evt) => (
                    <SelectItem key={evt.id} value={evt.id.toString()}>
                      {evt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              {t("registrations.tabs.pending", { count: pendingCount })}
            </TabsTrigger>
            <TabsTrigger value="approved">
              {t("registrations.tabs.approved", { count: approvedCount })}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              {t("registrations.tabs.rejected", { count: rejectedCount })}
            </TabsTrigger>
            <TabsTrigger value="waitlisted">
              {t("registrations.tabs.waitlisted", { count: waitlistedCount })}
            </TabsTrigger>
            <TabsTrigger value="withdrawn">
              {t("registrations.tabs.withdrawn", { count: withdrawnCount })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <Card className="gap-0 py-0">
              <CardContent className="p-6">
                <RegistrationTable
                  registrations={registrations.filter(
                    (r) => r.status === "pending"
                  )}
                  status="pending"
                  isLoading={isLoading}
                  onViewDetails={setSelectedPlayer}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <Card className="gap-0 py-0">
              <CardContent className="p-6">
                <RegistrationTable
                  registrations={registrations.filter(
                    (r) => r.status === "approved"
                  )}
                  status="approved"
                  isLoading={isLoading}
                  onViewDetails={setSelectedPlayer}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <Card className="gap-0 py-0">
              <CardContent className="p-6">
                <RegistrationTable
                  registrations={registrations.filter(
                    (r) => r.status === "rejected"
                  )}
                  status="rejected"
                  isLoading={isLoading}
                  onViewDetails={setSelectedPlayer}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlisted" className="mt-6">
            <Card className="gap-0 py-0">
              <CardContent className="p-6">
                <RegistrationTable
                  registrations={registrations.filter(
                    (r) => r.status === "waitlisted"
                  )}
                  status="waitlisted"
                  isLoading={isLoading}
                  onViewDetails={setSelectedPlayer}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawn" className="mt-6">
            <Card className="gap-0 py-0">
              <CardContent className="p-6">
                <RegistrationTable
                  registrations={registrations.filter(
                    (r) => r.status === "withdrawn"
                  )}
                  status="withdrawn"
                  isLoading={isLoading}
                  onViewDetails={setSelectedPlayer}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Player Details Sheet */}
        <PlayerDetailsSheet
          registration={selectedPlayer}
          isOpen={!!selectedPlayer}
          onOpenChange={(open) => {
            if (!open) setSelectedPlayer(null)
          }}
        />
      </div>
    </div>
  )
}
