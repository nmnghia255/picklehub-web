"use client"

import { Search } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  StudentLevel,
  StudentRecord,
} from "@/features/coach/data/mockStudents"

type CoachStudentsTableProps = {
  students: StudentRecord[]
}

const levelLabels: Record<StudentLevel, string> = {
  Beginner: "Mới bắt đầu",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
}

export function CoachStudentsTable({ students }: CoachStudentsTableProps) {
  const [query, setQuery] = useState("")
  const [level, setLevel] = useState<StudentLevel | "all">("all")

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesQuery =
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.phone.toLowerCase().includes(query.toLowerCase())
      const matchesLevel = level === "all" || student.level === level

      return matchesQuery && matchesLevel
    })
  }, [level, query, students])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên hoặc SĐT"
            className="pl-9"
          />
        </div>

        <Select
          value={level}
          onValueChange={(value) => setLevel(value as StudentLevel | "all")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả level</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="rounded-2xl border shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <Avatar size="lg" className="size-12">
                    <AvatarImage src={student.avatar} alt={student.name} />
                    <AvatarFallback>
                      {student.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <p className="font-semibold">{student.name}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="rounded-full">
                        {levelLabels[student.level]}
                      </Badge>
                      <span>{student.sessionsCompleted} buổi đã học</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {student.phone}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={`/coach/students/${student.id}`}>
                      Xem hồ sơ
                    </Link>
                  </Button>
                  <Button asChild className="rounded-full">
                    <Link href={`/coach/roadmap?studentId=${student.id}`}>
                      Xem lộ trình
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Không tìm thấy học viên phù hợp.
        </div>
      ) : null}
    </div>
  )
}
