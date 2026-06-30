"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LearnerProfile() {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Hồ sơ người học</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Chưa có dữ liệu hồ sơ. Vui lòng quay lại sau.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
