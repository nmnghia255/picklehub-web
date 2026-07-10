"use client"

import { ArrowLeft, Clock3, Heart, Mail, MapPin, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect } from "react"

import { FallbackImage } from "@/components/fallback-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toggleFavoriteSportCenterAction } from "@/features/sport-center/actions/toggle-favorite-sport-center"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { useToast } from "@/hooks/use-toast"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

interface SportCenterHeaderCardProps {
  sportCenter: SportCenter
}

export function SportCenterHeaderCard({
  sportCenter,
}: SportCenterHeaderCardProps) {
  const { t } = useSportCenterTranslation()
  const { toast } = useToast()

  const [favoriteState, formAction, isPending] = useActionState(
    toggleFavoriteSportCenterAction,
    {
      isFavourite: sportCenter.isFavourite,
    }
  )

  const router = useRouter()

  useEffect(() => {
    if (favoriteState.message) {
      toast({
        title: favoriteState.message,
      })
    }

    if (favoriteState.error) {
      toast({
        title: favoriteState.error,
        variant: "destructive",
      })
    }
  }, [favoriteState.error, favoriteState.message, toast])

  return (
    <Card className="overflow-hidden py-0">
      {/* Header Image */}
      <div className="h-48 w-full bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <FallbackImage
              src={sportCenter.images[0]}
              alt={t("detail.logoAlt", { name: sportCenter.name })}
              className="size-20 rounded-full border-4 border-background object-cover shadow-sm"
            />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {sportCenter.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {sportCenter.status === "ACTIVE"
                    ? t("detail.header.statusActive")
                    : t("detail.header.statusInactive")}
                </Badge>
                <Badge variant="outline">
                  {t("detail.header.courtsCount", {
                    count: sportCenter._count.courts,
                  })}
                </Badge>
                <Badge variant="outline">
                  {t("detail.header.rating", {
                    rating: sportCenter.averageRating.toFixed(1),
                  })}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              className="w-fit"
              onClick={() => {
                router.push(`/sport-center/${sportCenter.id}/booking`)
              }}
            >
              {t("detail.header.bookCourt")}
            </Button>
            <form
              action={(formData) => {
                startTransition(() => formAction(formData))
              }}
            >
              <input type="hidden" name="centerId" value={sportCenter.id} />
              <input
                type="hidden"
                name="isFavourite"
                value={String(favoriteState.isFavourite)}
              />
              <Button type="submit" variant="outline" disabled={isPending}>
                <Heart
                  className={favoriteState.isFavourite ? "fill-current" : ""}
                />
                {isPending
                  ? t("detail.header.updating")
                  : favoriteState.isFavourite
                    ? t("detail.header.favorited")
                    : t("detail.header.favorite")}
              </Button>
            </form>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
              {t("detail.header.back")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <p className="flex items-center gap-2">
            <MapPin className="size-4" />
            {sportCenter.address}
          </p>
          <p className="flex items-center gap-2">
            <Clock3 className="size-4" />
            {t("detail.header.operatingHours", {
              openTime: sportCenter.openTime,
              closeTime: sportCenter.closeTime,
            })}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4" />
            {sportCenter.phone}
          </p>
          <p className="flex items-center gap-2">
            <Mail className="size-4" />
            {sportCenter.email}
          </p>
        </div>

        {sportCenter.amenities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sportCenter.amenities.map((amenity) => (
              <Badge key={amenity} variant="outline">
                {amenity}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
