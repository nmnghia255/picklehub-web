"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CoachDashboardStats() {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu thống kê. Vui lòng quay lại sau.
        </CardContent>
      </Card>
    </div>
  )
}
