import { Clock3, MapPin } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { SportCenter } from "@/features/sport-center/types"

export function SportCenterCard({ sportCenter }: { sportCenter: SportCenter }) {
  return (
    <Link href={`/sport-center/${sportCenter.id}`}>
      <Card className="cursor-pointer overflow-hidden py-0 transition hover:shadow-md active:scale-[0.98]">
        <div className="relative h-44 w-full overflow-hidden">
          <img
            src={sportCenter.imageUrl}
            alt={`${sportCenter.name} cover`}
            className="h-full w-full object-cover"
          />
          <Badge className="absolute top-3 right-3" variant="secondary">
            {sportCenter.distanceKm.toFixed(1)} km
          </Badge>
        </div>

        <CardContent className="space-y-4 p-4">
          <div className="flex items-start gap-3">
            <Avatar size="lg" className="border">
              <AvatarImage
                src={sportCenter.logoUrl}
                alt={`${sportCenter.name} logo`}
              />
              <AvatarFallback>
                {sportCenter.name
                  .split(" ")
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h3 className="leading-tight font-semibold">
                {sportCenter.name}
              </h3>

              <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{sportCenter.address}</span>
              </p>

              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock3 className="size-4 shrink-0" />
                <span>{sportCenter.openTime}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
