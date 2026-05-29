import { CreditCard } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

type BookingConfirmationDetailsCardProps = {
  centerName: string
  address: string
  selectedDateText: string
  totalDisplay: string
  bookingNote: string
}

export function BookingConfirmationDetailsCard({
  centerName,
  address,
  selectedDateText,
  totalDisplay,
  bookingNote,
}: BookingConfirmationDetailsCardProps) {
  return (
    <Card className="overflow-hidden border shadow-lg shadow-black/5">
      <div className="h-1 bg-linear-to-r from-primary via-primary/70 to-emerald-400" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <CreditCard className="size-5" />
          Thông tin đặt sân
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-2xl bg-muted/50 p-4">
          <div>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Sân
            </p>
            <p className="mt-1 text-lg font-semibold">{centerName}</p>
            <p className="text-sm text-muted-foreground">{address}</p>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Ngày đặt</p>
              <p className="font-medium">{selectedDateText}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tổng tiền</p>
              <p className="font-medium">{totalDisplay}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Ghi chú
            </p>
            <Textarea
              value={bookingNote || "Không có ghi chú."}
              readOnly
              className="mt-2 min-h-24 resize-none bg-background"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
