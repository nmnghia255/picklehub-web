"use client"

import { format } from "date-fns"
import { Check, LockKeyhole } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"

import { AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { Social } from "@/features/socials/types"

import ProgressBar from "./ProgressBar"
import UserAvatar from "./UserAvatar"

function getStatusClasses(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "border-primary/30 bg-primary/10 text-primary"
    case "COMPLETED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
    case "CANCELLED":
      return "border-destructive/30 bg-destructive/10 text-destructive"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

interface SocialCardProps {
  social: Social
}

export default function SocialCard({ social }: SocialCardProps) {
  const router = useRouter()

  return (
    <Card
      key={social.id}
      className="group flex h-full cursor-pointer flex-col overflow-hidden border-border/60 p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      onClick={() => router.push(`/socials/${social.id}`)}
    >
      <div className="relative flex h-48 items-center justify-center bg-linear-to-br from-sky-500 via-blue-600 to-violet-600">
        <span className="text-5xl drop-shadow-sm">🏓</span>
        {social.isPrivate && (
          <Badge
            className="absolute top-3 right-3 gap-1 border-white/20 bg-black/60 text-white backdrop-blur"
            variant="outline"
          >
            <LockKeyhole className="size-3.5" />
            Private
          </Badge>
        )}
        {social.isHost && (
          <Badge className="absolute top-3 left-3 border-primary/20 bg-primary text-primary-foreground">
            You&apos;re hosting
          </Badge>
        )}
        {social.isParticipant && !social.isHost && (
          <Badge className="text-white-800/60 absolute top-3 left-3 gap-1 border-emerald-500/30 bg-emerald-500">
            <Check className="size-3.5" />
            Joined
          </Badge>
        )}
      </div>

      <CardHeader className="space-y-0 px-5 pt-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 min-h-14 text-lg font-semibold">
            {social.title}
          </h2>
          <Badge className={getStatusClasses(social.status)} variant="outline">
            {social.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-5 pt-4 pb-5">
        <p className="mb-4 line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {social.note.length > 80
            ? `${social.note.slice(0, 80)}...`
            : social.note}
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="outline">{social.format}</Badge>
          <Badge variant="outline">{social.genderPolicy}</Badge>
          <Badge variant="outline">{social.ageGroup}</Badge>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-4">📅</div>
            <span>
              {format(new Date(social.startTime), "MMM d, yyyy • h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4">👥</div>
            <span>
              {social.playSessions.length} session
              {social.playSessions.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Participants</span>
            <span>
              {social.joinedCount} / {social.maxSlots}
            </span>
          </div>
          <ProgressBar value={(social.joinedCount / social.maxSlots) * 100} />
        </div>

        {social.organizers.length > 0 && (
          <div className="mt-5 flex items-center gap-3">
            <AvatarGroup>
              {social.organizers.slice(0, 3).map((organizer) => (
                <UserAvatar
                  key={organizer.id}
                  name={organizer.name}
                  avatar={organizer.avatar}
                />
              ))}
            </AvatarGroup>
            <div className="min-w-0 text-sm">
              <p className="truncate text-foreground">
                Hosted by {social.organizers[0].name}
              </p>
              {social.organizers.length > 1 && (
                <p className="text-muted-foreground">
                  {social.organizers.length} organizers
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-5 pb-5">
        <Button
          className="w-full"
          variant={social.hasAvailableSlots ? "default" : "destructive"}
          disabled={!social.hasAvailableSlots}
        >
          {social.hasAvailableSlots ? "Join" : "Full"}
        </Button>
      </CardFooter>
    </Card>
  )
}
