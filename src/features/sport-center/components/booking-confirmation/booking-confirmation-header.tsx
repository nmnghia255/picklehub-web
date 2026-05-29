import { CreditCard } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type BookingConfirmationHeaderProps = {
  onBack: () => void
}

export function BookingConfirmationHeader({
  onBack,
}: BookingConfirmationHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border bg-card/90 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Xác nhận đặt sân
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Kiểm tra lại toàn bộ thông tin đặt sân và thông tin thanh toán trước
            khi đặt sân
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="outline" onClick={onBack}>
          Quay lại đặt sân
        </Button>
      </div>
    </div>
  )
}
