"use client"

import { CalendarDays, Mail, Phone } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getRegisteredCoachesByLearner,
  learnerProfile,
} from "@/features/learner/data/learner-mock-data"

export function LearnerProfile() {
  const registeredCoaches = getRegisteredCoachesByLearner(learnerProfile.id)
  const initials = learnerProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <Avatar size="lg" className="size-20">
                <AvatarImage
                  src={learnerProfile.avatar}
                  alt={learnerProfile.name}
                />
                <AvatarFallback className="text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold">
                    {learnerProfile.name}
                  </h2>
                  <Badge variant="secondary" className="rounded-full">
                    {learnerProfile.level}
                  </Badge>
                </div>
                <p className="max-w-xl text-sm text-muted-foreground">
                  {learnerProfile.bio}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              <span>{learnerProfile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="size-4 text-muted-foreground" />
              <span>{learnerProfile.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="size-4 text-muted-foreground" />
              <span>
                Tham gia từ:{" "}
                {new Date(learnerProfile.joinedAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle>Thống kê</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">HLV đang theo</p>
              <p className="mt-1 text-xl font-semibold">
                {registeredCoaches.length}
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Danh sách HLV</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {registeredCoaches.map((c) => (
                  <Badge
                    key={c.id}
                    variant="secondary"
                    className="rounded-full text-xs"
                  >
                    {c.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
