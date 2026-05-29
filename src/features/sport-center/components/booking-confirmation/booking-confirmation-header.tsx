import { CreditCard } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type BookingConfirmationHeaderProps = {
  centerName: string
  selectedDateText: string
  totalSlots: number
  totalDisplay: string
  bookingId: string
  onBack: () => void
}

export function BookingConfirmationHeader({
  centerName,
  selectedDateText,
  totalSlots,
  totalDisplay,
  bookingId,
  onBack,
}: BookingConfirmationHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border bg-card/90 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Bước xác nhận</Badge>
          {bookingId ? (
            <Badge variant="default">Mã đặt sân: {bookingId}</Badge>
          ) : null}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Xác nhận đặt sân
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Kiểm tra lại toàn bộ thông tin đặt sân và thông tin thanh toán trước
            khi tạo booking cho {centerName}.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="outline" onClick={onBack}>
          Quay lại đặt sân
        </Button>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-dashed">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Ngày đặt</p>
              <p className="mt-1 text-lg font-semibold">{selectedDateText}</p>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Sân & khung giờ</p>
              <p className="mt-1 text-lg font-semibold">{totalSlots} giờ</p>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Tổng cộng</p>
              <p className="mt-1 text-lg font-semibold">{totalDisplay}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
