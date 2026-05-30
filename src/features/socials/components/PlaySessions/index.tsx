"use client"
"use client"

import { differenceInMinutes } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { usePlaySessionsQuery, useSocialDetailQuery } from "../../api/social-queries"
import PlaySessionMatches from "./PlaySessionMatches"
import PlaySessionOverview from "./PlaySessionOverview"
import PlaySessionParticipants from "./PlaySessionParticipants"
import PlaySessionSidebar from "./PlaySessionSidebar"

function getSessionStatusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "border-primary/30 bg-primary/10 text-primary"
    case "CANCELLED":
      return "border-destructive/30 bg-destructive/10 text-destructive"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

function getSessionStatusLabel(status: string, t: (key: string) => string) {
  switch (status) {
    case "ACTIVE":
      return t("labels.scheduled")
    case "CANCELLED":
      return t("labels.cancelled")
    default:
      return status
  }
}

export default function PlaySessionDetail() {
  const params = useParams()
  const router = useRouter()
  const { t } = useSocialsTranslation()
  const [tabValue, setTabValue] = React.useState("0")

  const socialId = params.socialId as string | undefined
  const sessionId = params.playSessionId as string | undefined
  const { data: social } = useSocialDetailQuery(socialId)
  const { data: sessions = [] } = usePlaySessionsQuery(socialId)
  const session = sessionId ? sessions.find((item) => item.id === sessionId) : undefined

  if (!social || !session) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">{t("detail.notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("detail.notFoundDescription")}
        </p>
        <Button className="mt-6" onClick={() => router.push("/socials")}>
          {t("detail.backToSocials")}
        </Button>
      </div>
    )
  }

  const duration = differenceInMinutes(new Date(session.endTime), new Date(session.startTime))

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/socials/${socialId}`)}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl font-semibold tracking-tight">
            {session.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{social.title}</p>
        </div>
        <Badge
          className={getSessionStatusClasses(session.status)}
          variant="outline"
        >
          {getSessionStatusLabel(session.status, t)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="p-0">
            <CardContent className="space-y-4 p-0">
              <div className="px-6 pt-4">
                <div className="inline-flex rounded-lg border border-border bg-background p-1 text-sm">
                  <button
                    className={`rounded-md px-3 py-1.5 ${tabValue === "0" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                    onClick={() => setTabValue("0")}
                  >
                    {t("detail.overview")}
                  </button>
                  <button
                    className={`rounded-md px-3 py-1.5 ${tabValue === "1" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                    onClick={() => setTabValue("1")}
                  >
                    {t("matches.title")}
                  </button>
                  <button
                    className={`rounded-md px-3 py-1.5 ${tabValue === "2" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                    onClick={() => setTabValue("2")}
                  >
                    {t("detail.participants")}
                  </button>
                </div>
              </div>

              <div className="px-6 pb-6">
                {tabValue === "0" && (
                  <PlaySessionOverview
                    session={session}
                    duration={duration}
                    completedMatchesCount={0}
                    activeMatchesCount={0}
                    upcomingMatchesCount={0}
                  />
                )}

                {tabValue === "1" && (
                  <PlaySessionMatches
                    isHost={Boolean(social.isHost)}
                    matches={{ inProgress: [], scheduled: [], completed: [] }}
                  />
                )}

                {tabValue === "2" && (
                  <PlaySessionParticipants
                    participants={session.participants?.map((p) => ({
                      id: p.id,
                      user: { name: p.userId, avatar: undefined },
                      status: p.status,
                      skillLevel: undefined,
                      joinedAt: p.joinedAt,
                    }))}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <PlaySessionSidebar
          session={{
            joinedCount: session.joinedCount,
            maxSlots: social.maxSlots,
          }}
          social={social}
          onJoin={() => alert(t("sidebar.joinSession"))}
          onLeave={() => alert(t("sidebar.leaveSession"))}
        />
      </div>
    </div>
  )
}
