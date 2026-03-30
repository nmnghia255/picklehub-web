import { Clock3, MapPin, Phone } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function BookingCourtInfoCard() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <img
          src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=240&q=80"
          alt="Court overview"
          className="h-32 w-full rounded-lg object-cover sm:w-56"
        />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Pickle Dome Sukhumvit</h2>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            42 Sukhumvit 49, Watthana, Bangkok
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="size-4" />
            Open daily: 06:00 - 23:00
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4" />
            +66 2 111 2222
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
