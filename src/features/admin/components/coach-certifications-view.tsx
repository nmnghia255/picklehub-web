"use client"

import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

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
  EmptyTitle,
} from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

import {
  getCoachCertifications,
  reviewCoachCertification,
} from "../api/admin-service"
import type { CoachCertification } from "../types"

export function CoachCertificationsView() {
  const [certifications, setCertifications] = useState<CoachCertification[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCert, setSelectedCert] = useState<CoachCertification | null>(
    null
  )
  const [reviewNote, setReviewNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchCertifications = useCallback(async () => {
    try {
      const res = await getCoachCertifications({
        verificationStatus: statusFilter,
        page,
        limit,
      })
      setCertifications(res.data || [])
      if (res.pagination) {
        setTotal(res.pagination.total || 0)
        setTotalPages(res.pagination.totalPages || 1)
      } else {
        setTotal((res.data || []).length)
        setTotalPages(1)
      }
    } catch (error) {
      console.error("Failed to fetch coach certifications:", error)
      toast.error("Không thể tải danh sách chứng chỉ HLV")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page, limit])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCertifications()
  }, [fetchCertifications])

  const handleOpenReview = (cert: CoachCertification) => {
    setSelectedCert(cert)
    setReviewNote(cert.reviewNote || "")
    setModalOpen(true)
  }

  const handleReviewAction = async (status: "VERIFIED" | "REJECTED") => {
    if (!selectedCert) return
    setSubmitting(true)
    try {
      await reviewCoachCertification(selectedCert.id, {
        verificationStatus: status,
        reviewNote:
          reviewNote.trim() ||
          (status === "REJECTED"
            ? "Từ chối chứng chỉ bởi Admin"
            : "Đã xác minh chứng chỉ"),
      })
      toast.success(
        status === "VERIFIED"
          ? "Đã phê duyệt chứng chỉ thành công!"
          : "Đã từ chối chứng chỉ thành công!"
      )
      setModalOpen(false)
      fetchCertifications()
    } catch (error: unknown) {
      console.error("Failed to review certification:", error)
      const errObj = error as {
        response?: { status?: number; data?: { message?: string } }
        message?: string
      }
      const backendMsg =
        errObj?.response?.data?.message ||
        errObj?.message ||
        "Thao tác duyệt chứng chỉ thất bại"
      toast.error(`Lỗi ${errObj?.response?.status || 500}: ${backendMsg}`)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge className="border-emerald-200 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            Đã duyệt
          </Badge>
        )
      case "REJECTED":
        return <Badge variant="destructive">Từ chối</Badge>
      case "PENDING":
      default:
        return (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          >
            Chờ duyệt
          </Badge>
        )
    }
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A"
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN")
    } catch {
      return dateStr
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            <Award className="size-6 text-emerald-600" />
            Coach Certification Verification
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Quản lý và xét duyệt các bằng cấp/chứng chỉ Huấn luyện viên đã tải
            lên hệ thống.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchCertifications}
          disabled={loading}
          className="w-fit"
        >
          <RefreshCw
            className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">
              Danh sách chứng chỉ ({total})
            </CardTitle>

            {/* Filter Bar */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Filter className="size-4" />
                <span>Trạng thái:</span>
              </div>
              <NativeSelect
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="w-40"
              >
                <NativeSelectOption value="ALL">Tất cả</NativeSelectOption>
                <NativeSelectOption value="PENDING">
                  Chờ duyệt (PENDING)
                </NativeSelectOption>
                <NativeSelectOption value="VERIFIED">
                  Đã duyệt (VERIFIED)
                </NativeSelectOption>
                <NativeSelectOption value="REJECTED">
                  Từ chối (REJECTED)
                </NativeSelectOption>
              </NativeSelect>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-8 text-emerald-600" />
            </div>
          ) : certifications.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyTitle>Không tìm thấy chứng chỉ nào</EmptyTitle>
                <EmptyDescription>
                  Chưa có chứng chỉ HLV nào phù hợp với bộ lọc hiện tại.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      HLV (Coach)
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Tên chứng chỉ
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Tổ chức cấp
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Ngày cấp / Hết hạn
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Tài liệu
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certifications.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium break-words whitespace-normal">
                        {cert.coachProfile?.displayName ||
                          cert.coachProfileId ||
                          "N/A"}
                      </TableCell>
                      <TableCell className="font-semibold break-words whitespace-normal text-slate-800 dark:text-zinc-200">
                        {cert.name}
                      </TableCell>
                      <TableCell className="text-xs break-words whitespace-normal">
                        {cert.issuingOrganization}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap text-slate-500">
                        <div>Cấp: {formatDate(cert.issuedAt)}</div>
                        {cert.expiresAt && (
                          <div>Hạn: {formatDate(cert.expiresAt)}</div>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {cert.documentUrl ? (
                          <a
                            href={cert.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                          >
                            <FileText className="size-3.5" />
                            Xem file
                            <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Không có
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getStatusBadge(cert.verificationStatus)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant={
                            cert.verificationStatus === "PENDING"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleOpenReview(cert)}
                          className={
                            cert.verificationStatus === "PENDING"
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : ""
                          }
                        >
                          <Eye className="mr-1.5 size-3.5" />
                          {cert.verificationStatus === "PENDING"
                            ? "Xét duyệt"
                            : "Xem chi tiết"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-zinc-800">
              <span className="text-xs text-slate-500">
                Trang {page} / {totalPages} (Tổng {total} chứng chỉ)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="size-5 text-emerald-600" />
              Chi Tiết Xét Duyệt Chứng Chỉ
            </DialogTitle>
            <DialogDescription>
              Xem xét tài liệu chứng nhận HLV và quyết định Phê duyệt hoặc Từ
              chối.
            </DialogDescription>
          </DialogHeader>

          {selectedCert && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-3 dark:bg-zinc-900">
                <div>
                  <span className="text-xs text-slate-500">
                    Huấn luyện viên:
                  </span>
                  <p className="font-semibold">
                    {selectedCert.coachProfile?.displayName ||
                      selectedCert.coachProfileId}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">
                    Trạng thái hiện tại:
                  </span>
                  <div className="mt-0.5">
                    {getStatusBadge(selectedCert.verificationStatus)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Tên chứng chỉ:</span>
                  <p className="font-medium">{selectedCert.name}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Tổ chức cấp:</span>
                  <p className="font-medium">
                    {selectedCert.issuingOrganization}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Ngày cấp:</span>
                  <p>{formatDate(selectedCert.issuedAt)}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Ngày hết hạn:</span>
                  <p>
                    {selectedCert.expiresAt
                      ? formatDate(selectedCert.expiresAt)
                      : "Không hết hạn"}
                  </p>
                </div>
              </div>

              {/* Document Preview Link */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-emerald-600" />
                  <span className="text-xs font-medium">
                    File Bằng Cấp / Tài Liệu Minh Chứng
                  </span>
                </div>
                {selectedCert.documentUrl ? (
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={selectedCert.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Mở File PDF / Ảnh
                      <ExternalLink className="ml-1 size-3" />
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">
                    Không có đính kèm
                  </span>
                )}
              </div>

              {/* Review Note */}
              <div className="space-y-1.5">
                <Label htmlFor="reviewNote" className="text-xs font-semibold">
                  Ghi chú duyệt (Review Note / Lý do từ chối):
                </Label>
                <Textarea
                  id="reviewNote"
                  placeholder={
                    selectedCert.verificationStatus === "PENDING"
                      ? "Nhập ghi chú đánh giá hoặc lý do từ chối (nếu có)..."
                      : "Không có ghi chú"
                  }
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  disabled={selectedCert.verificationStatus !== "PENDING"}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between gap-2 border-t pt-4 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              {selectedCert?.verificationStatus === "PENDING" ? "Hủy" : "Đóng"}
            </Button>

            {selectedCert?.verificationStatus === "PENDING" && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={submitting}
                  onClick={() => handleReviewAction("REJECTED")}
                >
                  <XCircle className="mr-1.5 size-4" />
                  Từ Chối (Reject)
                </Button>
                <Button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleReviewAction("VERIFIED")}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {submitting ? (
                    <Spinner className="mr-1.5 size-4" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 size-4" />
                  )}
                  Phê Duyệt (Approve)
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
