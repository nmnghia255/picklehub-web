"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import type { ProductInventoryItem } from "../types"
import { formatCurrencyVnd, getInventoryStatusClass } from "../utils"

interface ProductCardProps {
  item: ProductInventoryItem
}

export function ProductCard({ item }: ProductCardProps) {
  const isOutOfStock = item.status === "out_of_stock"

  return (
    <Card
      className={
        isOutOfStock
          ? "w-full overflow-hidden border-border bg-black text-white"
          : "w-full overflow-hidden border-border/60 bg-slate-950/90 text-white"
      }
    >
      <CardContent className="flex min-h-[16rem] gap-4 p-4 md:gap-5">
        <div className="flex w-[42%] max-w-[10rem] flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#f4f4f4] shadow-sm">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
              Image
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div className="space-y-2">
            <p className="line-clamp-2 text-[1.45rem] leading-tight font-semibold tracking-[0.01em] uppercase">
              {item.name}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xl font-semibold tracking-wide uppercase">
              {formatCurrencyVnd(item.price)}
            </p>
            <div className="flex items-center gap-3">
              <Badge
                className={getInventoryStatusClass("product", item.status)}
              >
                {item.status === "in_stock"
                  ? `${item.stock} còn hàng`
                  : "Hết hàng"}
              </Badge>
              <span className="text-sm text-white/75">
                {isOutOfStock ? "Tạm hết" : "Sẵn sàng"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
