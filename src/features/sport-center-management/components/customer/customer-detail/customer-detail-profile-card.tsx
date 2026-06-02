"use client"

import { CalendarDays, UserRound } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { CustomerDetailResponse } from "@/features/sport-center-management/types/customer"

import { formatDateTimeLong } from "../customer.utils"

interface CustomerDetailProfileCardProps {
  detail: CustomerDetailResponse
}

export function CustomerDetailProfileCard({
  detail,
}: CustomerDetailProfileCardProps) {
  const customer = detail.customer

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-16 shadow-sm ring-4 ring-background">
          <AvatarImage
            src={customer.avatarUrl ?? undefined}
            alt={customer.name ?? "Customer"}
          />
          <AvatarFallback className="bg-sky-100 text-base font-semibold text-sky-700">
            {getInitials(customer.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {customer.name}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {customer.email || "Chưa cập nhật email"}
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border bg-background/80 px-3 py-1 shadow-sm">
              <UserRound className="size-3.5 text-sky-500" />
              {customer.phoneNumber || "Chưa cập nhật số điện thoại"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border bg-background/80 px-3 py-1 shadow-sm">
              <CalendarDays className="size-3.5 text-emerald-500" />
              Lần đầu: {formatDateTimeLong(detail.summary.firstVisitAt)}
            </span>
          </div>
        </div>

        <Badge
          variant="outline"
          className="self-start border-sky-200 bg-sky-50 text-sky-700"
        >
          {customer.id}
        </Badge>
      </div>
    </section>
  )
}

function getInitials(name?: string | null) {
  const text = name?.trim() ?? ""
  if (!text) return "KH"

  return text
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2)
}

export default CustomerDetailProfileCard
