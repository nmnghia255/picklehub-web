"use client"

import { Grid, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useGroupStageStore } from "../../stores/use-group-stage-store"

interface GroupStandingsGridProps {
  isEditable: boolean
}

export function GroupStandingsGrid({ isEditable }: GroupStandingsGridProps) {
  const { t } = useTournamentTranslation()
  const groups = useGroupStageStore((s) => s.groups)
  const advancePerGroup = useGroupStageStore((s) => s.advancePerGroup)

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-6 w-6 text-gray-700" />
        <h2 className="text-xl font-semibold text-gray-900">
          {t("groupStage.standingsTitle", {
            defaultValue: "Groups & Standings",
          })}
        </h2>
      </div>

      {groups.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-0 border-gray-200 bg-white p-12 text-center">
          <div className="mb-4 rounded-full bg-gray-50 p-4">
            <Grid className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-gray-950">
            {t("groupStage.noGroupsDrawnYet", {
              defaultValue: "No Groups Drawn Yet",
            })}
          </h3>
          <p className="max-w-md text-sm text-gray-500">
            {isEditable
              ? t("groupStage.noGroupsHostDesc", {
                  defaultValue:
                    "Configure settings and click 'Draw Groups' to initialize the group stage divisions.",
                })
              : t("groupStage.noGroupsUserDesc", {
                  defaultValue:
                    "Standings and groups are not available yet. The host has not performed the group draw.",
                })}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="gap-0 overflow-hidden border-gray-200 bg-white py-0 shadow-sm"
            >
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <CardTitle className="pt-4 text-lg font-semibold text-gray-900">
                  {group.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50/75">
                    <TableRow>
                      <TableHead className="w-12 text-center text-xs font-semibold text-gray-500 uppercase">
                        Pos
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">
                        Team
                      </TableHead>
                      <TableHead className="w-12 text-center text-xs font-semibold text-gray-500 uppercase">
                        W
                      </TableHead>
                      <TableHead className="w-12 text-center text-xs font-semibold text-gray-500 uppercase">
                        D
                      </TableHead>
                      <TableHead className="w-12 text-center text-xs font-semibold text-gray-500 uppercase">
                        L
                      </TableHead>
                      <TableHead className="w-16 text-center text-xs font-semibold text-gray-500 uppercase">
                        Diff
                      </TableHead>
                      <TableHead className="w-16 text-center text-xs font-semibold text-gray-500 uppercase">
                        Pts
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.memberships.map((membership, idx) => {
                      const isAdvancingRow = idx < advancePerGroup
                      return (
                        <TableRow
                          key={membership.id}
                          className={
                            membership.isAdvanced
                              ? "bg-emerald-50/30 hover:bg-emerald-50/50"
                              : isAdvancingRow
                                ? "bg-gray-50/20"
                                : ""
                          }
                        >
                          <TableCell className="text-center font-medium text-gray-900">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="min-w-[120px] py-3 font-medium wrap-break-word whitespace-normal text-gray-900">
                            <div className="flex flex-col gap-1">
                              <div className="text-sm leading-snug">
                                <span>{membership.teamName}</span>
                                {membership.isAdvanced && (
                                  <Badge className="ml-1.5 inline-flex items-center border-none bg-emerald-100 px-1.5 py-0.5 align-middle text-[10px] font-semibold text-emerald-800 shadow-none hover:bg-emerald-100">
                                    Q
                                  </Badge>
                                )}
                              </div>
                              {membership.seed && (
                                <span className="text-[10px] text-gray-500">
                                  Seed {membership.seed}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-gray-700">
                            {membership.wins}
                          </TableCell>
                          <TableCell className="text-center text-gray-700">
                            {membership.draws}
                          </TableCell>
                          <TableCell className="text-center text-gray-700">
                            {membership.losses}
                          </TableCell>
                          <TableCell className="text-center text-gray-600">
                            {membership.gameDiff > 0
                              ? `+${membership.gameDiff}`
                              : membership.gameDiff}
                          </TableCell>
                          <TableCell className="text-center font-bold text-gray-900">
                            {membership.points}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
