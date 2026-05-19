"use client"

import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import ProgressBar from "./ProgressBar"

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  )
}

export default function PlaySessionSidebar({
  session,
  social,
  onJoin,
  onLeave,
}: {
  session: {
    joinedCount: number
    maxSlots: number
  }
  social: {
    organizers: Array<{ name: string; avatar?: string | null }>
    hostRole: string
    autoApproveJoinRequests: boolean
    cancellationFreezeHours: number
    isPrivate: boolean
    totalExpense?: number | null
    isParticipant?: boolean
    status: string
    hasAvailableSlots: boolean
  }
  onJoin: () => void
  onLeave: () => void
}) {
  return (
    <Card className="sticky top-6 h-fit p-0">
      <CardContent className="space-y-5 p-6">
        <div>
          <p className="text-sm text-muted-foreground">Participants</p>
          <h2 className="mt-1 text-3xl font-semibold">
            {session.joinedCount} / {session.maxSlots}
          </h2>
          <div className="mt-3 space-y-2">
            <ProgressBar
              value={(session.joinedCount / session.maxSlots) * 100}
            />
            <p className="text-xs text-muted-foreground">
              {session.maxSlots - session.joinedCount} spots remaining
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm text-muted-foreground">Hosted by</p>
          <div className="mt-3 flex items-center gap-3">
            <Avatar className="size-11">
              <AvatarImage
                src={social.organizers[0]?.avatar ?? undefined}
                alt={social.organizers[0]?.name ?? "Host"}
              />
              <AvatarFallback>
                {(social.organizers[0]?.name ?? "H").slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {social.organizers[0]?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {social.hostRole === "HOST_AND_PLAY"
                  ? "Host & Player"
                  : "Host Only"}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Settings</p>
          <div className="space-y-2 text-sm">
            <SettingRow
              label="Auto Approve"
              value={
                social.autoApproveJoinRequests
                  ? "Enabled"
                  : "Manual approval required"
              }
            />
            <SettingRow
              label="Cancellation Policy"
              value={`${social.cancellationFreezeHours} hours before event`}
            />
            <SettingRow
              label="Visibility"
              value={social.isPrivate ? "Private" : "Public"}
            />
          </div>
        </div>

        {social.totalExpense && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Payment</p>
              <div className="text-3xl font-semibold text-primary">
                ${social.totalExpense}
              </div>
            </div>
          </>
        )}

        {!social.isParticipant && social.status === "PUBLISHED" && (
          <Button
            className="w-full"
            size="lg"
            disabled={!social.hasAvailableSlots}
            onClick={onJoin}
          >
            {social.hasAvailableSlots ? "Join Session" : "Full"}
          </Button>
        )}

        {social.isParticipant && (
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={onLeave}
          >
            Leave Session
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
