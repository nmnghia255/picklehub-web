import { Clock3, Heart, MapPin } from "lucide-react"
import Link from "next/link"

import { FallbackImage } from "@/components/fallback-image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

export function SportCenterCard({ sportCenter }: { sportCenter: SportCenter }) {
  return (
    <Link href={`/sport-center/${sportCenter.id}`}>
      <Card className="cursor-pointer overflow-hidden py-0 transition hover:shadow-md active:scale-[0.98]">
        <div className="relative h-44 w-full overflow-hidden">
          <FallbackImage
            src={sportCenter.images[0]}
            alt={`${sportCenter.name} cover`}
            className="h-full w-full object-cover"
          />
          {sportCenter.isFavourite ? (
            <span className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full border border-white/20 bg-white/30 text-rose-500 shadow-sm backdrop-blur-md">
              <Heart className="size-4 fill-current" />
            </span>
          ) : null}
        </div>

        <CardContent className="space-y-4 p-4">
          <div className="flex items-start gap-3">
            <Avatar size="lg" className="border">
              <AvatarImage
                src={sportCenter.images[0]}
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
