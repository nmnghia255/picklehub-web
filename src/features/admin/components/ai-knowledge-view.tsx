"use client"

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Search,
  Trash2,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  deleteKnowledgeDocument,
  getKnowledgeDocument,
  getKnowledgeDocuments,
  ingestKnowledgeDocument,
  testKnowledgeSearch,
} from "../api/admin-service"
import type { KnowledgeDocument, TestSearchResult } from "../types"

export function AiKnowledgeView() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [loading, setLoading] = useState(true)

  // Pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Modal State (Reused for Create and View)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"CREATE" | "VIEW">("CREATE")
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
  })
  const [fetchingDetail, setFetchingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Inline Test Search State
  const [searchQuery, setSearchQuery] = useState("")
  const [topK, setTopK] = useState(3)
  const [searchResults, setSearchResults] = useState<TestSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const fetchDocs = useCallback(async () => {
    try {
      const res = await getKnowledgeDocuments(page, limit)
      setDocuments(res.data || [])
      if (res.meta) {
        setTotal(res.meta.total)
        setTotalPages(
          res.meta.totalPages || Math.ceil(res.meta.total / limit) || 1
        )
      } else {
        setTotal(res.data?.length || 0)
        setTotalPages(1)
      }
    } catch {
      toast.error("Không thể tải danh sách tài liệu tri thức")
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocs()
  }, [fetchDocs])

  const handleOpenCreateModal = () => {
    setModalMode("CREATE")
    setFormData({ title: "", category: "", content: "" })
    setModalOpen(true)
  }

  const handleOpenViewModal = async (doc: KnowledgeDocument) => {
    setModalMode("VIEW")
    setFormData({
      title: doc.title,
      category: doc.category,
      content: doc.content || "Đang tải nội dung...",
    })
    setModalOpen(true)
    setFetchingDetail(true)

    try {
      const fullDoc = await getKnowledgeDocument(doc.id)
      let fullContent = fullDoc.content || ""
      if (!fullContent && fullDoc.chunks && fullDoc.chunks.length > 0) {
        fullContent = fullDoc.chunks
          .map((c) => `[Chunk #${c.chunkIndex + 1}]\n${c.chunkText}`)
          .join("\n\n")
      }
      setFormData({
        title: fullDoc.title,
        category: fullDoc.category,
        content: fullContent || "(Không có nội dung)",
      })
    } catch {
      // Keep initial preview text
    } finally {
      setFetchingDetail(false)
    }
  }

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (modalMode === "VIEW") {
      setModalOpen(false)
      return
    }

    if (
      !formData.title.trim() ||
      !formData.category.trim() ||
      !formData.content.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ các trường thông tin")
      return
    }

    setSubmitting(true)
    try {
      const res = await ingestKnowledgeDocument(formData)
      const msg = res?.chunksCreated
        ? `Đã nạp tài liệu thành công (${res.chunksCreated} trích đoạn chunks)!`
        : res?.message || "Đã nạp tài liệu tri thức thành công!"
      toast.success(msg)
      setModalOpen(false)
      fetchDocs()
    } catch (error) {
      toast.error("Thao tác nạp tài liệu thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return

    try {
      await deleteKnowledgeDocument(id)
      toast.success("Xóa tài liệu thành công")
      fetchDocs()
    } catch (error) {
      toast.error("Xóa tài liệu thất bại")
    }
  }

  const handleTestSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error("Vui lòng nhập từ khóa truy vấn")
      return
    }

    setSearching(true)
    setSearched(true)
    try {
      const results = await testKnowledgeSearch({ query: searchQuery, topK })
      const list = Array.isArray(results) ? results : []
      setSearchResults(list)
      toast.success(`Tìm thấy ${list.length} kết quả phù hợp`)
    } catch (error) {
      toast.error("Không thể thực hiện truy vấn search")
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header & Ingest Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            AI Knowledge Base
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tài liệu RAG & thử nghiệm truy vấn vector search.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <Plus className="mr-2 size-4" />
          Ingest Document
        </Button>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh Sách Tài Liệu Tri Thức</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : documents.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Chưa có tài liệu nào</EmptyTitle>
                <EmptyDescription>
                  Nhấn nút Ingest Document để nạp tài liệu đầu tiên.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-2/5 break-words whitespace-normal">
                        Title
                      </TableHead>
                      <TableHead className="w-1/5 whitespace-nowrap">
                        Category
                      </TableHead>
                      <TableHead className="w-1/5 whitespace-nowrap">
                        Created At
                      </TableHead>
                      <TableHead className="w-1/5 text-right whitespace-nowrap">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="w-2/5 font-medium break-words whitespace-normal">
                          {doc.title}
                        </TableCell>
                        <TableCell className="w-1/5 whitespace-nowrap">
                          <Badge variant="outline">{doc.category}</Badge>
                        </TableCell>
                        <TableCell className="w-1/5 text-xs whitespace-nowrap">
                          {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="w-1/5 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenViewModal(doc)}
                              title="Xem chi tiết"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteDoc(doc.id)}
                              title="Xóa tài liệu"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  Hiển thị{" "}
                  <span className="font-medium">{documents.length}</span> /{" "}
                  <span className="font-medium">{total}</span> tài liệu
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="mr-1 size-4" /> Trước
                  </Button>
                  <span className="px-2 text-xs font-medium">
                    Trang {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Sau <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inline Test Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Test Search (Vector Retrieval)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={handleTestSearch}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="searchQuery">Query Truy Vấn</Label>
              <Input
                id="searchQuery"
                placeholder="Nhập câu hỏi hoặc từ khóa muốn test (e.g. Double bounce rule)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full space-y-1.5 sm:w-32">
              <Label htmlFor="topK">Top K</Label>
              <Input
                id="topK"
                type="number"
                min={1}
                max={10}
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
              />
            </div>
            <Button type="submit" disabled={searching}>
              {searching ? (
                <Spinner className="mr-2 size-4" />
              ) : (
                <Search className="mr-2 size-4" />
              )}
              Search
            </Button>
          </form>

          {/* Test Search Results */}
          {searched &&
            (() => {
              const list = Array.isArray(searchResults) ? searchResults : []
              return (
                <div className="mt-4 space-y-2 border-t pt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Kết Quả Trả Về ({list.length}):
                  </h3>
                  {list.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Không tìm thấy trích đoạn khớp với câu hỏi.
                    </p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-24">Similarity</TableHead>
                            <TableHead className="w-1/3">
                              Document Title
                            </TableHead>
                            <TableHead>Chunk Text</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {list.map((res, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {((res.similarity || 0) * 100).toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-xs font-medium">
                                {res.documentTitle}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {res.chunkText}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )
            })()}
        </CardContent>
      </Card>

      {/* Reused Modal (Ingest / View Document) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "CREATE"
                ? "Nạp Tài Liệu Tri Thức Mới"
                : "Chi Tiết Tài Liệu Tri Thức"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "CREATE"
                ? "Nhập các trường thông tin để nạp vào cơ sở dữ liệu Vector Search."
                : "Xem thông tin chi tiết nội dung tài liệu."}
            </DialogDescription>
          </DialogHeader>

          {fetchingDetail ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : (
            <form onSubmit={handleSubmitModal} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="docTitle">Title</Label>
                <Input
                  id="docTitle"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  readOnly={modalMode === "VIEW"}
                  placeholder="Tiêu đề tài liệu..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="docCategory">Category</Label>
                <Input
                  id="docCategory"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  readOnly={modalMode === "VIEW"}
                  placeholder="Danh mục (e.g. rules, tactics)..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="docContent">Content</Label>
                <Textarea
                  id="docContent"
                  rows={8}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  readOnly={modalMode === "VIEW"}
                  placeholder="Nội dung tri thức chi tiết..."
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  {modalMode === "VIEW" ? "Đóng" : "Hủy"}
                </Button>
                {modalMode === "CREATE" && (
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Spinner className="mr-2 size-4" />}
                    Lưu & Ingest
                  </Button>
                )}
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
