"use client"

import { format } from "date-fns"
import { CalendarX, Edit, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import ProgressBar from "@/features/socials/components/social-listing/progress-bar"
import type { PlaySession } from "@/features/socials/types/play-session"
import {
  getPlaySessionCapacityText,
  getPlaySessionJoinedCount,
  hasAvailablePlaySessionSlots,
} from "@/features/socials/utils"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import { getSessionStatusClasses, getSessionStatusLabel } from "../../../utils"

export default function SocialSessions({
  sessions,
  isEditable,
  onCreateSession,
  onEditSession,
  onOpenSession,
}: {
  sessions: PlaySession[]
  isEditable: boolean
  onCreateSession: () => void
  onEditSession: (session: PlaySession) => void
  onOpenSession: (sessionId: string) => void
}) {
  const { t } = useSocialsTranslation()

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{t("sessions.title")}</h2>
            {isEditable && (
              <Button size="sm" onClick={onCreateSession}>
                <Plus className="mr-2 size-4" />
                {t("sessions.addSession")}
              </Button>
            )}
          </div>

          {sessions.length === 0 ? (
            <Empty className="my-6 border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarX className="size-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>{t("sessions.noSessions")}</EmptyTitle>
                <EmptyDescription>
                  {t("sessions.noSessionsDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const joinedCount = getPlaySessionJoinedCount(
                  session.joinedCount,
                  session.participants
                )
                const hasSlots = hasAvailablePlaySessionSlots(
                  joinedCount,
                  session.maxSlot
                )
                const progressValue =
                  session.maxSlot == null
                    ? 0
                    : (joinedCount / session.maxSlot) * 100

                return (
                  <Card
                    key={session.id}
                    className="group cursor-pointer border-border/80 bg-card p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    onClick={() => onOpenSession(session.id)}
                  >
                    <CardContent className="space-y-4 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-medium tracking-tight transition-colors group-hover:text-primary">
                            {session.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            <span suppressHydrationWarning>
                              {format(new Date(session.startTime), "h:mm a")} -{" "}
                              {format(new Date(session.endTime), "h:mm a")}
                            </span>
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isEditable && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditSession(session)
                                }}
                              >
                                <Edit className="size-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-500">
                          {formatCurrencyVnd(session.sessionFee)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getSessionStatusClasses(session.status)}
                          >
                            {getSessionStatusLabel(session.status, t)}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("sessions.participants")}</span>
                          <span>
                            {getPlaySessionCapacityText(
                              session.joinedCount,
                              session.maxSlot,
                              t("playSessionOverview.unlimited"),
                              session.participants
                            )}
                          </span>
                        </div>
                        <ProgressBar value={progressValue} />
                        {!hasSlots && session.maxSlot != null && (
                          <p className="text-xs text-destructive">
                            {t("sidebar.full")}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
