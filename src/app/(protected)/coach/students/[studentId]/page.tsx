import { ChevronLeft } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CoachPageHeader } from "@/features/coach/components/coach-page-header"
import { getStudentProfile } from "@/features/coach/data/mockStudents"

interface StudentDetailPageProps {
  params: Promise<{ studentId: string }>
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const { studentId } = await params
  const student = getStudentProfile(studentId)

  if (!student) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="font-medium">Không tìm thấy học viên.</p>
            <Button asChild variant="outline" className="mt-4 rounded-full">
              <Link href="/coach/students">
                <ChevronLeft className="size-4" />
                Quay lại danh sách
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/coach/students">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <CoachPageHeader
            title="Chi tiết học viên"
            description="Xem nhanh thông tin cơ bản, lịch sử học, lộ trình hiện tại và đánh giá tiến bộ."
          />
        </div>

        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <Avatar size="lg" className="size-16">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback>
                    {student.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold">{student.name}</h2>
                    <Badge variant="secondary" className="rounded-full">
                      {student.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {student.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {student.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hồ sơ từ {student.joinedAt}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:min-w-90">
                <MetricCard
                  label="Buổi đã học"
                  value={String(student.sessionsCompleted)}
                />
                <MetricCard
                  label="Lộ trình hiện tại"
                  value={student.currentPlan}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="rounded-2xl border shadow-sm xl:col-span-2">
            <CardHeader>
              <CardTitle>Lịch sử học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.history.map((item) => (
                <div
                  key={`${item.date}-${item.lessonPlan}`}
                  className="rounded-2xl border p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{item.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.lessonPlan}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.status === "Hoàn thành" ? "default" : "outline"
                      }
                      className="rounded-full"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader>
                <CardTitle>Lộ trình hiện tại</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {student.currentPlan}
                </p>
                {student.progressSkills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{skill.name}</span>
                      <span className="text-muted-foreground">
                        {skill.progress}%
                      </span>
                    </div>
                    <Progress value={skill.progress} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm">
              <CardHeader>
                <CardTitle>Đánh giá tiến bộ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {student.improvementNote}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {student.notes}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}
