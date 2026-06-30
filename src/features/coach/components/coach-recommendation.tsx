"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CoachRecommendation() {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Đề xuất HLV</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-sm text-muted-foreground">
            Tính năng đề xuất huấn luyện viên sẽ sớm được cập nhật.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
