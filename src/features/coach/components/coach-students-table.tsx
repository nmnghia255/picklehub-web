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
import { Skeleton } from "@/components/ui/skeleton"

import { useCoachLearners } from "../hooks/use-coach-queries"

const statusLabels: Record<string, string> = {
  active: "Đang hoạt động",
  inactive: "Không hoạt động",
}

export function CoachStudentsTable() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string>("all")

  const { data, isLoading } = useCoachLearners({ search: query || undefined })

  const students = data?.data ?? []

  const filteredStudents = useMemo(() => {
    if (status === "all") return students
    return students.filter((s) => s.status === status)
  }, [status, students])

  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên hoặc email"
            className="pl-9"
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filter trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredStudents.map((student, index) => (
          <Card key={student.id ?? index} className="rounded-2xl border shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="size-12">
                    <AvatarImage src={student.avatar ?? ""} alt={student.name} />
                    <AvatarFallback>
                      {(student.name ?? "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <p className="font-semibold">{student.name}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <Badge
                        variant={
                          student.status === "active" ? "default" : "secondary"
                        }
                        className="rounded-full"
                      >
                        {statusLabels[student.status]}
                      </Badge>
                      <span>{student.enrolledClassCount} lớp đã tham gia</span>
                      <span>{student.completedBookingCount} buổi đã học</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {student.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={`/coach/students/${student.id}`}>
                      Xem hồ sơ
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
