"use client"

import { Medal } from "lucide-react"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type { SocialParticipant } from "../../../types/social"

interface ParticipantWithStats extends SocialParticipant {
  matchesCount: number
  winsCount: number
}

interface SocialParticipantsTableProps {
  participants: ParticipantWithStats[]
}

export function SocialParticipantsTable({
  participants,
}: SocialParticipantsTableProps) {
  const { t } = useSocialsTranslation()

  // Map skill level rating to appropriate colors (Tailwind HSL styles)
  const getSkillLevelTone = (rating?: number | null) => {
    if (!rating) return "border-muted/30 bg-muted/10 text-muted-foreground"
    if (rating < 2.5)
      return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
    if (rating < 3.5)
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    if (rating < 4.5)
      return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
  }

  return (
    <Card className="border-border/60 bg-card/40 shadow-sm backdrop-blur">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {t("statistics.participants", {
                defaultValue: "Participants Summary",
              })}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t("matches.statistics.playerMatchesTitle", {
                defaultValue: "Matches played by each participant",
              })}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 px-3 py-1 font-semibold"
          >
            <Medal className="size-3.5 text-primary" />
            {participants.length}{" "}
            {t("statistics.playersCount", { defaultValue: "Players" })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[40%] py-3.5 pl-6 font-semibold">
                  {t("statistics.headers.participant", {
                    defaultValue: "Participant",
                  })}
                </TableHead>
                <TableHead className="w-[20%] py-3.5 text-center font-semibold">
                  {t("statistics.headers.level", { defaultValue: "Level" })}
                </TableHead>
                <TableHead className="w-[20%] py-3.5 text-right font-semibold">
                  {t("statistics.headers.matchesPlayed", {
                    defaultValue: "Matches Played",
                  })}
                </TableHead>
                <TableHead className="w-[20%] py-3.5 pr-6 text-right font-semibold">
                  {t("statistics.headers.wins", {
                    defaultValue: "Win Matches",
                  })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    {t("detail.noParticipants", {
                      defaultValue: "No participants yet.",
                    })}
                  </TableCell>
                </TableRow>
              ) : (
                participants.map((participant) => {
                  const rating = participant.user?.selfRating
                  const displayName =
                    participant.user?.name || t("common.unknownPlayer")

                  return (
                    <TableRow
                      key={participant.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      {/* Participant profile details */}
                      <TableCell className="py-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 border border-border/80">
                            <AvatarImage
                              src={participant.user?.avatarUrl ?? undefined}
                              alt={displayName}
                            />
                            <AvatarFallback className="bg-muted font-medium text-muted-foreground">
                              {displayName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {displayName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {participant.user?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Level badge */}
                      <TableCell className="py-3.5 text-center">
                        <Badge
                          variant="outline"
                          className={`px-2.5 py-0.5 text-xs font-semibold ${getSkillLevelTone(rating)}`}
                        >
                          {rating !== undefined && rating !== null
                            ? `${t("common.level", { defaultValue: "Level" })} ${rating.toFixed(1)}`
                            : t("common.na", { defaultValue: "N/A" })}
                        </Badge>
                      </TableCell>

                      {/* Matches Played Count */}
                      <TableCell className="py-3.5 text-right">
                        <Badge
                          variant={
                            participant.matchesCount > 0
                              ? "secondary"
                              : "outline"
                          }
                          className={`px-3 py-1 font-semibold ${participant.matchesCount > 0 ? "bg-primary/10 text-primary hover:bg-primary/10" : "text-muted-foreground"}`}
                        >
                          {t("matches.matrix.count", {
                            count: participant.matchesCount,
                          })}
                        </Badge>
                      </TableCell>

                      {/* Wins Count */}
                      <TableCell className="py-3.5 pr-6 text-right">
                        <Badge
                          variant={
                            participant.winsCount > 0 ? "secondary" : "outline"
                          }
                          className={`px-3 py-1 font-semibold ${participant.winsCount > 0 ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10" : "text-muted-foreground"}`}
                        >
                          {participant.winsCount}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
