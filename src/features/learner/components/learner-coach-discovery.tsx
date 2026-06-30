"use client"

import { Search, Star } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type CoachInfo,
  coachList,
  type LearnerCoachRegistration,
  learnerCoachRegistrations,
  learnerProfile,
} from "@/features/learner/data/learner-mock-data"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ/buổi"
}

export function LearnerCoachDiscovery() {
  const [search, setSearch] = useState("")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [registrations, setRegistrations] = useState<
    LearnerCoachRegistration[]
  >(learnerCoachRegistrations.filter((r) => r.learnerId === learnerProfile.id))

  const registeredCoachIds = useMemo(
    () => new Set(registrations.map((r) => r.coachId)),
    [registrations]
  )

  const locations = useMemo(
    () => [...new Set(coachList.map((c) => c.location))],
    []
  )

  const filteredCoaches = useMemo(() => {
    return coachList.filter((coach) => {
      const matchesSearch =
        coach.name.toLowerCase().includes(search.toLowerCase()) ||
        coach.specialty.toLowerCase().includes(search.toLowerCase())
      const matchesLocation =
        locationFilter === "all" || coach.location === locationFilter
      return matchesSearch && matchesLocation
    })
  }, [search, locationFilter])

  const handleRegister = useCallback((coachId: string) => {
    setRegistrations((prev) => {
      const existing = prev.find(
        (r) => r.coachId === coachId && r.learnerId === learnerProfile.id
      )
      if (existing) {
        return prev.filter((r) => r !== existing)
      }
      return [
        ...prev,
        {
          learnerId: learnerProfile.id,
          coachId,
          registeredAt: new Date().toISOString().slice(0, 10),
        },
      ]
    })
  }, [])

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Tìm kiếm Huấn luyện viên</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[1fr_200px]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc chuyên môn..."
                className="pl-9"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khu vực</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Đang theo học {registeredCoachIds.size} HLV. Bạn có thể đăng ký thêm
            HLV mới bất kỳ lúc nào.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredCoaches.map((coach) => {
          const isRegistered = registeredCoachIds.has(coach.id)

          return (
            <Card
              key={coach.id}
              className="rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar size="lg" className="size-14">
                      <AvatarImage src={coach.avatar} alt={coach.name} />
                      <AvatarFallback className="font-semibold">
                        {coach.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{coach.name}</h3>
                        <Badge variant="secondary" className="rounded-full">
                          {coach.specialty.split(",")[0]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                          {coach.rating} ({coach.reviewCount})
                        </span>
                        <span>{coach.experience} năm KN</span>
                        <span>{coach.location}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {coach.bio}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {coach.specialty.split(", ").map((s) => (
                          <Badge
                            key={s}
                            variant="outline"
                            className="rounded-full text-xs"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-lg font-semibold">
                      {formatCurrency(coach.price)}
                    </span>
                    <Button
                      variant={isRegistered ? "secondary" : "default"}
                      className="rounded-full"
                      onClick={() => handleRegister(coach.id)}
                    >
                      {isRegistered ? "Đã đăng ký" : "Đăng ký"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCoaches.length === 0 && (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Không tìm thấy huấn luyện viên phù hợp.
        </div>
      )}
    </div>
  )
}
