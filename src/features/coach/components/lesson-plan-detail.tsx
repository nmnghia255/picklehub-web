"use client"

import { ChevronLeft, Pencil } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { drills, type LessonPlan } from "@/features/coach/data/mockLessonPlan"
import {
  findLessonPlanById,
  getLessonPlansFromStorage,
} from "@/features/coach/lib/lesson-plan-storage"

interface LessonPlanDetailProps {
  lessonPlanId: string
}

function levelVariant(level: LessonPlan["level"]) {
  if (level === "Beginner") return "secondary"
  if (level === "Intermediate") return "outline"
  return "default"
}

export function LessonPlanDetail({ lessonPlanId }: LessonPlanDetailProps) {
  const [plans] = useState<LessonPlan[]>(() => getLessonPlansFromStorage())

  const plan = useMemo(
    () => findLessonPlanById(plans, lessonPlanId) ?? null,
    [lessonPlanId, plans]
  )

  const timeline = useMemo(() => {
    if (!plan) return []

    let cursor = 0
    return plan.sections.map((section) => {
      cursor += section.duration

      return {
        ...section,
        startMinute: cursor - section.duration,
        endMinute: cursor,
      }
    })
  }, [plan])

  if (!plan) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="font-medium">Không tìm thấy giáo án.</p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link href="/coach/curriculum">Quay lại danh sách</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border bg-linear-to-br from-primary/10 via-sky-500/5 to-emerald-500/10 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Detail view
          </Badge>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {plan.name}
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground md:text-base">
              Xem nhanh timeline buổi dạy, mô tả từng section và drills gắn bên
              trong để HLV dùng khi đứng lớp.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/coach/curriculum">
              <ChevronLeft className="size-4" />
              Danh sách
            </Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href={`/coach/curriculum/${plan.id}/edit`}>
              <Pencil className="size-4" />
              Chỉnh sửa
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Level" value={plan.level} />
        <StatCard label="Thời lượng" value={`${plan.duration} phút`} />
        <StatCard label="Sections" value={String(plan.sections.length)} />
        <StatCard label="Usage" value={String(plan.usageCount)} />
      </div>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Timeline</CardTitle>
            <Badge variant={levelVariant(plan.level)} className="rounded-full">
              {plan.level}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {timeline.map((section, index) => {
            const sectionDrills = section.drillIds
              .map((drillId) => drills.find((item) => item.id === drillId))
              .filter(Boolean)

            return (
              <div
                key={section.id}
                className="grid gap-4 md:grid-cols-[120px_1fr]"
              >
                <div className="pt-1 text-sm font-semibold text-primary">
                  {section.endMinute}p
                </div>

                <div className="relative">
                  {index !== timeline.length - 1 ? (
                    <span className="absolute top-6 left-3 h-full w-px bg-border" />
                  ) : null}

                  <div className="relative rounded-2xl border bg-background p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {section.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-full">
                        {section.duration} phút
                      </Badge>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                      <p className="text-sm font-medium">Drills</p>
                      <div className="flex flex-wrap gap-2">
                        {sectionDrills.length === 0 ? (
                          <span className="text-sm text-muted-foreground">
                            Không có drill được gắn.
                          </span>
                        ) : (
                          sectionDrills.map((drill) => (
                            <Badge
                              key={drill!.id}
                              variant="secondary"
                              className="rounded-full"
                            >
                              {drill!.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}
