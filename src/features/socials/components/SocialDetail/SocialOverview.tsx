"use client"

import { format } from "date-fns"
import { Check, Clock3, Info } from "lucide-react"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { GenderPolicy } from "@/features/socials/types"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import InfoRow from "./InfoRow"

export default function SocialOverview({
  social,
}: {
  social: {
    startTime: string | Date | null
    note: string | null
    genderPolicy: GenderPolicy
    ageGroup: string
    minimumLevel?: string | number
    maximumLevel?: string | number
    submitDupr?: boolean
  }
}) {
  const { t } = useSocialsTranslation()

  function getGenderPolicyLabel(policy: GenderPolicy) {
    switch (policy) {
      case "ANY":
        return t("filters.all")
      case "MALE_ONLY":
        return t("labels.menOnly")
      case "FEMALE_ONLY":
        return t("labels.womenOnly")
      case "MIXED_ONLY":
        return t("labels.mixed")
      default:
        return t("labels.mixed")
    }
  }

  return (
    <Card className="p-0">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">
            {t("detail.aboutThisSocial")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {social.note ?? ""}
          </p>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            icon={<Clock3 className="size-4" />}
            label={t("detail.schedule")}
            value={
              social.startTime
                ? format(new Date(social.startTime), "MMM d, yyyy • h:mm a")
                : t("common.na")
            }
          />
          <InfoRow
            icon={<Info className="size-4" />}
            label={t("detail.genderPolicy")}
            value={getGenderPolicyLabel(social.genderPolicy)}
          />
          <InfoRow
            icon={<Info className="size-4" />}
            label={t("detail.ageGroup")}
            value={t(`labels.${social.ageGroup.toLowerCase()}`)}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-base font-semibold">{t("detail.skillLevel")}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className="border-primary/20 bg-primary/10 text-primary"
              variant="outline"
            >
              {social.minimumLevel ?? t("common.na")} -{" "}
              {social.maximumLevel ?? t("common.na")}
            </Badge>
            {social.submitDupr && (
              <Badge variant="outline" className="gap-1">
                <Check className="size-3.5" />
                {t("detail.submitDupr")}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t("detail.skillLevelDescription", {
              minimum: social.minimumLevel ?? t("common.na"),
              maximum: social.maximumLevel ?? t("common.na"),
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
