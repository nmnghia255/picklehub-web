"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LearnerCoachDiscovery() {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Khám phá Huấn luyện viên</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            Chức năng khám phá huấn luyện viên sẽ sớm được cập nhật.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
