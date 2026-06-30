"use client"

import { Card, CardContent } from "@/components/ui/card"

export function LearnerSchedule() {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Chưa có lịch tập. Vui lòng quay lại sau.
        </CardContent>
      </Card>
    </div>
  )
}
