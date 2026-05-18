"use client"

import { Activity, Plus } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"

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
  const totalMatches =
    matches.inProgress.length +
    matches.scheduled.length +
    matches.completed.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Match Schedule</h2>
        {isHost && (
          <Button size="sm" onClick={onCreateMatch}>
            <Plus className="size-4" />
            Create Match
          </Button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {totalMatches === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            <Activity className="mx-auto mb-3 size-10 text-muted-foreground" />
            No matches scheduled yet.
          </div>
        ) : (
          <>
            {matches.inProgress.length > 0 && (
              <SectionLabel tone="warning">IN PROGRESS</SectionLabel>
            )}
            {matches.inProgress.map((match) => (
              <MatchCard key={match.id} match={match} isHost={isHost} />
            ))}

            {matches.scheduled.length > 0 && (
              <SectionLabel tone="primary">SCHEDULED</SectionLabel>
            )}
            {matches.scheduled.map((match) => (
              <MatchCard key={match.id} match={match} isHost={isHost} />
            ))}

            {matches.completed.length > 0 && (
              <SectionLabel tone="success">COMPLETED</SectionLabel>
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
