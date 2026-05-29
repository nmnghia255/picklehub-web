import { Clock3, MapPin, Phone } from "lucide-react"

import { FallbackImage } from "@/components/fallback-image"
import { Card, CardContent } from "@/components/ui/card"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

type BookingCourtInfoCardProps = {
  sportCenter: SportCenter | null
}

export function BookingCourtInfoCard({
  sportCenter,
}: BookingCourtInfoCardProps) {
  const imageSrc =
    sportCenter?.images[0] ??
    "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=240&q=80"
  const centerName = sportCenter?.name ?? "Chưa cập nhật tên trung tâm"
  const centerAddress = sportCenter?.address ?? "Chưa cập nhật địa chỉ"
  const centerHours = sportCenter
    ? `Giờ hoạt động: ${sportCenter.openTime} - ${sportCenter.closeTime}`
    : "Open daily: 08:00 - 22:00"
  const centerPhone = sportCenter?.phone ?? "Chưa cập nhật số điện thoại"

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <FallbackImage
          src={imageSrc}
          alt={`${centerName} overview`}
          className="h-32 w-full rounded-lg object-cover sm:w-56"
        />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{centerName}</h2>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {centerAddress}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="size-4" />
            {centerHours}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4" />
            {centerPhone}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
