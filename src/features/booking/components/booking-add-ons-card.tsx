import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { ExtrasState } from "@/features/booking/types"
import type { Service } from "@/features/sport-center/types/service"

type Props = {
  services: Service[]
  extras: ExtrasState
  onSetExtras: React.Dispatch<React.SetStateAction<ExtrasState>>
  note: string
  onNoteChange: (note: string) => void
}

export function BookingServicesCard({ services, extras, onSetExtras }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dịch vụ bổ sung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Không có dịch vụ bổ sung.
          </p>
        ) : (
          services.map((service) => (
            <label
              key={service.id}
              htmlFor={service.id}
              className="flex cursor-pointer items-center justify-between rounded-md border p-3"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={service.id}
                    checked={extras[service.id]}
                    onCheckedChange={(checked) => {
                      onSetExtras((prev) => ({
                        ...prev,
                        [service.id]: checked === true,
                      }))
                    }}
                  />
                  <span className="text-sm font-medium">{service.name}</span>
                </div>
                {service.description && (
                  <span className="mt-1 text-xs text-muted-foreground">
                    {service.description}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">+{service.price} VND</span>
            </label>
          ))
        )}
      </CardContent>
    </Card>
  )
}
