"use client"

import { differenceInMinutes } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Match } from "@/features/socials/mock-data/mockSessionData"
import { mockMatches } from "@/features/socials/mock-data/mockSessionData"
import usePlaySessionStore from "@/features/socials/stores/play-session-store"
import type {
  PlaySession,
  PlaySessionParticipant,
} from "@/features/socials/types/play-session"
import type { SocialDetail } from "@/features/socials/types/social"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import PlaySessionMatches from "./play-session-matches"
import PlaySessionOverview from "./play-session-overview"
import PlaySessionParticipants from "./play-session-participants"
import PlaySessionSidebar from "./play-session-sidebar"

interface PlaySessionDetailProps {
  initialSocial: SocialDetail | null
  initialSession: PlaySession | null
  initialParticipants: PlaySessionParticipant[]
}

export default function PlaySessionDetail({
  initialSocial,
  initialSession,
  initialParticipants,
}: PlaySessionDetailProps) {
  const params = useParams()
  const router = useRouter()
  const { t } = useSocialsTranslation()
  const tabValue = usePlaySessionStore((s) => s.tabValue)
  const setTabValue = usePlaySessionStore((s) => s.setTabValue)

  const socialId = params.socialId as string | undefined
  const sessionId = params.playSessionId as string | undefined
  const social = initialSocial
  const session = initialSession

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

  const isHost = Boolean(social.isHost)
  const duration = differenceInMinutes(
    new Date(session.endTime),
    new Date(session.startTime)
  )

  const matches = mockMatches
  const completedMatches: Match[] =
    (matches.filter(
      (match: Match) => match.status === "COMPLETED"
    ) as Match[]) || []
  const inProgressMatches: Match[] =
    (matches.filter(
      (match: Match) => match.status === "IN_PROGRESS"
    ) as Match[]) || []
  const scheduledMatches: Match[] =
    (matches.filter(
      (match: Match) => match.status === "SCHEDULED"
    ) as Match[]) || []

  const participants = initialParticipants

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl font-semibold tracking-tight">
            {session.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{social.title}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("matches.creation.back")}
        </Button>
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
                    participants={participants}
                    duration={duration}
                    completedMatchesCount={completedMatches.length}
                    activeMatchesCount={inProgressMatches.length}
                    upcomingMatchesCount={scheduledMatches.length}
                  />
                )}

                {tabValue === "1" && (
                  <PlaySessionMatches
                    isHost={isHost}
                    matches={{
                      inProgress: inProgressMatches,
                      scheduled: scheduledMatches,
                      completed: completedMatches,
                    }}
                    onCreateMatch={() =>
                      router.push(
                        `/socials/${socialId}/play-session/${sessionId}/create-matches`
                      )
                    }
                  />
                )}

                {tabValue === "2" && (
                  <PlaySessionParticipants
                    participants={participants}
                    socialId={socialId || ""}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <PlaySessionSidebar
          session={session}
          social={social}
          onJoin={() => alert(t("sidebar.joinSession"))}
          onLeave={() => alert(t("sidebar.leaveSession"))}
        />
      </div>
    </div>
  )
}
