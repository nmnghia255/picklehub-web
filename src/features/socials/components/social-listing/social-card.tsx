"use client"

import { format } from "date-fns"
import { Check, LockKeyhole } from "lucide-react"
import { useRouter } from "next/navigation"

// import { AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { ListSocialResponse as Social } from "@/features/socials/types/social"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { getStatusClasses } from "../../utils"
import ProgressBar from "./progress-bar"
// import UserAvatar from "./UserAvatar"

interface SocialCardProps {
  social: Social
}

export default function SocialCard({ social }: SocialCardProps) {
  const router = useRouter()
  const { t } = useSocialsTranslation()

  const formatLabel = t(`labels.${social.format.toLowerCase()}`)
  const ageGroupLabel = t(`labels.${social.ageGroup.toLowerCase()}`)

  const getGenderPolicyLabel = () => {
    switch (social.genderPolicy) {
      case "MALE_ONLY":
        return t("labels.menOnly")
      case "FEMALE_ONLY":
        return t("labels.womenOnly")
      default:
        return t("labels.mixed")
    }
  }

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
            {t("badges.private")}
          </Badge>
        )}
        {social.isHost && (
          <Badge className="absolute top-3 left-3 border-primary/20 bg-primary text-primary-foreground">
            {t("badges.hosting")}
          </Badge>
        )}
        {social.isParticipant && !social.isHost && (
          <Badge className="text-white-800/60 absolute top-3 left-3 gap-1 border-emerald-500/30 bg-emerald-500">
            <Check className="size-3.5" />
            {t("badges.joined")}
          </Badge>
        )}
      </div>

      <CardHeader className="space-y-0 px-5 pt-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 min-h-14 text-lg font-semibold">
            {social.title}
          </h2>
          <Badge className={getStatusClasses(social.status)} variant="outline">
            {t(`labels.${social.status.toLowerCase()}`)}
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
          <Badge variant="outline">{formatLabel}</Badge>
          <Badge variant="outline">{getGenderPolicyLabel()}</Badge>
          <Badge variant="outline">{ageGroupLabel}</Badge>
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
              {t("listing.sessionCount", { count: social._count.playSessions })}
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("detail.participants")}</span>
            <span>
              {social.joinedCount} / {social.maxSlots}
            </span>
          </div>
          <ProgressBar value={(social.joinedCount / social.maxSlots) * 100} />
        </div>

        {/* {social.organizers.length > 0 && (
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
                {t("sidebar.hostedBy")} {social.organizers[0].name}
              </p>
              {social.organizers.length > 1 && (
                <p className="text-muted-foreground">
                  {t("listing.organizerCount", {
                    count: social.organizers.length,
                  })}
                </p>
              )}
            </div>
          </div>
        )} */}
      </CardContent>

      <CardFooter className="px-5 pb-5">
        <Button
          className="w-full"
          variant={social.hasAvailableSlots ? "default" : "destructive"}
          disabled={!social.hasAvailableSlots}
        >
          {social.hasAvailableSlots
            ? t("sidebar.joinSocial")
            : t("sidebar.full")}
        </Button>
      </CardFooter>
    </Card>
  )
}
