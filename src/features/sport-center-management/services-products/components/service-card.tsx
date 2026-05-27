"use client"

import { Settings2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

import { formatCurrencyVnd, getInventoryStatusClass } from "../utils"

interface ServiceCardProps {
  item: SportCenter["services"][number]
}

export function ServiceCard({ item }: ServiceCardProps) {
  const isPaused = !item.isActive

  return (
    <Card
      className={
        isPaused
          ? "group w-full overflow-hidden border-border/70 bg-background text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          : "group w-full overflow-hidden border-border/70 bg-background text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
      }
    >
      <CardContent className="flex h-full flex-col p-0">
        <div className="relative overflow-hidden bg-linear-to-br from-primary/10 via-background to-muted px-4 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border/60">
              <Settings2 className="size-6 text-primary" />
            </div>

            <Badge
              className={getInventoryStatusClass(
                "service",
                isPaused ? "paused" : "active"
              )}
            >
              {isPaused ? "Tạm ngưng" : "Đang hoạt động"}
            </Badge>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          <div className="space-y-2">
            <p className="line-clamp-2 text-lg leading-snug font-semibold">
              {item.name}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.description || "Dịch vụ hỗ trợ và nâng cao trải nghiệm."}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Giá dịch vụ
              </p>
              <p className="text-xl font-semibold text-foreground">
                {formatCurrencyVnd(item.price)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">Loại dịch vụ</p>
              <p className="text-sm font-semibold">
                {item.type === "COACHING" ? "Huấn luyện" : "Thuê thiết bị"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
