import { Clock3, Heart, Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

interface SportCenterHeaderCardProps {
  sportCenter: SportCenter
}

const fallbackImageUrl =
  "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=240&q=80"

export function SportCenterHeaderCard({
  sportCenter,
}: SportCenterHeaderCardProps) {
  return (
    <Card className="overflow-hidden py-0">
      <div className="h-48 w-full bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500" />
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <img
              src={sportCenter.images[0] ?? fallbackImageUrl}
              alt={`${sportCenter.name} logo`}
              className="size-20 rounded-full border-4 border-background object-cover shadow-sm"
            />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {sportCenter.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {sportCenter.status === "ACTIVE"
                    ? "Đang hoạt động"
                    : "Tạm ngưng"}
                </Badge>
                <Badge variant="outline">{sportCenter._count.courts} sân</Badge>
                <Badge variant="outline">
                  {sportCenter.averageRating.toFixed(1)} sao
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/booking?centerId=${sportCenter.id}`}>
              <Button>Đặt sân</Button>
            </Link>
            <Button variant="outline">
              <Heart />
              {sportCenter.isFavourite ? "Đã yêu thích" : "Yêu thích"}
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
            Giờ hoạt động: {sportCenter.openTime} - {sportCenter.closeTime}
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
