"use client"

import { useParams } from "next/navigation"
import { useCoachPublicProfile } from "@/features/coach/hooks/use-coach-queries"
import {
  Shield,
  ChevronLeft,
  Star,
  MapPin,
  Award,
  Users,
  AlertTriangle,
  Lock,
  Unlock,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import type { CoachLevel, CoachStatus, VerificationStatus } from "@/features/coach/types/coach"

const LEVEL_LABEL: Record<CoachLevel, string> = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
  Pro: "Chuyên nghiệp",
}

const STATUS_LABEL: Record<CoachStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Nháp", variant: "secondary" },
  ACTIVE: { label: "Hoạt động", variant: "default" },
  SUSPENDED: { label: "Đã khóa", variant: "destructive" },
}

const VERIFICATION_LABEL: Record<VerificationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  VERIFIED: { label: "Đã xác thực", variant: "default" },
  PENDING: { label: "Chờ duyệt", variant: "secondary" },
  UNVERIFIED: { label: "Chưa xác thực", variant: "outline" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-5 w-48" />
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminCoachDetailPage() {
  const params = useParams()
  const coachId = params.coachId as string
  const { data: coach, isLoading, error } = useCoachPublicProfile(coachId)

  if (isLoading) {
    return (
      <PageContainer className="space-y-6">
        <LoadingSkeleton />
      </PageContainer>
    )
  }

  if (error || !coach) {
    return (
      <PageContainer className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/admin/coaches" className="flex items-center gap-1 hover:text-foreground">
            <ChevronLeft className="size-4" />
            Quay lại danh sách
          </Link>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="size-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Huấn luyện viên không tồn tại</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Không thể tìm thấy thông tin huấn luyện viên này.
            </p>
            <Button asChild>
              <Link href="/admin/coaches">
                <ChevronLeft className="size-4" />
                Quay lại danh sách
              </Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  const statusConfig = STATUS_LABEL[coach.status]
  const verificationConfig = VERIFICATION_LABEL[coach.verificationStatus]

  return (
    <PageContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/coaches"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Quay lại danh sách
        </Link>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/coaches/${coachId}`} target="_blank">
            <ExternalLink className="size-4" />
            Xem trang công khai
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Avatar size="lg" className="size-16">
          <AvatarImage src={coach.avatarUrl} alt={coach.displayName} />
          <AvatarFallback>{coach.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight truncate">
              {coach.displayName}
            </h1>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            <Badge variant={verificationConfig.variant}>
              <Shield className="size-3" />
              {verificationConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Badge variant="outline">{LEVEL_LABEL[coach.level]}</Badge>
            {coach.locationCity && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {coach.locationCity}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {coach.averageRating > 0 ? coach.averageRating.toFixed(1) : "Chưa có đánh giá"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="size-4 text-muted-foreground" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Kinh nghiệm</p>
              <p className="text-sm font-medium">{coach.yearsExperience} năm</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Giá theo giờ</p>
              <p className="text-sm font-medium">
                {coach.hourlyRateVnd.toLocaleString("vi-VN")}₫
              </p>
            </div>
            {coach.specialties.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Chuyên môn</p>
                <div className="flex flex-wrap gap-1">
                  {coach.specialties.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {coach.languages.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ngôn ngữ</p>
                <div className="flex flex-wrap gap-1">
                  {coach.languages.map((l) => (
                    <Badge key={l} variant="outline" className="text-xs">
                      {l}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {coach.bio && (
              <div>
                <p className="text-xs text-muted-foreground">Giới thiệu</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{coach.bio}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Ngày tham gia</p>
              <p className="text-sm font-medium">{new Date(coach.createdAt).toLocaleDateString("vi-VN")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4 text-muted-foreground" />
              Chứng chỉ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {coach.certifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có chứng chỉ nào</p>
            ) : (
              coach.certifications.map((cert) => {
                const certVerificationConfig = VERIFICATION_LABEL[cert.verificationStatus]
                return (
                  <div key={cert.id} className="rounded-lg border p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{cert.name}</p>
                      <Badge variant={certVerificationConfig.variant} className="shrink-0">
                        {certVerificationConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cert.issuingOrganization}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cấp ngày: {new Date(cert.issuedAt).toLocaleDateString("vi-VN")}
                      {cert.expiresAt && ` · Hết hạn: ${new Date(cert.expiresAt).toLocaleDateString("vi-VN")}`}
                    </p>
                    {cert.documentUrl && (
                      <Button variant="link" size="xs" className="h-auto p-0 text-xs" asChild>
                        <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer">
                          Xem tài liệu
                          <ExternalLink className="size-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-muted-foreground" />
              Thống kê
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Đánh giá</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {coach.averageRating > 0 ? coach.averageRating.toFixed(1) : "—"}
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Lượt đánh giá</p>
              <p className="text-sm font-medium">{coach.reviewCount}</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Tổng số buổi học</p>
              <p className="text-sm font-medium text-muted-foreground">—</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Học viên</p>
              <p className="text-sm font-medium text-muted-foreground">—</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Số chứng chỉ</p>
              <p className="text-sm font-medium">{coach.certifications.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4 text-muted-foreground" />
            Quản lý tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Các thao tác quản trị dành cho huấn luyện viên này.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" disabled>
              <Lock className="size-4" />
              Khóa tài khoản
              <span className="text-[10px] opacity-60">(TODO)</span>
            </Button>
            <Button variant="default" disabled>
              <Unlock className="size-4" />
              Kích hoạt tài khoản
              <span className="text-[10px] opacity-60">(TODO)</span>
            </Button>
            <Button variant="outline" disabled>
              Cập nhật HLV
              <span className="text-[10px] opacity-60">(TODO)</span>
            </Button>
          </div>

          <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
            <p>🔴 Khóa tài khoản — TODO: Missing API — <code>POST /api/admin/coaches/{coachId}/suspend</code></p>
            <p>🟢 Kích hoạt tài khoản — TODO: Missing API — <code>POST /api/admin/coaches/{coachId}/activate</code></p>
            <p>🔄 Cập nhật HLV — TODO: Missing API — <code>PATCH /api/admin/coaches/{coachId}</code></p>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="size-4" />
        <AlertTitle>API còn thiếu</AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-1 text-xs">
            <p>
              <code className="rounded bg-muted px-1 py-0.5">POST /api/admin/coaches/{coachId}/suspend</code>
              {" — "}Khóa tài khoản HLV
            </p>
            <p>
              <code className="rounded bg-muted px-1 py-0.5">POST /api/admin/coaches/{coachId}/activate</code>
              {" — "}Kích hoạt tài khoản HLV
            </p>
            <p>
              <code className="rounded bg-muted px-1 py-0.5">PATCH /api/admin/coaches/{coachId}</code>
              {" — "}Cập nhật thông tin HLV
            </p>
            <p>
              <code className="rounded bg-muted px-1 py-0.5">GET /api/admin/coaches</code>
              {" — "}Danh sách tất cả HLV (có filter)
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </PageContainer>
  )
}
