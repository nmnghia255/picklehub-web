import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { SelectedCourts } from "@/features/booking/types"

type Props = {
  selectedDateText: string
  totalSlots: number
  selectedCourts: SelectedCourts
  courtPrice: number
  addOnTotal: number
  total: number
  onConfirm: () => void
  isSubmitting: boolean
  canConfirm: boolean
  statusMessage?: string
  errorMessage?: string
}

export function BookingSummaryCard({
  selectedDateText,
  totalSlots,
  selectedCourts,
  courtPrice,
  addOnTotal,
  total,
  onConfirm,
  isSubmitting,
  canConfirm,
  statusMessage,
  errorMessage,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tổng chi phí</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ngày đặt</span>
            <span className="font-medium">{selectedDateText}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Sân & Khung giờ</span>
            <span className="font-medium">
              {totalSlots > 0 ? `${totalSlots} giờ` : "Chưa chọn"}
            </span>
          </div>
        </div>

        {totalSlots > 0 && (
          <div className="space-y-2 rounded-lg bg-muted p-3 text-xs">
            {Object.entries(selectedCourts).map(
              ([courtIdStr, slots], index) => (
                <div
                  key={courtIdStr}
                  className={`space-y-1 ${index !== 0 ? "border-t pt-2" : ""}`}
                >
                  <p className="font-medium">Sân {courtIdStr}:</p>
                  <p className="text-muted-foreground">
                    {Array.from(slots).join(", ")}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Phí sân ({totalSlots} × {courtPrice} VND)
            </span>
            <span>{courtPrice * totalSlots} VND</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Dịch vụ bổ sung</span>
            <span>{addOnTotal} VND</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between text-base font-semibold">
          <span>Tổng cộng</span>
          <span>{total} VND</span>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={onConfirm}
          disabled={!canConfirm || isSubmitting}
        >
          {isSubmitting ? "Đang gửi..." : "Xác nhận"}
        </Button>

        {statusMessage && (
          <p className="text-sm text-emerald-600">{statusMessage}</p>
        )}

        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}
