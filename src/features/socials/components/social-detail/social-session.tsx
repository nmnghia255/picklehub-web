"use client"

import { differenceInHours, format } from "date-fns"
import { Edit, Plus, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ProgressBar from "@/features/socials/components/social-listing/progress-bar"
import type { PlaySession } from "@/features/socials/types/play-session"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { getSessionStatusLabel } from "../../utils"

export default function SocialSessions({
  maxSlots,
  isHost,
  sessions,
  onCreateSession,
  onEditSession,
  onOpenSession,
}: {
  maxSlots: number
  isHost: boolean
  sessions: PlaySession[]
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
            {/* {isHost && ( */}
            <Button size="sm" onClick={onCreateSession}>
              <Plus className="mr-2 size-4" />
              {t("sessions.addSession")}
            </Button>
            {/* )} */}
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
              {t("sessions.noSessions")}
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const duration = differenceInHours(
                  new Date(session.endTime),
                  new Date(session.startTime)
                )

                return (
                  <Card
                    key={session.id}
                    className="cursor-pointer border-primary/20 p-0 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                    onClick={() => onOpenSession(session.id)}
                  >
                    <CardContent className="space-y-4 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-medium">{session.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {format(new Date(session.startTime), "h:mm a")} -{" "}
                            {format(new Date(session.endTime), "h:mm a")}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {/* {isHost && ( */}
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
                          {/* )} */}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getSessionStatusLabel(session.status, t)}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("sessions.participants")}</span>
                          <span>
                            {session.joinedCount} / {maxSlots}
                          </span>
                        </div>
                        <ProgressBar
                          value={(session.joinedCount / maxSlots) * 100}
                        />
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
