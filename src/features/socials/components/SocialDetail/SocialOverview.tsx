"use client"

import { format } from "date-fns"
import { Check, Clock3, Info } from "lucide-react"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { GenderPolicy } from "@/features/socials/types"

import InfoRow from "./InfoRow"

function getGenderPolicyLabel(policy: GenderPolicy) {
  switch (policy) {
    case "MALE_ONLY":
      return "Men Only"
    case "FEMALE_ONLY":
      return "Women Only"
    case "MIXED":
      return "Mixed"
  }
}

export default function SocialOverview({
  social,
  duration,
}: {
  social: {
    startTime: string | Date
    note: string
    genderPolicy: GenderPolicy
    ageGroup: string
    minimumLevel?: string | number
    maximumLevel?: string | number
    submitDupr?: boolean
  }
  duration: number
}) {
  return (
    <Card className="p-0">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">About This Social</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {social.note}
          </p>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            icon={<Clock3 className="size-4" />}
            label="Schedule"
            value={format(new Date(social.startTime), "MMM d, yyyy • h:mm a")}
          />
          <InfoRow
            icon={<Clock3 className="size-4" />}
            label="Duration"
            value={`${duration} hours`}
          />
          <InfoRow
            icon={<Info className="size-4" />}
            label="Gender Policy"
            value={getGenderPolicyLabel(social.genderPolicy)}
          />
          <InfoRow
            icon={<Info className="size-4" />}
            label="Age Group"
            value={social.ageGroup}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-base font-semibold">Skill Level</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className="border-primary/20 bg-primary/10 text-primary"
              variant="outline"
            >
              {social.minimumLevel ?? "N/A"} - {social.maximumLevel ?? "N/A"}
            </Badge>
            {social.submitDupr && (
              <Badge variant="outline" className="gap-1">
                <Check className="size-3.5" />
                DUPR Submission
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            This social is designed for players with DUPR ratings between{" "}
            {social.minimumLevel ?? "N/A"} and {social.maximumLevel ?? "N/A"}.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
