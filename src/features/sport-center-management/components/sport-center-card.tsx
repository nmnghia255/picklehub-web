import { Building2, Clock3, MapPin, Phone, Star } from "lucide-react"
import Link from "next/link"

import { FallbackImage } from "@/components/fallback-image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { SportCenter } from "@/features/sport-center-management/types/sport-center"
import { formatCurrencyVnd } from "@/utils/expense-utils"

export function SportCenterCard({ sportCenter }: { sportCenter: SportCenter }) {
  const coverImage = sportCenter.images[0]
  const initials = sportCenter.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
  const statusLabel =
    sportCenter.status === "ACTIVE" ? "Đang hoạt động" : "Tạm ngưng"
  const ratingLabel =
    sportCenter.reviewCount > 0
      ? sportCenter.averageRating.toFixed(1)
      : "Chưa có đánh giá"

  return (
    <Link href={`/sport-center/${sportCenter.id}`}>
      <Card className="group overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]">
        <CardContent className="flex h-full flex-col p-0">
          <div className="relative h-48 overflow-hidden bg-muted">
            {coverImage ? (
              <FallbackImage
                src={coverImage}
                alt={`${sportCenter.name} cover`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-linear-to-br from-primary/10 via-background to-muted text-muted-foreground">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border/60">
                  <Building2 className="size-7 text-primary" />
                </div>
                <span className="text-sm font-medium">
                  Chưa có ảnh đại diện
                </span>
              </div>
            )}

            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <Badge
                className={
                  sportCenter.status === "ACTIVE"
                    ? "border-emerald-200 bg-emerald-500/90 text-white shadow-sm"
                    : "border-border/60 bg-background/90 text-foreground shadow-sm backdrop-blur"
                }
              >
                {statusLabel}
              </Badge>

              <Badge
                variant="secondary"
                className="bg-background/90 text-foreground"
              >
                <Star className="size-3" />
                {ratingLabel}
              </Badge>
            </div>
          </div>

          <div className="space-y-5 p-4">
            <div className="flex items-start gap-3">
              <Avatar size="lg" className="border">
                <AvatarImage
                  src={coverImage}
                  alt={`${sportCenter.name} logo`}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="space-y-1">
                  <h3 className="line-clamp-1 text-lg leading-tight font-semibold">
                    {sportCenter.name}
                  </h3>
                  <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    <span className="line-clamp-2">{sportCenter.address}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                    <Clock3 className="size-3.5" />
                    {sportCenter.openTime} - {sportCenter.closeTime}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                    <Phone className="size-3.5" />
                    {sportCenter.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Số sân
                </p>
                <p className="text-sm font-semibold">
                  {sportCenter._count.courts}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Giá từ
                </p>
                <p className="text-sm font-semibold">
                  {formatCurrencyVnd(sportCenter.basePrice)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Đánh giá
                </p>
                <p className="text-sm font-semibold">
                  {sportCenter.reviewCount > 0
                    ? `${ratingLabel} (${sportCenter.reviewCount})`
                    : ratingLabel}
                </p>
              </div>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
