"use client"

import { format } from "date-fns"
import {
  CalendarDays,
  Check,
  Filter,
  LockKeyhole,
  Search,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

import { AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { mockSocials } from "@/features/socials/mockData"

import FiltersDrawer from "./FiltersDrawer"
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

export default function SocialListing() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: "ALL",
    genderPolicy: "ALL",
    ageGroup: "ALL",
    format: "ALL",
    availableSlots: false,
  })

  const filteredSocials = mockSocials.filter((social) => {
    if (
      searchQuery &&
      !social.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    if (filters.status !== "ALL" && social.status !== filters.status)
      return false
    if (
      filters.genderPolicy !== "ALL" &&
      social.genderPolicy !== filters.genderPolicy
    )
      return false
    if (filters.ageGroup !== "ALL" && social.ageGroup !== filters.ageGroup)
      return false
    if (filters.format !== "ALL" && social.format !== filters.format)
      return false
    if (filters.availableSlots && !social.hasAvailableSlots) return false
    return true
  })

  return (
    <div>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 pl-10"
              placeholder="Search socials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="h-11 gap-2 md:w-auto"
            onClick={() => setFilterDrawerOpen(true)}
          >
            <Filter className="size-4" />
            Filters
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSocials.map((social) => (
            <Card
              key={social.id}
              className="group cursor-pointer overflow-hidden border-border/60 p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
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
                  <h2 className="line-clamp-2 text-lg font-semibold">
                    {social.title}
                  </h2>
                  <Badge
                    className={getStatusClasses(social.status)}
                    variant="outline"
                  >
                    {social.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="px-5 pt-4 pb-5">
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
                    <CalendarDays className="size-4" />
                    <span>
                      {format(
                        new Date(social.startTime),
                        "MMM d, yyyy • h:mm a"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4" />
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
                  <ProgressBar
                    value={(social.joinedCount / social.maxSlots) * 100}
                  />
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
                  variant={social.hasAvailableSlots ? "default" : "outline"}
                  disabled={!social.hasAvailableSlots}
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/socials/${social.id}`)
                  }}
                >
                  {social.hasAvailableSlots ? "View Details" : "Full"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <FiltersDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  )
}
