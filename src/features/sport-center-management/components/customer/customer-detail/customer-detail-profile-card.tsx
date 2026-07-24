"use client"

import { CalendarDays, UserRound } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { CustomerDetailResponse } from "@/features/sport-center-management/types/customer"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { formatDateTimeLong } from "../customer.utils"

interface CustomerDetailProfileCardProps {
  detail: CustomerDetailResponse
}

export function CustomerDetailProfileCard({
  detail,
}: CustomerDetailProfileCardProps) {
  const { t } = useSportCenterManagementTranslation()
  const customer = detail.customer

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Avatar className="size-16 shadow-sm ring-4 ring-background">
        <AvatarImage
          src={customer.avatarUrl ?? undefined}
          alt={customer.name ?? t("common.customer")}
        />
        <AvatarFallback className="bg-sky-100 text-base font-semibold text-sky-700">
          {getInitials(customer.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {customer.name}
          </p>
          <Badge
            variant="outline"
            className="border-sky-200 bg-sky-50 text-xs font-medium text-sky-700"
          >
            {customer.id}
          </Badge>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {customer.email || t("common.emailNotUpdated")}
        </p>
        <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 font-medium">
            <UserRound className="size-3.5 text-sky-500" />
            {customer.phoneNumber || t("common.phoneNotUpdated")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 font-medium">
            <CalendarDays className="size-3.5 text-emerald-500" />
            {t("customer.detail.firstVisit")}:{" "}
            {formatDateTimeLong(detail.summary.firstVisitAt)}
          </span>
        </div>
      </div>
    </div>
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
