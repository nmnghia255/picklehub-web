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

import type { RecurringSocialTemplate } from "../recurring-socials.types"
import {
  formatDateDisplay,
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

  const filteredSocials = socials.filter((social) => {
    const matchesSearch = social.name
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
              Chưa có social tự động nào
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Hãy tạo một social tự động mới để bắt đầu
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
            <CardTitle>Danh sách social tự động</CardTitle>
            <CardDescription>Quản lý các social định kỳ đã tạo</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo tên social..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-50">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="paused">Tạm dừng</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Empty state for search */}
        {filteredSocials.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Không tìm thấy social nào phù hợp
            </p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tìm thấy {filteredSocials.length} social
            </p>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên social</TableHead>
                    <TableHead>Loại lặp</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Sân</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSocials.map((social) => (
                    <TableRow key={social.id}>
                      <TableCell className="font-medium">
                        {social.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getRecurrenceTypeLabel(social.recurrenceType)}
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
                          {getStatusLabel(social.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateDisplay(social.createdAt.split("T")[0])}
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
                                Xem chi tiết
                              </DropdownMenuItem>
                            )}
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(social)}>
                                <Edit className="mr-2 size-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                            )}
                            {onPause && social.status === "active" && (
                              <DropdownMenuItem
                                onClick={() => onPause(social.id)}
                              >
                                <Pause className="mr-2 size-4" />
                                Tạm dừng
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete(social.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 size-4" />
                                Xóa
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
