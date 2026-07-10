"use client"

import { CheckCircle, Search, Users, XCircle } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { CheckIn } from "../../types/checkin"
import type { RegistrationResponse } from "../../types/registration"

interface PlayerCheckinCardProps {
  registrations: RegistrationResponse[]
  checkins: CheckIn[]
  onCheckInPlayer: (
    regId: number | string,
    playerIndex: "player1" | "player2"
  ) => void
  isCheckingIn: boolean
}

export function PlayerCheckinCard({
  registrations,
  checkins,
  onCheckInPlayer,
  isCheckingIn,
}: PlayerCheckinCardProps) {
  const { t } = useTournamentTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReg, setSelectedReg] = useState<RegistrationResponse | null>(
    null
  )

  // Search filter registrations
  const filteredRegs =
    searchQuery.trim() === ""
      ? []
      : registrations.filter((r) => {
          const query = searchQuery.toLowerCase()
          const p1Name = r.player?.name?.toLowerCase() || ""
          const p2Name = r.partner?.name?.toLowerCase() || ""
          const regIdStr = r.id.toString()
          return (
            p1Name.includes(query) ||
            p2Name.includes(query) ||
            regIdStr.includes(query)
          )
        })

  // Get matching checkin details for selected registration
  const selectedCheckin = selectedReg
    ? checkins.find((c) => String(c.registrationId) === String(selectedReg.id))
    : null

  // Map checkins to their matching registrations
  const checkedInTeams = checkins
    .map((c) => {
      const reg = registrations.find(
        (r) => String(r.id) === String(c.registrationId)
      )
      return { checkin: c, reg }
    })
    .sort(
      (a, b) =>
        new Date(b.checkin.updatedAt).getTime() -
        new Date(a.checkin.updatedAt).getTime()
    )

  // Total checked-in players count
  const checkinsCount = checkins.reduce((count, c) => {
    return count + (c.player1CheckedIn ? 1 : 0) + (c.player2CheckedIn ? 1 : 0)
  }, 0)

  return (
    <Card className="gap-0 border-gray-200 shadow-sm lg:col-span-2">
      <CardHeader className="border-b pb-0">
        <CardTitle className="text-base font-bold text-gray-800">
          {t("liveControl.checkin.title", {
            defaultValue: "Desk Player Check-In",
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          {/* Left Column: Player Search & Actions */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("liveControl.checkin.searchPlaceholder", {
                  defaultValue:
                    "Search athlete name, partner name, or registration ID...",
                })}
                className="bg-white pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedReg(null) // Reset selection when searching
                }}
              />
            </div>

            {/* Query Results Dropdown */}
            {searchQuery && !selectedReg && (
              <div className="max-h-48 divide-y overflow-y-auto rounded-md border bg-white shadow-md">
                {filteredRegs.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    {t("liveControl.checkin.noMatchingRegs", {
                      defaultValue: "No matching registrations found",
                    })}
                  </div>
                ) : (
                  filteredRegs.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedReg(r)
                        setSearchQuery("")
                      }}
                      className="flex cursor-pointer items-center justify-between p-3 text-sm hover:bg-emerald-50/30"
                    >
                      <div>
                        <span className="font-semibold text-gray-900">
                          {r.player?.name}
                        </span>
                        {r.partner && (
                          <span className="text-xs text-gray-500">
                            {" "}
                            (with {r.partner.name})
                          </span>
                        )}
                        <div className="text-xs text-gray-400">
                          {t("liveControl.checkin.eventLabel", {
                            defaultValue: "Event:",
                          })}{" "}
                          {r.event}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ID: {r.id}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Check-In Details & Actions */}
            {selectedReg ? (
              <div className="space-y-4 rounded-lg border bg-gray-50/40 p-5">
                <div className="flex items-start justify-between border-b pb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {selectedReg.player?.name}
                      {selectedReg.partner && ` & ${selectedReg.partner.name}`}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {t("liveControl.checkin.regDetail", {
                        id: selectedReg.id,
                        event: selectedReg.event,
                        defaultValue: `Registration ID: ${selectedReg.id} • Event: ${selectedReg.event}`,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReg(null)}
                    className="text-xs text-gray-400"
                  >
                    {t("liveControl.checkin.clearSelection", {
                      defaultValue: "Clear Selection",
                    })}
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Player 1 Checkin */}
                  <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      {selectedCheckin?.player1CheckedIn ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300" />
                      )}
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedReg.player?.name} (Player 1)
                        </span>
                        {selectedCheckin &&
                          selectedCheckin.player1CheckedInAt && (
                            <span className="block text-[10px] text-gray-400">
                              {t("liveControl.checkin.checkedInAt", {
                                time: new Date(
                                  selectedCheckin.player1CheckedInAt
                                ).toLocaleTimeString(),
                                defaultValue: `Checked in: ${new Date(selectedCheckin.player1CheckedInAt).toLocaleTimeString()}`,
                              })}
                            </span>
                          )}
                      </div>
                    </div>
                    {!selectedCheckin?.player1CheckedIn && (
                      <Button
                        size="sm"
                        disabled={isCheckingIn}
                        onClick={() =>
                          onCheckInPlayer(selectedReg.id, "player1")
                        }
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        {t("liveControl.checkin.btnCheckin", {
                          defaultValue: "Check In",
                        })}
                      </Button>
                    )}
                  </div>

                  {/* Player 2 Checkin (if doubles event) */}
                  {selectedReg.partner && (
                    <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        {selectedCheckin?.player2CheckedIn ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedReg.partner.name} (Player 2)
                          </span>
                          {selectedCheckin &&
                            selectedCheckin.player2CheckedInAt && (
                              <span className="block text-[10px] text-gray-400">
                                {t("liveControl.checkin.checkedInAt", {
                                  time: new Date(
                                    selectedCheckin.player2CheckedInAt
                                  ).toLocaleTimeString(),
                                  defaultValue: `Checked in: ${new Date(selectedCheckin.player2CheckedInAt).toLocaleTimeString()}`,
                                })}
                              </span>
                            )}
                        </div>
                      </div>
                      {!selectedCheckin?.player2CheckedIn && (
                        <Button
                          size="sm"
                          disabled={isCheckingIn}
                          onClick={() =>
                            onCheckInPlayer(selectedReg.id, "player2")
                          }
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {t("liveControl.checkin.btnCheckin", {
                            defaultValue: "Check In",
                          })}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed bg-gray-50/20 p-8 text-center text-sm text-gray-400">
                <Users className="mx-auto mb-2 h-8 w-8 animate-pulse text-gray-300" />
                {t("liveControl.checkin.noRegSelected", {
                  defaultValue:
                    "Select a player registration above to manage check-in.",
                })}
              </div>
            )}
          </div>

          {/* Right Column: Checked-In Teams Section */}
          <div className="flex flex-col self-stretch border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                {t("liveControl.checkin.listTitle", {
                  defaultValue: "Checked-in Teams & Players",
                })}
              </h3>
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-700"
              >
                {checkinsCount}{" "}
                {t("liveControl.checkin.checkedInCountLabel", {
                  defaultValue: "Checked In",
                })}
              </Badge>
            </div>

            {checkedInTeams.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-md border border-dashed bg-gray-50/50 py-8 text-center text-xs text-gray-400">
                {t("liveControl.checkin.noCheckinsYet", {
                  defaultValue: "No check-ins recorded yet.",
                })}
              </div>
            ) : (
              <div className="max-h-[280px] flex-1 divide-y overflow-y-auto rounded-md border bg-white dark:bg-zinc-900">
                {checkedInTeams.map(({ reg, checkin }) => {
                  return (
                    <div
                      key={checkin.id}
                      className="flex flex-col p-3 text-xs hover:bg-gray-50/50 md:text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 dark:text-zinc-100">
                          {reg?.player?.name || "Unknown Player"}
                          {reg?.partner && ` & ${reg.partner.name}`}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ID: {reg?.id || checkin.registrationId}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-gray-500">
                        <span>{reg?.event || ""}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span
                            className={
                              checkin.player1CheckedIn
                                ? "font-semibold text-emerald-600"
                                : "text-gray-400"
                            }
                          >
                            {reg?.player?.name || "Player 1"}
                          </span>
                          {checkin.player1CheckedIn ? (
                            <CheckCircle className="inline h-3 w-3 text-emerald-600" />
                          ) : (
                            <span className="rounded bg-gray-100 px-1 text-[9px] text-gray-400">
                              {t("liveControl.checkin.pending", {
                                defaultValue: "Pending",
                              })}
                            </span>
                          )}
                        </div>
                        {reg?.partner && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <span
                                className={
                                  checkin.player2CheckedIn
                                    ? "font-semibold text-emerald-600"
                                    : "text-gray-400"
                                }
                              >
                                {reg.partner.name}
                              </span>
                              {checkin.player2CheckedIn ? (
                                <CheckCircle className="inline h-3 w-3 text-emerald-600" />
                              ) : (
                                <span className="rounded bg-gray-100 px-1 text-[9px] text-gray-400">
                                  {t("liveControl.checkin.pending", {
                                    defaultValue: "Pending",
                                  })}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
