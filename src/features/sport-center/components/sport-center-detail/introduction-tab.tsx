import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { CourtResponse } from "@/features/sport-center/types/court"

interface IntroductionTabProps {
  description: string
  courts: CourtResponse[]
}

function getCourtTypeLabel(court: CourtResponse) {
  return court.type === "INDOOR" ? "Trong nhà" : "Ngoài trời"
}

function getCourtStatusLabel(court: CourtResponse) {
  return court.status === "ACTIVE" ? "Đang hoạt động" : "Tạm ngưng"
}

export function IntroductionTab({ description, courts }: IntroductionTabProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <h2 className="text-lg font-semibold">Giới thiệu</h2>
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="space-y-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">Danh sách sân</h3>
            <span className="text-xs text-muted-foreground">
              {courts.length} sân
            </span>
          </div>

          {courts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {courts.map((court) => (
                <Badge key={court.id} variant="outline">
                  {court.name} · {getCourtTypeLabel(court)} ·{" "}
                  {getCourtStatusLabel(court)}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có thông tin sân.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
