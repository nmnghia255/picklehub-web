"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle,
  Edit,
  Eye,
  ListIcon,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import {
  createEquipmentClient,
  deleteEquipmentClient,
  equipmentQueryKeys,
  listEquipmentClient,
  listEquipmentUsagesClient,
  logEquipmentUsageClient,
  updateEquipmentClient,
} from "../api/equipment-client"
import type {
  CreateEquipmentInput,
  Equipment,
  UpdateEquipmentInput,
} from "../types"

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Mới",
  GOOD: "Tốt",
  WORN: "Đã mòn",
  RETIRED: "Đã loại bỏ",
}

const CONDITION_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  NEW: "default",
  GOOD: "secondary",
  WORN: "outline",
  RETIRED: "destructive",
}

function formatCurrency(value?: number | null) {
  if (value === undefined || value === null) return "-"
  return formatCurrencyVnd(value)
}

function formatDate(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatDateTime(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Add/Edit Equipment Dialog ───────────────────────────────────────────────

interface EquipmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  editingItem?: Equipment | null
}

function EquipmentFormDialog({
  open,
  onOpenChange,
  groupId,
  editingItem,
}: EquipmentFormDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = !!editingItem

  const [name, setName] = useState(editingItem?.name ?? "")
  const [description, setDescription] = useState(editingItem?.description ?? "")
  const [quantity, setQuantity] = useState(String(editingItem?.quantity ?? ""))
  const [purchaseCost, setPurchaseCost] = useState(
    String(editingItem?.purchaseCost ?? "")
  )
  const [purchasedAt, setPurchasedAt] = useState(
    editingItem?.purchasedAt
      ? new Date(editingItem.purchasedAt).toISOString().split("T")[0]
      : ""
  )
  const [condition, setCondition] = useState<string>(
    editingItem?.condition ?? "NEW"
  )
  const [createExpense, setCreateExpense] = useState(false)
  const [splitAmongAllMembers, setSplitAmongAllMembers] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useMutation({
    mutationFn: (data: CreateEquipmentInput) =>
      createEquipmentClient(groupId, data),
    onSuccess: () => {
      toast.success("Thêm vật dụng thành công")
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.all(groupId),
      })
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể thêm vật dụng")
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEquipmentInput) =>
      updateEquipmentClient(groupId, editingItem!.id, data),
    onSuccess: () => {
      toast.success("Cập nhật vật dụng thành công")
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.all(groupId),
      })
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể cập nhật vật dụng")
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function handleClose() {
    resetForm()
    onOpenChange(false)
  }

  function resetForm() {
    setName("")
    setDescription("")
    setQuantity("")
    setPurchaseCost("")
    setPurchasedAt("")
    setCondition("NEW")
    setCreateExpense(false)
    setSplitAmongAllMembers(true)
    setErrors({})
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Tên vật dụng không được để trống"
    } else if (name.length > 200) {
      newErrors.name = "Tên vật dụng tối đa 200 ký tự"
    }

    if (!isEditing) {
      const qty = Number(quantity)
      if (!quantity || !Number.isFinite(qty) || qty < 1) {
        newErrors.quantity = "Số lượng phải lớn hơn hoặc bằng 1"
      }

      const cost = Number(purchaseCost)
      if (!purchaseCost || !Number.isFinite(cost) || cost < 0) {
        newErrors.purchaseCost = "Chi phí mua không hợp lệ"
      }
    }

    if (!isEditing && createExpense && !splitAmongAllMembers) {
      // memberIds validation would go here if we had a member selector
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    if (isEditing) {
      const payload: UpdateEquipmentInput = {}
      if (name.trim() !== editingItem!.name) payload.name = name.trim()
      if (description !== (editingItem!.description ?? ""))
        payload.description = description
      const qty = Number(quantity)
      if (Number.isFinite(qty) && qty !== editingItem!.quantity)
        payload.quantity = qty
      if (condition !== editingItem!.condition)
        payload.condition = condition as UpdateEquipmentInput["condition"]
      updateMutation.mutate(payload)
    } else {
      const payload: CreateEquipmentInput = {
        name: name.trim(),
        quantity: Number(quantity),
        purchaseCost: Number(purchaseCost),
      }
      if (description) payload.description = description
      if (purchasedAt) payload.purchasedAt = purchasedAt
      if (condition !== "NEW")
        payload.condition = condition as CreateEquipmentInput["condition"]
      if (createExpense) {
        payload.createExpense = true
        payload.splitAmongAllMembers = splitAmongAllMembers
      }
      createMutation.mutate(payload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Cập nhật vật dụng" : "Thêm vật dụng"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Chỉnh sửa thông tin vật dụng của nhóm."
                : "Nhập thông tin vật dụng mới cho nhóm."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tên vật dụng <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={200}
                placeholder="VD: Bóng Dura 40+"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả vật dụng (không bắt buộc)"
              />
            </div>

            {!isEditing && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Số lượng <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min={1}
                      placeholder="VD: 12"
                    />
                    {errors.quantity && (
                      <p className="text-xs text-destructive">
                        {errors.quantity}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Chi phí mua (VNĐ){" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      value={purchaseCost}
                      onChange={(e) => setPurchaseCost(e.target.value)}
                      min={0}
                      placeholder="VD: 180000"
                    />
                    {errors.purchaseCost && (
                      <p className="text-xs text-destructive">
                        {errors.purchaseCost}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày mua</label>
                    <input
                      type="date"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      value={purchasedAt}
                      onChange={(e) => setPurchasedAt(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tình trạng</label>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      <option value="NEW">Mới</option>
                      <option value="GOOD">Tốt</option>
                      <option value="WORN">Đã mòn</option>
                      <option value="RETIRED">Đã loại bỏ</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 rounded-md border p-4">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={createExpense}
                      onChange={(e) => setCreateExpense(e.target.checked)}
                    />
                    Tạo khoản chi nhóm
                  </label>

                  {createExpense && (
                    <label className="flex items-center gap-2 pl-6 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={splitAmongAllMembers}
                        onChange={(e) =>
                          setSplitAmongAllMembers(e.target.checked)
                        }
                      />
                      Chia đều cho tất cả thành viên
                    </label>
                  )}
                </div>
              </>
            )}

            {isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số lượng</label>
                  <input
                    type="number"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min={0}
                    placeholder="VD: 10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tình trạng</label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="NEW">Mới</option>
                    <option value="GOOD">Tốt</option>
                    <option value="WORN">Đã mòn</option>
                    <option value="RETIRED">Đã loại bỏ</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? "Cập nhật" : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Confirm Dialog ──────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  item: Equipment | null
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  groupId,
  item,
}: DeleteConfirmDialogProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => deleteEquipmentClient(groupId, item!.id),
    onSuccess: () => {
      toast.success("Xóa vật dụng thành công")
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.all(groupId),
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể xóa vật dụng")
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Xác nhận xóa
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa vật dụng &ldquo;{item?.name}&rdquo;? Hành động
            này sẽ ẩn vật dụng khỏi danh sách. Các khoản chi liên quan vẫn được
            giữ nguyên.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Log Usage Dialog ────────────────────────────────────────────────────────

interface LogUsageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  item: Equipment | null
}

function LogUsageDialog({
  open,
  onOpenChange,
  groupId,
  item,
}: LogUsageDialogProps) {
  const queryClient = useQueryClient()

  const [quantityUsed, setQuantityUsed] = useState("")
  const [note, setNote] = useState("")
  const [usedAt, setUsedAt] = useState(new Date().toISOString().split("T")[0])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const usageMutation = useMutation({
    mutationFn: () =>
      logEquipmentUsageClient(groupId, item!.id, {
        quantityUsed: Number(quantityUsed),
        note: note || undefined,
        usedAt: usedAt ? new Date(usedAt).toISOString() : undefined,
      }),
    onSuccess: () => {
      toast.success("Ghi nhận sử dụng thành công")
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.all(groupId),
      })
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.usages(groupId, item!.id),
      })
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể ghi nhận sử dụng")
    },
  })

  function handleClose() {
    setQuantityUsed("")
    setNote("")
    setUsedAt(new Date().toISOString().split("T")[0])
    setErrors({})
    onOpenChange(false)
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    const qty = Number(quantityUsed)
    if (!quantityUsed || !Number.isFinite(qty) || qty < 1) {
      newErrors.quantityUsed = "Số lượng sử dụng phải lớn hơn hoặc bằng 1"
    }
    if (item && qty > item.quantity) {
      newErrors.quantityUsed = `Số lượng sử dụng không thể lớn hơn số lượng hiện có (${item.quantity})`
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    usageMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ghi nhận sử dụng</DialogTitle>
            <DialogDescription>
              Ghi nhận số lượng &ldquo;{item?.name}&rdquo; đã được sử dụng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Số lượng hiện có: <strong>{item?.quantity}</strong>
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Số lượng sử dụng <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={quantityUsed}
                onChange={(e) => setQuantityUsed(e.target.value)}
                min={1}
                placeholder="VD: 3"
              />
              {errors.quantityUsed && (
                <p className="text-xs text-destructive">
                  {errors.quantityUsed}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú</label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: 1 quả bóng bị nứt"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày sử dụng</label>
              <input
                type="date"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={usedAt}
                onChange={(e) => setUsedAt(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={usageMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={usageMutation.isPending}>
              {usageMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Ghi nhận
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Usage History Dialog ────────────────────────────────────────────────────

interface UsageHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  item: Equipment | null
}

function UsageHistoryDialog({
  open,
  onOpenChange,
  groupId,
  item,
}: UsageHistoryDialogProps) {
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, isError, error } = useQuery({
    queryKey: equipmentQueryKeys.usages(groupId, item?.id ?? "", {
      page,
      limit,
    }),
    queryFn: () =>
      listEquipmentUsagesClient(groupId, item!.id, { page, limit }),
    enabled: !!item && open,
  })

  const usages = data?.data ?? []
  const meta = data?.meta

  function handleClose() {
    setPage(1)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Lịch sử sử dụng</DialogTitle>
          <DialogDescription>
            Lịch sử sử dụng của &ldquo;{item?.name}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Đang tải...
            </div>
          ) : isError ? (
            <div className="py-10 text-center text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Không thể tải lịch sử sử dụng"}
            </div>
          ) : usages.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Chưa có lịch sử sử dụng.
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Ngày sử dụng</TableHead>
                    <TableHead>Ghi nhận lúc</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usages.map((usage) => (
                    <TableRow key={usage.id}>
                      <TableCell className="font-medium">
                        {usage.quantityUsed}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {usage.note || "-"}
                      </TableCell>
                      <TableCell>{formatDate(usage.usedAt)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(usage.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Trang trước
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Trang {page} / {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(meta.totalPages, p + 1))
                    }
                    disabled={page === meta.totalPages}
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Equipment Section ────────────────────────────────────────────────

export function GroupEquipmentSection({
  groupId,
  canManage,
}: {
  groupId: string
  canManage: boolean
}) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [conditionFilter, setConditionFilter] = useState("")
  const limit = 20

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Equipment | null>(null)
  const [deleteItem, setDeleteItem] = useState<Equipment | null>(null)
  const [logUsageItem, setLogUsageItem] = useState<Equipment | null>(null)
  const [historyItem, setHistoryItem] = useState<Equipment | null>(null)

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      ...(search ? { search } : {}),
      ...(conditionFilter ? { condition: conditionFilter } : {}),
    }),
    [page, limit, search, conditionFilter]
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: equipmentQueryKeys.list(groupId, queryParams),
    queryFn: () => listEquipmentClient(groupId, queryParams),
  })

  const equipment = data?.data ?? []
  const meta = data?.meta

  function handleAdd() {
    setEditingItem(null)
    setFormOpen(true)
  }

  function handleEdit(item: Equipment) {
    setEditingItem(item)
    setFormOpen(true)
  }

  function handleDelete(item: Equipment) {
    setDeleteItem(item)
  }

  function handleLogUsage(item: Equipment) {
    setLogUsageItem(item)
  }

  function handleViewHistory(item: Equipment) {
    setHistoryItem(item)
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Đã xảy ra lỗi khi tải danh sách vật dụng."

  return (
    <>
      <Card className="mt-6 shadow-sm">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                Quản lý vật dụng
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Theo dõi và quản lý vật dụng sử dụng chung trong nhóm.
              </p>
            </div>
            {canManage && (
              <Button size="sm" onClick={handleAdd}>
                <Plus className="mr-2 size-4" />
                Thêm vật dụng
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Search & Filter */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm vật dụng..."
                className="w-full rounded-md border bg-background py-2 pr-4 pl-9 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary sm:w-auto"
              value={conditionFilter}
              onChange={(e) => {
                setConditionFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Tất cả tình trạng</option>
              <option value="NEW">Mới</option>
              <option value="GOOD">Tốt</option>
              <option value="WORN">Đã mòn</option>
              <option value="RETIRED">Đã loại bỏ</option>
            </select>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Đang tải...
            </div>
          ) : isError ? (
            <div className="rounded-md border bg-destructive/5 py-10 text-center text-sm text-destructive">
              {errorMessage}
            </div>
          ) : equipment.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Package className="size-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>Chưa có vật dụng nào</EmptyTitle>
                <EmptyDescription>
                  {search || conditionFilter
                    ? "Không tìm thấy vật dụng phù hợp."
                    : "Nhóm chưa có vật dụng nào được quản lý."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên vật dụng</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Tình trạng</TableHead>
                      <TableHead>Chi phí mua</TableHead>
                      <TableHead>Ngày mua</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipment.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              CONDITION_VARIANTS[item.condition] ?? "outline"
                            }
                          >
                            {CONDITION_LABELS[item.condition] ?? item.condition}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(item.purchaseCost)}
                        </TableCell>
                        <TableCell>{formatDate(item.purchasedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Lịch sử sử dụng"
                              onClick={() => handleViewHistory(item)}
                            >
                              <ListIcon className="size-4" />
                            </Button>
                            {canManage && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-primary"
                                  title="Ghi nhận sử dụng"
                                  onClick={() => handleLogUsage(item)}
                                >
                                  <Eye className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Chỉnh sửa"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  title="Xóa"
                                  onClick={() => handleDelete(item)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Trang trước
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Trang {page} / {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(meta.totalPages, p + 1))
                    }
                    disabled={page === meta.totalPages}
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EquipmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        groupId={groupId}
        editingItem={editingItem}
      />

      <DeleteConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => {
          if (!open) setDeleteItem(null)
        }}
        groupId={groupId}
        item={deleteItem}
      />

      <LogUsageDialog
        open={!!logUsageItem}
        onOpenChange={(open) => {
          if (!open) setLogUsageItem(null)
        }}
        groupId={groupId}
        item={logUsageItem}
      />

      <UsageHistoryDialog
        open={!!historyItem}
        onOpenChange={(open) => {
          if (!open) setHistoryItem(null)
        }}
        groupId={groupId}
        item={historyItem}
      />
    </>
  )
}
