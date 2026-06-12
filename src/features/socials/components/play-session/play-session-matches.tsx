"use client"

import { Activity, ChevronDown, Plus } from "lucide-react"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import MatchCard from "./match-card"

function SectionLabel({
  children,
  tone,
  isExpanded,
  onToggle,
}: {
  children: React.ReactNode
  tone: "warning" | "primary" | "success"
  isExpanded: boolean
  onToggle: () => void
}) {
  const classes =
    tone === "warning"
      ? "text-amber-600"
      : tone === "primary"
        ? "text-slate-600 dark:text-slate-50"
        : "text-emerald-600"
  return (
    <button
      onClick={onToggle}
      className="group flex w-full items-center gap-2 text-left select-none focus:outline-none sm:w-auto"
    >
      <p className={`text-sm font-bold tracking-[0.1em] uppercase ${classes}`}>
        {children}
      </p>
      <ChevronDown
        className={`size-4 transition-transform duration-200 ${classes} ${isExpanded ? "" : "-rotate-90"}`}
      />
    </button>
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

  const [inProgressExpanded, setInProgressExpanded] = useState(true)
  const [scheduledExpanded, setScheduledExpanded] = useState(true)
  const [completedExpanded, setCompletedExpanded] = useState(true)

  const totalMatches =
    matches.inProgress.length +
    matches.scheduled.length +
    matches.completed.length

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-end">
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
              <div className="space-y-3">
                <SectionLabel
                  tone="warning"
                  isExpanded={inProgressExpanded}
                  onToggle={() => setInProgressExpanded(!inProgressExpanded)}
                >
                  {t("labels.inProgress")}
                </SectionLabel>
                {inProgressExpanded && (
                  <div className="space-y-4">
                    {matches.inProgress.map((match) => (
                      <MatchCard key={match.id} match={match} isHost={isHost} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {matches.scheduled.length > 0 && (
              <div className="space-y-3">
                <SectionLabel
                  tone="primary"
                  isExpanded={scheduledExpanded}
                  onToggle={() => setScheduledExpanded(!scheduledExpanded)}
                >
                  {t("labels.scheduled")}
                </SectionLabel>
                {scheduledExpanded && (
                  <div className="space-y-4">
                    {matches.scheduled.map((match) => (
                      <MatchCard key={match.id} match={match} isHost={isHost} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {matches.completed.length > 0 && (
              <div className="space-y-3">
                <SectionLabel
                  tone="success"
                  isExpanded={completedExpanded}
                  onToggle={() => setCompletedExpanded(!completedExpanded)}
                >
                  {t("labels.completed")}
                </SectionLabel>
                {completedExpanded && (
                  <div className="space-y-4">
                    {matches.completed.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        isHost={isHost}
                        completed
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
