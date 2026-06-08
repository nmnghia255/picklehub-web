"use client"

import { format } from "date-fns"
import { Check, Clock3, Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { GenderPolicy } from "@/features/socials/types/social"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type { SocialDetail } from "../../types/social"
import { InfoRow } from "./infor-row"

export default function SocialOverview({
  social,
  duration,
}: {
  social: SocialDetail
  duration: number
}) {
  const { t } = useSocialsTranslation()

  function getGenderPolicyLabel(policy: GenderPolicy) {
    switch (policy) {
      case "MALE_ONLY":
        return t("labels.menOnly")
      case "FEMALE_ONLY":
        return t("labels.womenOnly")
      case "MIXED_ONLY":
        return t("labels.mixedOnly")
      default:
        return t("labels.any")
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
            {social.note}
          </p>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            icon={<Clock3 className="size-5" />}
            label={t("detail.schedule")}
            value={format(new Date(social.startTime), "MMM d, yyyy • h:mm a")}
            iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />
          <InfoRow
            icon={<Clock3 className="size-5" />}
            label={t("detail.duration")}
            value={t("common.hours", { count: duration })}
            iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          />
          <InfoRow
            icon={<Info className="size-5" />}
            label={t("detail.genderPolicy")}
            value={getGenderPolicyLabel(social.genderPolicy)}
            iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
          <InfoRow
            icon={<Info className="size-5" />}
            label={t("detail.ageGroup")}
            value={t(`labels.${social.ageGroup.toLowerCase()}`)}
            iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-base font-semibold">{t("detail.skillLevel")}</h3>
          {social.minimumLevel === null && social.maximumLevel === null ? (
            <p className="text-sm text-muted-foreground">
              {t("detail.noSkillLevelLimit", {
                defaultValue: "All skill levels welcome",
              })}
            </p>
          ) : (
            <>
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
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
