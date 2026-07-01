"use client"

import { useState } from "react"
import dayjs from "dayjs"
import { toast } from "sonner"
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Search,
  Filter,
} from "lucide-react"

import { PageContainer } from "@/components/page-container"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import {
  useAdminPendingCertifications,
  useAdminCertifications,
  useAdminReviewCertification,
} from "@/features/coach/hooks/use-coach-queries"
import type { CertificationWithCoach, VerificationStatus } from "@/features/coach/types/coach"

const STATUS_CONFIG: Record<VerificationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  VERIFIED: { label: "Đã xác thực", variant: "default" },
  PENDING: { label: "Chờ duyệt", variant: "secondary" },
  UNVERIFIED: { label: "Chưa xác thực", variant: "outline" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
}

function getStatusBadge(status: VerificationStatus) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function PendingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AllCertificationsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="rounded-md border">
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

function PendingTab() {
  const { data: pendingCerts, isLoading, error } = useAdminPendingCertifications()
  const reviewMutation = useAdminReviewCertification()
  const [selectedCert, setSelectedCert] = useState<CertificationWithCoach | null>(null)
  const [reviewStatus, setReviewStatus] = useState<"VERIFIED" | "REJECTED">("VERIFIED")
  const [reviewNote, setReviewNote] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const openReviewDialog = (cert: CertificationWithCoach) => {
    setSelectedCert(cert)
    setReviewStatus("VERIFIED")
    setReviewNote("")
    setDialogOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!selectedCert) return
    try {
      await reviewMutation.mutateAsync({
        certId: selectedCert.id,
        dto: { verificationStatus: reviewStatus, reviewNote: reviewNote || undefined },
      })
      toast.success(
        reviewStatus === "VERIFIED"
          ? "Chứng chỉ đã được xác thực thành công"
          : "Chứng chỉ đã bị từ chối"
      )
      setDialogOpen(false)
      setSelectedCert(null)
    } catch {
      toast.error("Có lỗi xảy ra khi duyệt chứng chỉ")
    }
  }

  if (isLoading) return <PendingSkeleton />
  if (error) return <p className="text-sm text-destructive">Không thể tải danh sách chờ duyệt</p>
  if (!pendingCerts || pendingCerts.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckCircle2 className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Không có chứng chỉ chờ duyệt</EmptyTitle>
          <EmptyDescription>
            Tất cả chứng chỉ hiện tại đã được xử lý hoặc chưa có yêu cầu mới.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const sorted = [...pendingCerts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return (
    <>
      <div className="space-y-4">
        {sorted.map((cert) => (
          <Card key={cert.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {dayjs(cert.createdAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Huấn luyện viên:{" "}
                    <span className="font-medium text-foreground">
                      {cert.coachProfile.displayName}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tổ chức cấp: {cert.issuingOrganization}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>
                      Ngày cấp: {dayjs(cert.issuedAt).format("DD/MM/YYYY")}
                    </span>
                    {cert.expiresAt && (
                      <span>
                        Hết hạn: {dayjs(cert.expiresAt).format("DD/MM/YYYY")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {cert.documentUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={cert.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="size-4" />
                        Xem tài liệu
                        <ExternalLink className="size-3" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => openReviewDialog(cert)}
                  >
                    Duyệt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Duyệt chứng chỉ: {selectedCert?.name}
            </DialogTitle>
            <DialogDescription>
              Xác nhận hoặc từ chối chứng chỉ của{" "}
              {selectedCert?.coachProfile.displayName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Trạng thái xác thực</Label>
              <RadioGroup
                value={reviewStatus}
                onValueChange={(val) =>
                  setReviewStatus(val as "VERIFIED" | "REJECTED")
                }
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="VERIFIED" id="verified" />
                  <Label htmlFor="verified" className="font-normal">
                    Xác nhận
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="REJECTED" id="rejected" />
                  <Label htmlFor="rejected" className="font-normal">
                    Từ chối
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewNote">Ghi chú duyệt (không bắt buộc)</Label>
              <Textarea
                id="reviewNote"
                placeholder="Nhập ghi chú..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function AllCertificationsTab() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const limit = 10

  const params: {
    verificationStatus?: string
    page: number
    limit: number
  } = {
    page,
    limit,
  }
  if (statusFilter !== "ALL") {
    params.verificationStatus = statusFilter
  }

  const { data, isLoading, error } = useAdminCertifications(params)

  if (isLoading) return <AllCertificationsSkeleton />
  if (error) return <p className="text-sm text-destructive">Không thể tải danh sách chứng chỉ</p>

  const certs = data?.data ?? []
  const meta = data?.meta ?? { page: 1, limit, total: 0, totalPages: 0 }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="VERIFIED">Đã xác thực</SelectItem>
            <SelectItem value="UNVERIFIED">Chưa xác thực</SelectItem>
            <SelectItem value="PENDING">Chờ duyệt</SelectItem>
            <SelectItem value="REJECTED">Từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {certs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Không tìm thấy chứng chỉ</EmptyTitle>
            <EmptyDescription>
              Không có chứng chỉ nào khớp với bộ lọc hiện tại.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Huấn luyện viên</TableHead>
                  <TableHead>Chứng chỉ</TableHead>
                  <TableHead>Tổ chức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người duyệt</TableHead>
                  <TableHead>Ngày duyệt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certs.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">
                      {cert.coachProfile.displayName}
                    </TableCell>
                    <TableCell>{cert.name}</TableCell>
                    <TableCell>{cert.issuingOrganization}</TableCell>
                    <TableCell>
                      {getStatusBadge(cert.verificationStatus)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cert.reviewedByUserId || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cert.updatedAt !== cert.createdAt
                        ? dayjs(cert.updatedAt).format("DD/MM/YYYY")
                        : "—"}
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

export default function AdminCertificationsPage() {
  return (
    <PageContainer variant="wide" className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Duyệt chứng chỉ
        </h1>
        <p className="text-sm text-muted-foreground">
          Quản lý và xác thực chứng chỉ của huấn luyện viên.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="all">Tất cả chứng chỉ</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="pt-4">
          <PendingTab />
        </TabsContent>
        <TabsContent value="all" className="pt-4">
          <AllCertificationsTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
