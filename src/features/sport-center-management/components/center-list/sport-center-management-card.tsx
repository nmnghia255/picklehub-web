import {
  Building2,
  CalendarDays,
  Clock3,
  Edit3,
  MapPin,
  MoreHorizontal,
  Phone,
  Trash2,
} from "lucide-react"
import Link from "next/link"

import { FallbackImage } from "@/components/fallback-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { SportCenter } from "../../types/sport-center"

export function SportCenterManagementCard({
  center,
  onEdit,
  onDelete,
  deleting,
  locale,
}: {
  center: SportCenter
  onEdit: (center: SportCenter) => void
  onDelete: (center: SportCenter) => void
  deleting: boolean
  locale: string
}) {
  const { t } = useSportCenterManagementTranslation()
  const coverImage = center.images?.[0]
  const statusKey = center.status === "ACTIVE" ? "active" : "inactive"
  const initials = center.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="relative h-44 bg-muted">
        {coverImage ? (
          <FallbackImage
            src={coverImage}
            alt={t("centerList.imageAlt", { name: center.name })}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-linear-to-br from-primary/10 via-background to-muted text-muted-foreground">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-background shadow-sm">
              <Building2 className="size-7 text-primary" />
            </div>
            <span className="text-sm">{t("centerList.noImage")}</span>
          </div>
        )}
        <Badge
          className={`absolute top-3 left-3 ${
            center.status === "ACTIVE"
              ? "border-emerald-200 bg-emerald-500 text-white"
              : "bg-background/90 text-foreground"
          }`}
        >
          {t(`centerList.status.${statusKey}`)}
        </Badge>
      </div>

      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted font-semibold text-primary">
            {initials || <Building2 className="size-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold">{center.name}</h2>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span className="line-clamp-2">{center.address}</span>
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="size-4" />
            {center.openTime} - {center.closeTime}
          </span>
          <span className="inline-flex items-center gap-2 truncate">
            <Phone className="size-4 shrink-0" />
            {center.phone}
          </span>
          <span className="inline-flex items-center gap-2">
            <Building2 className="size-4" />
            {t("centerList.courts", {
              count: center._count?.courts ?? 0,
            })}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" />
            {t("centerList.created", {
              date: new Intl.DateTimeFormat(locale, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).format(new Date(center.createdAt)),
            })}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/sport-center-management/${center.id}`}>
              {t("centerList.actions.view")}
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(center)}
            aria-label={t("centerList.actions.edit")}
          >
            <Edit3 />
            <span className="sr-only sm:not-sr-only">
              {t("centerList.actions.edit")}
            </span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onDelete(center)}
            disabled={deleting}
            aria-label={t("centerList.actions.delete")}
          >
            {deleting ? (
              <MoreHorizontal className="animate-pulse" />
            ) : (
              <Trash2 />
            )}
            <span className="sr-only sm:not-sr-only">
              {t("centerList.actions.delete")}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
