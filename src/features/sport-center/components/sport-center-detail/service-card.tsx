"use client"

import { Settings2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Service } from "@/features/sport-center/types/service"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

interface ServiceCardProps {
  item: Service
}

export function ServiceCard({ item }: ServiceCardProps) {
  const { t } = useSportCenterTranslation()
  const isPaused = !item.isActive

  return (
    <Card className="group w-full overflow-hidden border-border/70 bg-background py-0 text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="flex h-full flex-col p-0">
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <div className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm">
                <Settings2 className="size-5" />
              </div>
              <span className="text-sm font-medium">
                {t("detail.service.noImage")}
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <Badge
              className={
                isPaused
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }
            >
              {isPaused
                ? t("detail.header.statusInactive")
                : t("detail.header.statusActive")}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-background/90 text-foreground"
            >
              {item.type === "COACHING"
                ? t("detail.service.coaching")
                : t("detail.service.equipment")}
            </Badge>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          <div className="space-y-2">
            <p className="line-clamp-2 text-lg leading-snug font-semibold">
              {item.name}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.description || t("detail.service.defaultServiceDesc")}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("detail.service.servicePrice")}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrencyVnd(item.price)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {t("detail.service.serviceType")}
              </p>
              <p className="text-sm font-semibold">
                {item.type === "COACHING"
                  ? t("detail.service.coaching")
                  : t("detail.service.equipment")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
