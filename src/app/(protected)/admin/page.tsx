"use client"

import dayjs from "dayjs"
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  MapPin,
  Search,
  Star,
  Users,
  XCircle,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useMemo, useState } from "react"
import { toast } from "sonner"

import { PageContainer } from "@/components/page-container"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { Textarea } from "@/components/ui/textarea"
import { AdminCoachDetailPanel } from "@/features/coach/components/admin-coach-detail-panel"
import { useAdminCertifications, useAdminPendingCertifications, useAdminReviewCertification,useCoachList } from "@/features/coach/hooks/use-coach-queries"
import type { CertificationWithCoach,CoachLevel, VerificationStatus } from "@/features/coach/types/coach"

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

function AdminCoachTable({
  onSelectCoach,
}: {
  onSelectCoach: (id: string) => void
}) {
  const router = useRouter()
  const sp = useSearchParams()
  const [page, setPage] = useState(() => parseInt(sp.get("page") || "1", 10))
  const [search, setSearch] = useState(() => sp.get("search") || "")
  const [statusFilter, setStatusFilter] = useState<string>(() => sp.get("status") || "ALL")
  const [levelFilter, setLevelFilter] = useState<string>(() => sp.get("level") || "ALL")
  const limit = 10

  const updateUrl = useCallback((updates: Record<string, string | undefined>) => {
    const p = new URLSearchParams(sp.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        p.delete(key)
      } else {
        p.set(key, value)
      }
    })
    p.delete("coachId")
    router.replace(`/admin?${p.toString()}`, { scroll: false })
  }, [router, sp])

  const { data, isLoading, error } = useCoachList({
    page,
    limit,
    ...(levelFilter !== "ALL" ? { level: levelFilter } : {}),
  })

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
  const verifiedCount = allCoaches.filter((c) => c.verificationStatus === "VERIFIED").length
  const pendingCount = allCoaches.filter((c) => c.verificationStatus === "PENDING").length
  const rejectedCount = allCoaches.filter((c) => c.verificationStatus === "REJECTED").length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SummarySkeleton />
        <TableSkeleton />
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive">Không thể tải danh sách huấn luyện viên</p>
  }

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            <XCircle className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); updateUrl({ search: e.target.value || undefined, page: "1" }) }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); updateUrl({ status: val === "ALL" ? undefined : val, page: "1" }) }}>
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
          <Select value={levelFilter} onValueChange={(val) => { setLevelFilter(val); setPage(1); updateUrl({ level: val === "ALL" ? undefined : val, page: "1" }) }}>
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
                        <AvatarFallback>{coach.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{coach.displayName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{LEVEL_LABELS[coach.level]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="size-3" />
                        <span>{coach.locationCity}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(coach.verificationStatus)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span>{coach.averageRating > 0 ? coach.averageRating.toFixed(1) : "—"}</span>
                        <span className="text-xs text-muted-foreground">({coach.reviewCount})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="xs" onClick={() => onSelectCoach(coach.id)}>
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Hiển thị {(meta.page - 1) * limit + 1}–{Math.min(meta.page * limit, meta.total)} / {meta.total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { const np = Math.max(1, page - 1); setPage(np); updateUrl({ page: np > 1 ? String(np) : undefined }) }}>
                  Trước
                </Button>
                <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => { const np = page + 1; setPage(np); updateUrl({ page: String(np) }) }}>
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

function CertificationReviewDialog({
  cert,
  open,
  onOpenChange,
}: {
  cert: CertificationWithCoach | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const reviewMutation = useAdminReviewCertification()
  const [reviewStatus, setReviewStatus] = useState<"VERIFIED" | "REJECTED">("VERIFIED")
  const [reviewNote, setReviewNote] = useState("")

  const handleSubmit = async () => {
    if (!cert) return
    try {
      await reviewMutation.mutateAsync({
        certId: cert.id,
        dto: { verificationStatus: reviewStatus, reviewNote: reviewNote || undefined },
      })
      toast.success(reviewStatus === "VERIFIED" ? "Chứng chỉ đã được xác thực" : "Chứng chỉ đã bị từ chối")
      onOpenChange(false)
    } catch {
      toast.error("Có lỗi xảy ra khi duyệt chứng chỉ")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duyệt chứng chỉ: {cert?.name}</DialogTitle>
          <DialogDescription>
            Xác nhận hoặc từ chối chứng chỉ của {cert?.coachProfile.displayName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Trạng thái xác thực</Label>
            <RadioGroup
              value={reviewStatus}
              onValueChange={(val) => setReviewStatus(val as "VERIFIED" | "REJECTED")}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="VERIFIED" id="cert-verified" />
                <Label htmlFor="cert-verified" className="font-normal">Xác nhận</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="REJECTED" id="cert-rejected" />
                <Label htmlFor="cert-rejected" className="font-normal">Từ chối</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cert-review-note">Ghi chú duyệt (không bắt buộc)</Label>
            <Textarea
              id="cert-review-note"
              placeholder="Nhập ghi chú..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={reviewMutation.isPending}>
            {reviewMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CertificationsSection() {
  const { data: pendingCerts, isLoading: pendingLoading } = useAdminPendingCertifications()
  const { data: verifiedData, isLoading: verifiedLoading } = useAdminCertifications({ verificationStatus: "VERIFIED", page: 1, limit: 50 })
  const { data: rejectedData, isLoading: rejectedLoading } = useAdminCertifications({ verificationStatus: "REJECTED", page: 1, limit: 50 })

  const [reviewCert, setReviewCert] = useState<CertificationWithCoach | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [certTab, setCertTab] = useState("pending")

  const openReview = (cert: CertificationWithCoach) => {
    setReviewCert(cert)
    setDialogOpen(true)
  }

  const sortedPending = pendingCerts ? [...pendingCerts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  ) : []

  return (
    <div className="space-y-4">
      <Tabs value={certTab} onValueChange={setCertTab}>
        <TabsList>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="verified">Đã duyệt</TabsTrigger>
          <TabsTrigger value="rejected">Từ chối</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="pt-4">
          {pendingLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))}
            </div>
          ) : sortedPending.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><CheckCircle2 className="size-6" /></EmptyMedia>
                <EmptyTitle>Không có chứng chỉ chờ duyệt</EmptyTitle>
                <EmptyDescription>Tất cả chứng chỉ đã được xử lý.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-3">
              {sortedPending.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{dayjs(cert.createdAt).format("DD/MM/YYYY HH:mm")}</span>
                        </div>
                        <h3 className="text-base font-semibold">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          HLV: <span className="font-medium text-foreground">{cert.coachProfile.displayName}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">Tổ chức cấp: {cert.issuingOrganization}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Ngày cấp: {dayjs(cert.issuedAt).format("DD/MM/YYYY")}</span>
                          {cert.expiresAt && <span>Hết hạn: {dayjs(cert.expiresAt).format("DD/MM/YYYY")}</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {cert.documentUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="size-4" />
                              Xem tài liệu
                              <ExternalLink className="size-3" />
                            </a>
                          </Button>
                        )}
                        <Button variant="default" size="sm" onClick={() => openReview(cert)}>Duyệt</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="verified" className="pt-4">
          {verifiedLoading ? (
            <Skeleton className="h-32 w-full rounded-md" />
          ) : !verifiedData?.data?.length ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><CheckCircle2 className="size-6" /></EmptyMedia>
                <EmptyTitle>Chưa có chứng chỉ được duyệt</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>HLV</TableHead>
                    <TableHead>Chứng chỉ</TableHead>
                    <TableHead>Tổ chức</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifiedData.data.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.coachProfile.displayName}</TableCell>
                      <TableCell>{cert.name}</TableCell>
                      <TableCell>{cert.issuingOrganization}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="pt-4">
          {rejectedLoading ? (
            <Skeleton className="h-32 w-full rounded-md" />
          ) : !rejectedData?.data?.length ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><XCircle className="size-6" /></EmptyMedia>
                <EmptyTitle>Chưa có chứng chỉ bị từ chối</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>HLV</TableHead>
                    <TableHead>Chứng chỉ</TableHead>
                    <TableHead>Tổ chức</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedData.data.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.coachProfile.displayName}</TableCell>
                      <TableCell>{cert.name}</TableCell>
                      <TableCell>{cert.issuingOrganization}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CertificationReviewDialog
        cert={reviewCert}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}

function AdminPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedCoachId = searchParams.get("coachId") || ""

  const handleSelectCoach = useCallback((coachId: string) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set("coachId", coachId)
    router.replace(`/admin?${p.toString()}`, { scroll: false })
  }, [router, searchParams])

  const handleBack = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString())
    p.delete("coachId")
    router.replace(`/admin?${p.toString()}`, { scroll: false })
  }, [router, searchParams])

  if (selectedCoachId) {
    return (
      <PageContainer className="space-y-6">
        <AdminCoachDetailPanel coachId={selectedCoachId} onBack={handleBack} />
      </PageContainer>
    )
  }

  return (
    <PageContainer variant="wide" className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Quản lý Huấn luyện viên</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin, trạng thái xác thực và hoạt động của huấn luyện viên trong hệ thống.
        </p>
      </div>

      <Tabs defaultValue="coaches">
        <TabsList>
          <TabsTrigger value="coaches">Danh sách HLV</TabsTrigger>
          <TabsTrigger value="certifications">Chứng chỉ</TabsTrigger>
        </TabsList>
        <TabsContent value="coaches" className="pt-4">
          <AdminCoachTable onSelectCoach={handleSelectCoach} />
        </TabsContent>
        <TabsContent value="certifications" className="pt-4">
          <CertificationsSection />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminPageInner />
    </Suspense>
  )
}
