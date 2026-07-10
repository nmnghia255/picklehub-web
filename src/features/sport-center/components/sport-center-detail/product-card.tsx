"use client"

import { Package2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/features/sport-center/types/product"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

interface ProductCardProps {
  item: Product
}

export function ProductCard({ item }: ProductCardProps) {
  const { t } = useSportCenterTranslation()
  const isOutOfStock = !item.isActive || item.stock <= 0

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
                <Package2 className="size-5" />
              </div>
              <span className="text-sm font-medium">
                {t("detail.service.noImage")}
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <Badge
              className={
                isOutOfStock
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }
            >
              {isOutOfStock
                ? t("detail.service.outOfStock")
                : t("detail.service.inStock")}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-background/90 text-foreground"
            >
              {item.type === "BEVERAGE"
                ? t("detail.service.beverage")
                : item.type}
            </Badge>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          <div className="space-y-2">
            <p className="line-clamp-2 text-lg leading-snug font-semibold">
              {item.name}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.description || t("detail.service.defaultProductDesc")}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("detail.service.sellingPrice")}
              </p>
              <p className="text-xl font-semibold text-foreground">
                {formatCurrencyVnd(item.price)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {t("detail.service.stock")}
              </p>
              <p className="text-sm font-semibold">
                {isOutOfStock
                  ? t("detail.service.outOfStock")
                  : `${item.stock} ${item.unit}`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
