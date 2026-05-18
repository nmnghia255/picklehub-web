"use client"

import { format } from "date-fns"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function SocialParticipants({
  participants,
}: {
  participants?: Array<{
    id: string
    user: { name: string; avatar?: string | null }
    status: string
    skillLevel?: string | number | null
    joinedAt: string | Date
  }>
}) {
  return (
    <>
      <h2 className="text-lg font-semibold">Participants</h2>
      {!participants || participants.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          No participants yet.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between rounded-2xl border border-border/60 p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage
                    src={participant.user.avatar ?? undefined}
                    alt={participant.user.name}
                  />
                  <AvatarFallback>
                    {participant.user.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{participant.user.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge
                      className={
                        participant.status === "CONFIRMED"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                          : "border-border bg-muted text-muted-foreground"
                      }
                      variant="outline"
                    >
                      {participant.status}
                    </Badge>
                    {participant.skillLevel && (
                      <Badge variant="outline">
                        Level {participant.skillLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Joined {format(new Date(participant.joinedAt), "MMM d")}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
