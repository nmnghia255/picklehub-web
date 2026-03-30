import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import type { AddOn, ExtrasState } from "@/features/booking/types"

type Props = {
  addOns: AddOn[]
  extras: ExtrasState
  onSetExtras: React.Dispatch<React.SetStateAction<ExtrasState>>
}

export function BookingAddOnsCard({ addOns, extras, onSetExtras }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dịch vụ bổ sung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {addOns.map((addon) => (
          <label
            key={addon.key}
            htmlFor={addon.key}
            className="flex cursor-pointer items-center justify-between rounded-md border p-3"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id={addon.key}
                checked={extras[addon.key]}
                onCheckedChange={(checked) => {
                  onSetExtras((prev) => ({
                    ...prev,
                    [addon.key]: checked === true,
                  }))
                }}
              />
              <span className="text-sm">{addon.label}</span>
            </div>
            <span className="text-sm font-medium">+{addon.price}VND</span>
          </label>
        ))}

        <div className="space-y-2">
          <p className="text-sm font-medium">Ghi chú đặt sân</p>
          <Textarea
            placeholder="Ghi chú tùy chọn cho nhân viên sân (thiết bị, số lượng người chơi, yêu cầu...)"
            className="min-h-24"
          />
        </div>
      </CardContent>
    </Card>
  )
}
