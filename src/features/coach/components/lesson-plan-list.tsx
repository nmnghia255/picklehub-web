"use client"

import { BookOpenText, Clock3, Pencil, Plus, Trash2, Users } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { LessonPlan } from "@/features/coach/data/mockLessonPlan"
import {
  getLessonPlansFromStorage,
  saveLessonPlansToStorage,
} from "@/features/coach/lib/lesson-plan-storage"

function levelVariant(level: LessonPlan["level"]) {
  if (level === "Beginner") return "secondary"
  if (level === "Intermediate") return "outline"
  return "default"
}

export function LessonPlanList() {
  const [plans, setPlans] = useState<LessonPlan[]>(() =>
    getLessonPlansFromStorage()
  )

  const sortedPlans = useMemo(
    () => [...plans].sort((left, right) => right.usageCount - left.usageCount),
    [plans]
  )

  const handleDelete = (lessonPlanId: string) => {
    setPlans((prev) => {
      const nextPlans = prev.filter((plan) => plan.id !== lessonPlanId)
      saveLessonPlansToStorage(nextPlans)
      return nextPlans
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border bg-linear-to-br from-primary/10 via-sky-500/5 to-emerald-500/10 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Lesson plan library
          </Badge>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Danh sách giáo án
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
              Tạo, sửa, xóa và mở chi tiết giáo án để HLV dùng trực tiếp khi
              giảng dạy.
            </p>
          </div>
        </div>

        <Button asChild className="rounded-full">
          <Link href="/coach/curriculum/new">
            <Plus className="size-4" />
            Tạo giáo án mới
          </Link>
        </Button>
      </div>

      {sortedPlans.length === 0 ? (
        <Card className="rounded-2xl border">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Chưa có giáo án nào. Tạo giáo án mới để bắt đầu.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {sortedPlans.map((plan) => (
            <Card
              key={plan.id}
              className="rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <Badge
                        variant={levelVariant(plan.level)}
                        className="rounded-full"
                      >
                        {plan.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <Badge variant="outline" className="rounded-full">
                    {plan.usageCount} lần dùng
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                    <Clock3 className="size-4" />
                    {plan.duration} phút
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                    <BookOpenText className="size-4" />
                    {plan.sections.length} sections
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                    <Users className="size-4" />
                    {plan.sections.reduce(
                      (total, section) => total + section.drillIds.length,
                      0
                    )}{" "}
                    drills
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <Separator className="mb-4" />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={`/coach/curriculum/${plan.id}`}>
                      Xem chi tiết
                    </Link>
                  </Button>

                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href={`/coach/curriculum/${plan.id}/edit`}>
                        <Pencil className="size-4" />
                        Sửa
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full text-destructive hover:text-destructive"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="size-4" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
