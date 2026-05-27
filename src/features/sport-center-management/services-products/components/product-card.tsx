"use client"

import { CalendarClock, MapPin, Package2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

import { formatCurrencyVnd, getInventoryStatusClass } from "../utils"

interface ProductCardProps {
  item: SportCenter["products"][number]
}

export function ProductCard({ item }: ProductCardProps) {
  const isOutOfStock = !item.isActive || item.stock <= 0

  return (
    <Card
      className={
        isOutOfStock
          ? "group w-full overflow-hidden border-border/70 bg-background text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          : "group w-full overflow-hidden border-border/70 bg-background text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
      }
    >
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
              <span className="text-sm font-medium">Chưa có ảnh</span>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <Badge
              className={getInventoryStatusClass(
                "product",
                isOutOfStock ? "out_of_stock" : "in_stock"
              )}
            >
              {isOutOfStock ? "Hết hàng" : "Còn hàng"}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-background/90 text-foreground"
            >
              {item.type === "BEVERAGE" ? "Đồ uống" : item.type}
            </Badge>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          <div className="space-y-2">
            <p className="line-clamp-2 text-lg leading-snug font-semibold">
              {item.name}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.description || "Sản phẩm bổ sung cho sân và người chơi."}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Giá bán
              </p>
              <p className="text-xl font-semibold text-foreground">
                {formatCurrencyVnd(item.price)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">Tồn kho</p>
              <p className="text-sm font-semibold">
                {isOutOfStock ? "Hết hàng" : `${item.stock} ${item.unit}`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
