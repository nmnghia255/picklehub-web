"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Search,
  Shield,
  Star,
  Users,
  XCircle,
} from "lucide-react"

import { PageContainer } from "@/components/page-container"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useCoachList } from "@/features/coach/hooks/use-coach-queries"
import type { CoachLevel, VerificationStatus } from "@/features/coach/types/coach"

const LEVEL_LABELS: Record<CoachLevel, string> = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
  Pro: "Chuyên nghiệp",
}

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  VERIFIED: { label: "Đã xác thực", variant: "default" },
  PENDING: { label: "Chờ duyệt", variant: "secondary" },
  UNVERIFIED: { label: "Chưa xác thực", variant: "outline" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
}

function getStatusBadge(status: VerificationStatus) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function SummarySkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-8 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}

function CoachListTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [levelFilter, setLevelFilter] = useState<string>("ALL")
  const limit = 10

  const { data, isLoading, error } = useCoachList(
    {
      page,
      limit,
      ...(levelFilter !== "ALL" ? { level: levelFilter } : {}),
      /* TODO: Missing API - Server-side search/filter for coaches. Need search & verificationStatus params on GET /api/coaches */
    } as any
  )

  const coaches = useMemo(() => {
    if (!data?.data) return []
    let result = data.data
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((c) => c.displayName.toLowerCase().includes(q))
    }
    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.verificationStatus === statusFilter)
    }
    return result
  }, [data, search, statusFilter])

  const meta = data?.pagination ?? { page: 1, limit, total: 0, totalPages: 0 }
  const allCoaches = data?.data ?? []
  const totalCoaches = meta.total
  const verifiedCount = allCoaches.filter(
    (c) => c.verificationStatus === "VERIFIED"
  ).length
  const pendingCount = allCoaches.filter(
    (c) => c.verificationStatus === "PENDING"
  ).length
  const rejectedCount = allCoaches.filter(
    (c) => c.verificationStatus === "REJECTED"
  ).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SummarySkeleton />
        <TableSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Không thể tải danh sách huấn luyện viên
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {/*
        TODO: Missing API - Admin coach stats summary. Need GET /api/admin/coaches/stats
        to return total, verified, pending, rejected counts server-side.
      */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số HLV</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCoaches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đã xác thực</CardTitle>
            <CheckCircle2 className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {verifiedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            <XCircle className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rejectedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Trạng thái xác thực" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="VERIFIED">Đã xác thực</SelectItem>
              <SelectItem value="UNVERIFIED">Chưa xác thực</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={levelFilter}
            onValueChange={(val) => {
              setLevelFilter(val)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Cấp độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả cấp độ</SelectItem>
              <SelectItem value="Beginner">Cơ bản</SelectItem>
              <SelectItem value="Intermediate">Trung cấp</SelectItem>
              <SelectItem value="Advanced">Nâng cao</SelectItem>
              <SelectItem value="Pro">Chuyên nghiệp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {coaches.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Không tìm thấy huấn luyện viên</EmptyTitle>
            <EmptyDescription>
              {search || statusFilter !== "ALL" || levelFilter !== "ALL"
                ? "Không có huấn luyện viên nào khớp với bộ lọc hiện tại."
                : "Chưa có huấn luyện viên nào trong hệ thống."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Avatar</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead>Thành phố</TableHead>
                  <TableHead>Trạng thái xác thực</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coaches.map((coach) => (
                  <TableRow key={coach.id}>
                    <TableCell>
                      <Avatar size="sm">
                        <AvatarImage src={coach.avatarUrl} alt={coach.displayName} />
                        <AvatarFallback>
                          {coach.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {coach.displayName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {LEVEL_LABELS[coach.level]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="size-3" />
                        <span>{coach.locationCity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(coach.verificationStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span>
                          {coach.averageRating > 0
                            ? coach.averageRating.toFixed(1)
                            : "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({coach.reviewCount})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/*
                          TODO: Missing API - Admin suspend/activate coach. Need PATCH /api/admin/coaches/{coachId}/status
                        */}
                        <Button variant="outline" size="xs" asChild>
                          <Link href={`/admin/coaches/${coach.id}`}>
                            Xem chi tiết
                          </Link>
                        </Button>
                        <Badge variant="secondary" className="cursor-pointer" asChild>
                          <Link href={`/coaches/${coach.id}`}>
                            Xem public profile
                          </Link>
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Hiển thị {(meta.page - 1) * limit + 1}–
                {Math.min(meta.page * limit, meta.total)} / {meta.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CertificationsTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Quản lý và duyệt chứng chỉ của huấn luyện viên.
      </p>
      <Button variant="default" asChild>
        <Link href="/admin/certifications">
          <Shield className="size-4" />
          Duyệt chứng chỉ
        </Link>
      </Button>
    </div>
  )
}

export default function AdminPage() {
  return (
    <PageContainer variant="wide" className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Quản lý Huấn luyện viên
        </h1>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin, trạng thái xác thực và hoạt động của huấn luyện
          viên trong hệ thống.
        </p>
      </div>

      <Tabs defaultValue="coaches">
        <TabsList>
          <TabsTrigger value="coaches">Danh sách HLV</TabsTrigger>
          <TabsTrigger value="certifications">Chứng chỉ</TabsTrigger>
        </TabsList>
        <TabsContent value="coaches" className="pt-4">
          <CoachListTab />
        </TabsContent>
        <TabsContent value="certifications" className="pt-4">
          <CertificationsTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
