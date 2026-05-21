"use client"

import { Activity, Plus } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import { useSocialsTranslation } from "@/features/socials/use-socials-translation"

import MatchCard from "./MatchCard"

function SectionLabel({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: "warning" | "primary" | "success"
}) {
  const classes =
    tone === "warning"
      ? "text-amber-600"
      : tone === "primary"
        ? "text-primary"
        : "text-emerald-600"
  return (
    <p className={`text-xs font-semibold tracking-[0.2em] ${classes}`}>
      {children}
    </p>
  )
}

export default function PlaySessionMatches({
  isHost,
  matches,
  onCreateMatch,
}: {
  isHost: boolean
  matches: {
    inProgress: Parameters<typeof MatchCard>[0]["match"][]
    scheduled: Parameters<typeof MatchCard>[0]["match"][]
    completed: Parameters<typeof MatchCard>[0]["match"][]
  }
  onCreateMatch: () => void
}) {
  const { t } = useSocialsTranslation()

  const totalMatches =
    matches.inProgress.length +
    matches.scheduled.length +
    matches.completed.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("matches.title")}</h2>
        {isHost && (
          <Button size="sm" onClick={onCreateMatch}>
            <Plus className="size-4" />
            {t("matches.createMatch")}
          </Button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {totalMatches === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            <Activity className="mx-auto mb-3 size-10 text-muted-foreground" />
            {t("matches.noMatches")}
          </div>
        ) : (
          <>
            {matches.inProgress.length > 0 && (
              <SectionLabel tone="warning">
                {t("labels.inProgress")}
              </SectionLabel>
            )}
            {matches.inProgress.map((match) => (
              <MatchCard key={match.id} match={match} isHost={isHost} />
            ))}

            {matches.scheduled.length > 0 && (
              <SectionLabel tone="primary">
                {t("labels.scheduled")}
              </SectionLabel>
            )}
            {matches.scheduled.map((match) => (
              <MatchCard key={match.id} match={match} isHost={isHost} />
            ))}

            {matches.completed.length > 0 && (
              <SectionLabel tone="success">
                {t("labels.completed")}
              </SectionLabel>
            )}
            {matches.completed.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isHost={isHost}
                completed
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
