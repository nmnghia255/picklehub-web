"use client"

import { Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getLearningPathByStudentId,
  learningPaths,
} from "@/features/coach/data/mockLearningPath"
import { lessonPlans } from "@/features/coach/data/mockLessonPlan"
import { students } from "@/features/coach/data/mockStudents"

type RoadmapBuilderProps = {
  studentId?: string | null
}

export function CoachRoadmapBuilder({ studentId }: RoadmapBuilderProps) {
  const defaultPath = studentId
    ? (getLearningPathByStudentId(studentId) ?? learningPaths[0])
    : learningPaths[0]
  const [path, setPath] = useState(defaultPath)
  const [selectedStudentId, setSelectedStudentId] = useState(
    studentId ?? students[0]?.id ?? ""
  )
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedSkillId, setSelectedSkillId] = useState(
    path.skills[0]?.id ?? ""
  )
  const [selectedLessonPlan, setSelectedLessonPlan] = useState(
    lessonPlans[0]?.name ?? ""
  )

  const overallProgress = useMemo(
    () => path.completedPercent,
    [path.completedPercent]
  )

  const handleStudentChange = (newStudentId: string) => {
    setSelectedStudentId(newStudentId)
    const newPath = getLearningPathByStudentId(newStudentId) ?? learningPaths[0]
    setPath(newPath)
  }

  const handleAddLessonPlan = () => {
    setPath((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.id === selectedSkillId &&
        !skill.lessonPlans.includes(selectedLessonPlan)
          ? {
              ...skill,
              lessonPlans: [...skill.lessonPlans, selectedLessonPlan],
            }
          : skill
      ),
    }))
    setAddDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedStudentId} onValueChange={handleStudentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Learning Path</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Tổng quan tiến độ của học viên và các skill đang theo dõi.
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full">
            {path.studentName}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <StatCard label="Level hiện tại" value={path.currentLevel} />
          <StatCard label="Hoàn thành" value={`${overallProgress}%`} />
          <StatCard label="Tổng skill" value={String(path.skills.length)} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {path.skills.map((skill) => (
          <Card key={skill.id} className="rounded-2xl border shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">{skill.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Progress: {skill.progress}%
                  </p>
                </div>
                <Badge
                  variant={
                    skill.status === "Completed"
                      ? "default"
                      : skill.status === "In progress"
                        ? "secondary"
                        : "outline"
                  }
                  className="rounded-full"
                >
                  {skill.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {skill.lessonPlans.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Chưa gắn lesson plan nào.
                  </span>
                ) : (
                  skill.lessonPlans.map((plan) => (
                    <Badge
                      key={plan}
                      variant="secondary"
                      className="rounded-full"
                    >
                      {plan}
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button className="rounded-full" onClick={() => setAddDialogOpen(true)}>
        <Plus className="size-4" />
        Thêm giáo án
      </Button>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gắn giáo án vào skill</DialogTitle>
            <DialogDescription>
              Chọn skill và lesson plan để thêm vào lộ trình hiện tại.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Select
                value={selectedSkillId}
                onValueChange={setSelectedSkillId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn skill" />
                </SelectTrigger>
                <SelectContent>
                  {path.skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Select
                value={selectedLessonPlan}
                onValueChange={setSelectedLessonPlan}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lesson plan" />
                </SelectTrigger>
                <SelectContent>
                  {lessonPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.name}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddLessonPlan}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}
