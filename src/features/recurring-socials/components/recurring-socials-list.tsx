"use client"

import { Edit, Eye, MoreHorizontal, Pause, Trash2 } from "lucide-react"
import React, { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRecurringSocialsTranslation } from "@/i18n/use-recurring-socials-translation"

import type { RecurringSocialTemplate } from "../recurring-socials.types"
import {
  formatDateDisplayWithLocale,
  getLocalizedText,
  getRecurrenceTypeLabel,
  getStatusBadgeColor,
  getStatusLabel,
} from "../recurring-socials.utils"

interface RecurringSocialsListProps {
  socials: RecurringSocialTemplate[]
  onEdit?: (social: RecurringSocialTemplate) => void
  onPause?: (id: string) => void
  onDelete?: (id: string) => void
  onView?: (social: RecurringSocialTemplate) => void
}

export function RecurringSocialsList({
  socials,
  onEdit,
  onPause,
  onDelete,
  onView,
}: RecurringSocialsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { t, i18n } = useRecurringSocialsTranslation()
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US"

  const filteredSocials = socials.filter((social) => {
    const displayName = getLocalizedText(social.name, t, social.nameKey)
    const matchesSearch = displayName
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || social.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (filteredSocials.length === 0 && socials.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <p className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("recurringSocials.list.emptyTitle")}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("recurringSocials.list.emptyDescription")}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("recurringSocials.list.title")}</CardTitle>
            <CardDescription>
              {t("recurringSocials.list.description")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder={t("recurringSocials.list.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-50">
              <SelectValue
                placeholder={t("recurringSocials.list.statusFilterPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("recurringSocials.list.statuses.all")}
              </SelectItem>
              <SelectItem value="active">
                {t("recurringSocials.list.statuses.active")}
              </SelectItem>
              <SelectItem value="paused">
                {t("recurringSocials.list.statuses.paused")}
              </SelectItem>
              <SelectItem value="expired">
                {t("recurringSocials.list.statuses.expired")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredSocials.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("recurringSocials.list.searchEmpty")}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("recurringSocials.list.foundCount", {
                count: filteredSocials.length,
              })}
            </p>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("recurringSocials.list.table.name")}
                    </TableHead>
                    <TableHead>
                      {t("recurringSocials.list.table.recurrenceType")}
                    </TableHead>
                    <TableHead>
                      {t("recurringSocials.list.table.time")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("recurringSocials.list.table.courts")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("recurringSocials.list.table.capacity")}
                    </TableHead>
                    <TableHead>
                      {t("recurringSocials.list.table.status")}
                    </TableHead>
                    <TableHead>
                      {t("recurringSocials.list.table.createdAt")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("recurringSocials.list.table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSocials.map((social) => (
                    <TableRow key={social.id}>
                      <TableCell className="font-medium">
                        {getLocalizedText(social.name, t, social.nameKey)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getRecurrenceTypeLabel(social.recurrenceType, t)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {social.startTime} - {social.endTime}
                      </TableCell>
                      <TableCell className="text-right">
                        {social.courts.length}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          {social.courts.length * social.maxPerCourt}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(social.status)}>
                          {getStatusLabel(social.status, t)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateDisplayWithLocale(
                          social.createdAt.split("T")[0],
                          locale
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onView && (
                              <DropdownMenuItem onClick={() => onView(social)}>
                                <Eye className="mr-2 size-4" />
                                {t("recurringSocials.list.actions.view")}
                              </DropdownMenuItem>
                            )}
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(social)}>
                                <Edit className="mr-2 size-4" />
                                {t("recurringSocials.list.actions.edit")}
                              </DropdownMenuItem>
                            )}
                            {onPause && social.status === "active" && (
                              <DropdownMenuItem
                                onClick={() => onPause(social.id)}
                              >
                                <Pause className="mr-2 size-4" />
                                {t("recurringSocials.list.actions.pause")}
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete(social.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 size-4" />
                                {t("recurringSocials.list.actions.delete")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
