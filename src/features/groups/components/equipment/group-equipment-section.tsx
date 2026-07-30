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
  Star,
  Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import {
  createEquipmentClient,
  deleteEquipmentClient,
  deleteEquipmentFavoriteClient,
  equipmentQueryKeys,
  listEquipmentClient,
  listEquipmentFavoritesClient,
  listEquipmentUsagesClient,
  logEquipmentUsageClient,
  toggleEquipmentFavoriteClient,
  updateEquipmentClient,
  updateEquipmentFavoriteClient,
} from "../../api/equipment-client"
import { useGroupDetail } from "../../api/groups-client"
import { useActionGuard } from "../../hooks/use-action-guard"
import type {
  CreateEquipmentInput,
  Equipment,
  EquipmentFavorite,
  PaginatedResponse,
  UpdateEquipmentFavoriteInput,
  UpdateEquipmentInput,
} from "../../types"
import { FavoriteTemplatesSelector } from "./favorite-templates-selector"

function EquipmentConditionBadge({ condition }: { condition: string }) {
  const { t } = useGroupsTranslation()
  const label = (() => {
    switch (condition) {
      case "NEW":
        return t("equipment.conditionNew", "Mới")
      case "GOOD":
        return t("equipment.conditionGood", "Tốt")
      case "WORN":
        return t("equipment.conditionWorn", "Đã mòn")
      case "RETIRED":
        return t("equipment.conditionRetired", "Đã loại bỏ")
      default:
        return condition
    }
  })()

  const baseStyles =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  switch (condition) {
    case "NEW":
      return (
        <span
          className={`${baseStyles} border-emerald-500/20 bg-emerald-500/10 text-emerald-500`}
        >
          {label}
        </span>
      )
    case "GOOD":
      return (
        <span
          className={`${baseStyles} border-blue-500/20 bg-blue-500/10 text-blue-500`}
        >
          {label}
        </span>
      )
    case "WORN":
      return (
        <span
          className={`${baseStyles} border-amber-500/20 bg-amber-500/10 text-amber-500`}
        >
          {label}
        </span>
      )
    case "RETIRED":
      return (
        <span
          className={`${baseStyles} border-rose-500/20 bg-rose-500/10 text-rose-500`}
        >
          {label}
        </span>
      )
    default:
      return (
        <span
          className={`${baseStyles} border-zinc-500/20 bg-zinc-500/10 text-zinc-400`}
        >
          {label}
        </span>
      )
  }
}

function formatCurrency(value?: number | null) {
  if (value === undefined || value === null) return "-"
  return formatCurrencyVnd(value)
}

function formatVndString(val: string) {
  const digits = val.replace(/\D/g, "")
  if (!digits) return ""
  return new Intl.NumberFormat("vi-VN").format(Number(digits))
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

function getLocalDateString(value?: string | Date | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
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
  const { t } = useGroupsTranslation()
  const queryClient = useQueryClient()
  const isEditing = !!editingItem

  const [name, setName] = useState(editingItem?.name ?? "")
  const [description, setDescription] = useState(editingItem?.description ?? "")
  const [quantity, setQuantity] = useState(String(editingItem?.quantity ?? ""))
  const [purchaseCost, setPurchaseCost] = useState(
    editingItem?.purchaseCost
      ? formatVndString(editingItem.purchaseCost.toString())
      : ""
  )
  const [purchasedAt, setPurchasedAt] = useState(
    getLocalDateString(editingItem?.purchasedAt)
  )
  const [condition, setCondition] = useState<string>(
    editingItem?.condition ?? "NEW"
  )
  const [createExpense, setCreateExpense] = useState(false)
  const [splitAmongAllMembers, setSplitAmongAllMembers] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  function handleClose() {
    resetForm()
    onOpenChange(false)
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateEquipmentInput) =>
      createEquipmentClient(groupId, data),
    onSuccess: () => {
      toast.success(t("equipment.addSuccess", "Thêm vật dụng thành công"))
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.all(groupId),
      })
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("equipment.addError", "Không thể thêm vật dụng")
      )
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEquipmentInput) =>
      updateEquipmentClient(groupId, editingItem!.id, data),
    onSuccess: () => {
      toast.success(
        t("equipment.updateSuccess", "Cập nhật vật dụng thành công")
      )
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.all(groupId),
      })
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          t("equipment.updateError", "Không thể cập nhật vật dụng")
      )
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = t(
        "equipment.errors.nameRequired",
        "Tên vật dụng không được để trống"
      )
    } else if (name.length > 200) {
      newErrors.name = t(
        "equipment.errors.nameMaxLength",
        "Tên vật dụng tối đa 200 ký tự"
      )
    }

    if (!isEditing) {
      const qty = Number(quantity)
      if (!quantity || !Number.isFinite(qty) || qty < 1) {
        newErrors.quantity = t(
          "equipment.errors.quantityMin",
          "Số lượng phải lớn hơn hoặc bằng 1"
        )
      }

      const cost = Number(purchaseCost.replace(/\D/g, ""))
      if (!purchaseCost || !Number.isFinite(cost) || cost < 1000) {
        newErrors.purchaseCost = t(
          "equipment.errors.purchaseCostMin",
          "Chi phí mua phải từ 1.000 VNĐ trở lên"
        )
      }
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
        purchaseCost: Number(purchaseCost.replace(/\D/g, "")),
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
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]"
        showCloseButton={false}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="relative">
            <DialogTitle>
              {isEditing
                ? t("equipment.editTitle", "Cập nhật vật dụng")
                : t("equipment.addTitle", "Thêm vật dụng")}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t(
                    "equipment.editDesc",
                    "Chỉnh sửa thông tin vật dụng của nhóm."
                  )
                : t(
                    "equipment.addDesc",
                    "Nhập thông tin vật dụng mới cho nhóm."
                  )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!isEditing && (
              <FavoriteTemplatesSelector
                groupId={groupId}
                onSelect={(template) => {
                  setName(template.name)
                  if (template.defaultQuantity) {
                    setQuantity(String(template.defaultQuantity))
                  }
                  if (template.defaultCost) {
                    setPurchaseCost(
                      formatVndString(String(template.defaultCost))
                    )
                  }
                  if (template.defaultCondition) {
                    setCondition(template.defaultCondition)
                  }
                  setPurchasedAt(getLocalDateString(new Date()))
                }}
              />
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("equipment.nameLabel", "Tên vật dụng")}{" "}
                <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={200}
                placeholder={t(
                  "equipment.namePlaceholder",
                  "VD: Bóng Dura 40+"
                )}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("equipment.descriptionLabel", "Mô tả")}
              </label>
              <textarea
                className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  "equipment.descriptionPlaceholder",
                  "Mô tả vật dụng (không bắt buộc)"
                )}
              />
            </div>

            {!isEditing && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("equipment.quantityLabel", "Số lượng")}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min={1}
                      placeholder={t("equipment.quantityPlaceholder", "VD: 12")}
                    />
                    {errors.quantity && (
                      <p className="text-xs text-destructive">
                        {errors.quantity}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("equipment.purchaseCostLabel", "Chi phí mua (VNĐ)")}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      value={purchaseCost}
                      onChange={(e) =>
                        setPurchaseCost(formatVndString(e.target.value))
                      }
                      placeholder={t(
                        "equipment.purchaseCostPlaceholder",
                        "VD: 180.000"
                      )}
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
                    <label className="text-sm font-medium">
                      {t("equipment.purchaseDateLabel", "Ngày mua")}
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      value={purchasedAt}
                      onChange={(e) => setPurchasedAt(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("equipment.conditionLabel", "Tình trạng")}
                    </label>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      <option value="NEW">
                        {t("equipment.conditionNew", "Mới")}
                      </option>
                      <option value="GOOD">
                        {t("equipment.conditionGood", "Tốt")}
                      </option>
                      <option value="WORN">
                        {t("equipment.conditionWorn", "Đã mòn")}
                      </option>
                      <option value="RETIRED">
                        {t("equipment.conditionRetired", "Đã loại bỏ")}
                      </option>
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
                    {t("equipment.createExpenseLabel", "Tạo khoản chi nhóm")}
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
                      {t(
                        "equipment.splitAllMembersLabel",
                        "Chia đều cho tất cả thành viên"
                      )}
                    </label>
                  )}
                </div>
              </>
            )}

            {isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("equipment.quantityLabel", "Số lượng")}
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min={0}
                    placeholder={t("equipment.quantityPlaceholder", "VD: 10")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("equipment.conditionLabel", "Tình trạng")}
                  </label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="NEW">
                      {t("equipment.conditionNew", "Mới")}
                    </option>
                    <option value="GOOD">
                      {t("equipment.conditionGood", "Tốt")}
                    </option>
                    <option value="WORN">
                      {t("equipment.conditionWorn", "Đã mòn")}
                    </option>
                    <option value="RETIRED">
                      {t("equipment.conditionRetired", "Đã loại bỏ")}
                    </option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="relative">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              {t("equipment.cancel", "Hủy")}
            </Button>
            <Button type="submit" disabled={isPending} variant="orangeCard">
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing
                ? t("equipment.btnUpdate", "Cập nhật")
                : t("equipment.btnSave", "Lưu")}
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
  const { t } = useGroupsTranslation()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => deleteEquipmentClient(groupId, item!.id),
    onSuccess: () => {
      toast.success(t("equipment.deleteSuccess", "Xóa vật dụng thành công"))
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.all(groupId),
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("equipment.deleteError", "Không thể xóa vật dụng")
      )
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            {t("equipment.confirmDeleteTitle", "Xác nhận xóa")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "equipment.deleteConfirmDesc",
              'Bạn có chắc muốn xóa vật dụng "{{name}}"? Hành động này sẽ ẩn vật dụng khỏi danh sách. Các khoản chi liên quan vẫn được giữ nguyên.',
              { name: item?.name }
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            {t("equipment.cancel", "Hủy")}
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
            {t("equipment.btnDelete", "Xóa")}
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
  const { t } = useGroupsTranslation()
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
      toast.success(
        t("equipment.logUsageSuccess", "Ghi nhận sử dụng thành công")
      )
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.all(groupId),
      })
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.usages(groupId, item!.id),
      })
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          t("equipment.logUsageError", "Không thể ghi nhận sử dụng")
      )
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
      newErrors.quantityUsed = t(
        "equipment.errors.quantityUsedMin",
        "Số lượng sử dụng phải lớn hơn hoặc bằng 1"
      )
    }
    if (item && qty > item.quantity) {
      newErrors.quantityUsed = t(
        "equipment.errors.quantityUsedMax",
        "Số lượng sử dụng không thể lớn hơn số lượng hiện có ({{quantity}})",
        { quantity: item.quantity }
      )
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
      <DialogContent className="sm:max-w-[450px]" showCloseButton={false}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {t("equipment.logUsageTitle", "Ghi nhận sử dụng")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "equipment.logUsageDesc",
                'Ghi nhận số lượng "{{name}}" đã được sử dụng.',
                { name: item?.name }
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {t("equipment.quantityAvailable", "Số lượng hiện có:")}{" "}
              <strong>{item?.quantity}</strong>
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("equipment.quantityUsedLabel", "Số lượng sử dụng")}{" "}
                <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={quantityUsed}
                onChange={(e) => setQuantityUsed(e.target.value)}
                min={1}
                placeholder={t("equipment.quantityUsedPlaceholder", "VD: 3")}
              />
              {errors.quantityUsed && (
                <p className="text-xs text-destructive">
                  {errors.quantityUsed}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("equipment.noteLabel", "Ghi chú")}
              </label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t(
                  "equipment.notePlaceholder",
                  "VD: 1 quả bóng bị nứt"
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("equipment.usedDateLabel", "Ngày sử dụng")}
              </label>
              <input
                type="date"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={usedAt}
                onChange={(e) => setUsedAt(e.target.value)}
                max={(() => {
                  const d = new Date()
                  const year = d.getFullYear()
                  const month = String(d.getMonth() + 1).padStart(2, "0")
                  const day = String(d.getDate()).padStart(2, "0")
                  return `${year}-${month}-${day}`
                })()}
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
              {t("equipment.cancel", "Hủy")}
            </Button>
            <Button
              type="submit"
              disabled={usageMutation.isPending}
              variant="orangeCard"
            >
              {usageMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {t("equipment.btnLogUsage", "Ghi nhận")}
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
  const { t } = useGroupsTranslation()
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
      <DialogContent
        className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>
            {t("equipment.usageHistoryTitle", "Lịch sử sử dụng")}
          </DialogTitle>
          <DialogDescription>
            {t("equipment.usageHistoryDesc", 'Lịch sử sử dụng của "{{name}}"', {
              name: item?.name,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              {t("equipment.loading", "Đang tải...")}
            </div>
          ) : isError ? (
            <div className="py-10 text-center text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : t(
                    "equipment.loadHistoryError",
                    "Không thể tải lịch sử sử dụng"
                  )}
            </div>
          ) : usages.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {t("equipment.noUsageHistory", "Chưa có lịch sử sử dụng.")}
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("equipment.quantityLabel", "Số lượng")}
                    </TableHead>
                    <TableHead>{t("equipment.noteLabel", "Ghi chú")}</TableHead>
                    <TableHead>
                      {t("equipment.usedDateLabel", "Ngày sử dụng")}
                    </TableHead>
                    <TableHead>
                      {t("equipment.loggedAtLabel", "Ghi nhận lúc")}
                    </TableHead>
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
                    {t("pagination.previous", "Trang trước")}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {t(
                      "pagination.pageInfo",
                      "Trang {{currentPage}} / {{totalPages}}",
                      { currentPage: page, totalPages: meta.totalPages }
                    )}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(meta.totalPages, p + 1))
                    }
                    disabled={page === meta.totalPages}
                  >
                    {t("pagination.next", "Trang sau")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleClose}>
            {t("activitySchedule.btnClose", "Đóng")}
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
  const { t } = useGroupsTranslation()
  const queryClient = useQueryClient()

  const { data: group } = useGroupDetail(groupId)

  const { guardWriteAction, PermissionDialog } = useActionGuard(
    group,
    group?.role
  )

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [conditionFilter, setConditionFilter] = useState("")
  const limit = 20

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Equipment | null>(null)
  const [deleteItem, setDeleteItem] = useState<Equipment | null>(null)
  const [logUsageItem, setLogUsageItem] = useState<Equipment | null>(null)
  const [historyItem, setHistoryItem] = useState<Equipment | null>(null)

  const [editingFavorite, setEditingFavorite] =
    useState<EquipmentFavorite | null>(null)
  const [deleteFavorite, setDeleteFavorite] =
    useState<EquipmentFavorite | null>(null)

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

  const favoritesQuery = useQuery({
    queryKey: equipmentQueryKeys.favorites(groupId),
    queryFn: () => listEquipmentFavoritesClient(groupId),
  })

  const equipment = data?.data ?? []
  const meta = data?.meta
  const favorites = favoritesQuery.data?.data ?? []

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      toggleEquipmentFavoriteClient(groupId, id, isFavorite),
    onMutate: async ({ id, isFavorite }) => {
      await queryClient.cancelQueries({
        queryKey: equipmentQueryKeys.list(groupId, queryParams),
      })

      const previousEquipmentData = queryClient.getQueryData<
        PaginatedResponse<Equipment>
      >(equipmentQueryKeys.list(groupId, queryParams))

      if (previousEquipmentData) {
        queryClient.setQueryData<PaginatedResponse<Equipment>>(
          equipmentQueryKeys.list(groupId, queryParams),
          {
            ...previousEquipmentData,
            data: previousEquipmentData.data.map((item) =>
              item.id === id ? { ...item, isFavorite } : item
            ),
          }
        )
      }

      return { previousEquipmentData }
    },
    onError: (err, _variables, context) => {
      if (context?.previousEquipmentData) {
        queryClient.setQueryData(
          equipmentQueryKeys.list(groupId, queryParams),
          context.previousEquipmentData
        )
      }
      toast.error(
        err.message ||
          t(
            "equipment.toggleFavoriteError",
            "Không thể cập nhật trạng thái yêu thích."
          )
      )
    },
    onSuccess: (resData) => {
      toast.success(
        resData.data.isFavorite
          ? t("equipment.addFavoriteSuccess", "Đã lưu vào danh sách yêu thích")
          : t(
              "equipment.removeFavoriteSuccess",
              "Đã xóa khỏi danh sách yêu thích"
            )
      )
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.favorites(groupId),
      })
    },
  })

  function handleAdd() {
    guardWriteAction(
      () => {
        setEditingItem(null)
        setFormOpen(true)
      },
      { featureName: "thêm vật dụng mới" }
    )
  }

  function handleEdit(item: Equipment) {
    guardWriteAction(
      () => {
        setEditingItem(item)
        setFormOpen(true)
      },
      { featureName: "chỉnh sửa vật dụng" }
    )
  }

  function handleDelete(item: Equipment) {
    guardWriteAction(
      () => {
        setDeleteItem(item)
      },
      { featureName: "xóa vật dụng" }
    )
  }

  function handleLogUsage(item: Equipment) {
    guardWriteAction(
      () => {
        setLogUsageItem(item)
      },
      { featureName: "ghi nhận sử dụng vật dụng" }
    )
  }

  function handleViewHistory(item: Equipment) {
    setHistoryItem(item)
  }

  function handleEditFavorite(item: EquipmentFavorite) {
    guardWriteAction(
      () => {
        setEditingFavorite(item)
      },
      { featureName: "chỉnh sửa mẫu yêu thích" }
    )
  }

  function handleDeleteFavorite(item: EquipmentFavorite) {
    guardWriteAction(
      () => {
        setDeleteFavorite(item)
      },
      { featureName: "xóa mẫu yêu thích" }
    )
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : t("equipment.loadError", "Đã xảy ra lỗi khi tải danh sách vật dụng.")

  return (
    <>
      <Card className="mt-6 shadow-sm">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                {t("equipment.manageTitle", "Quản lý vật dụng")}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "equipment.manageDesc",
                  "Theo dõi và quản lý vật dụng sử dụng chung trong nhóm."
                )}
              </p>
            </div>
            {canManage && (
              <Button
                size="sm"
                onClick={handleAdd}
                className="border border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Plus className="mr-2 size-4" />
                {t("equipment.addTitle", "Thêm vật dụng")}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                {t("equipment.allEquipment", "Tất cả vật dụng")}
              </TabsTrigger>
              <TabsTrigger value="favorites">
                {t("equipment.favorite", "Yêu thích")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {/* Search & Filter */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t(
                      "equipment.searchPlaceholder",
                      "Tìm kiếm vật dụng..."
                    )}
                    className="w-full rounded-md border bg-background py-2 pr-4 pl-9 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                  />
                </div>
                <select
                  className="w-full rounded-md bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary sm:w-auto"
                  value={conditionFilter}
                  onChange={(e) => {
                    setConditionFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">
                    {t("equipment.allConditions", "Tất cả tình trạng")}
                  </option>
                  <option value="NEW">
                    {t("equipment.conditionNew", "Mới")}
                  </option>
                  <option value="GOOD">
                    {t("equipment.conditionGood", "Tốt")}
                  </option>
                  <option value="WORN">
                    {t("equipment.conditionWorn", "Đã mòn")}
                  </option>
                  <option value="RETIRED">
                    {t("equipment.conditionRetired", "Đã loại bỏ")}
                  </option>
                </select>
              </div>

              {/* Content */}
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  {t("equipment.loading", "Đang tải...")}
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
                    <EmptyTitle>
                      {t("equipment.emptyTitle", "Chưa có vật dụng nào")}
                    </EmptyTitle>
                    <EmptyDescription>
                      {search || conditionFilter
                        ? t(
                            "equipment.emptyFilterDesc",
                            "Không tìm thấy vật dụng phù hợp."
                          )
                        : t(
                            "equipment.emptyDesc",
                            "Nhóm chưa có vật dụng nào được quản lý."
                          )}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {t("equipment.nameHeader", "Tên vật dụng")}
                          </TableHead>
                          <TableHead>
                            {t("equipment.quantityHeader", "Số lượng")}
                          </TableHead>
                          <TableHead>
                            {t("equipment.conditionHeader", "Tình trạng")}
                          </TableHead>
                          <TableHead>
                            {t("equipment.costHeader", "Chi phí mua")}
                          </TableHead>
                          <TableHead>
                            {t("equipment.purchaseDateHeader", "Ngày mua")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("equipment.actionsHeader", "Thao tác")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {equipment.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell
                              className="max-w-[200px] truncate font-medium"
                              title={item.name}
                            >
                              {item.name}
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              <EquipmentConditionBadge
                                condition={item.condition}
                              />
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.purchaseCost)}
                            </TableCell>
                            <TableCell>
                              {formatDate(item.purchasedAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {canManage && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    title={
                                      item.isFavorite
                                        ? t(
                                            "equipment.unfavoriteTooltip",
                                            "Bỏ yêu thích"
                                          )
                                        : t(
                                            "equipment.favoriteTooltip",
                                            "Yêu thích"
                                          )
                                    }
                                    disabled={toggleFavoriteMutation.isPending}
                                    onClick={() =>
                                      guardWriteAction(
                                        () =>
                                          toggleFavoriteMutation.mutate({
                                            id: item.id,
                                            isFavorite: !item.isFavorite,
                                          }),
                                        {
                                          featureName:
                                            "thay đổi trạng thái yêu thích",
                                        }
                                      )
                                    }
                                  >
                                    <Star
                                      className={`size-4 transition-colors ${
                                        item.isFavorite
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-muted-foreground hover:text-amber-400"
                                      }`}
                                    />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title={t(
                                    "equipment.historyTooltip",
                                    "Lịch sử sử dụng"
                                  )}
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
                                      title={t(
                                        "equipment.logUsageTooltip",
                                        "Ghi nhận sử dụng"
                                      )}
                                      onClick={() => handleLogUsage(item)}
                                    >
                                      <Eye className="size-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      title={t(
                                        "equipment.editTooltip",
                                        "Chỉnh sửa"
                                      )}
                                      onClick={() => handleEdit(item)}
                                    >
                                      <Edit className="size-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                      title={t(
                                        "equipment.deleteTooltip",
                                        "Xóa"
                                      )}
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
                        {t("pagination.previous", "Trang trước")}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {t(
                          "pagination.pageInfo",
                          "Trang {{currentPage}} / {{totalPages}}",
                          { currentPage: page, totalPages: meta.totalPages }
                        )}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(meta.totalPages, p + 1))
                        }
                        disabled={page === meta.totalPages}
                      >
                        {t("pagination.next", "Trang sau")}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {favoritesQuery.isLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  {t("equipment.loading", "Đang tải...")}
                </div>
              ) : favoritesQuery.isError ? (
                <div className="rounded-md border bg-destructive/5 py-10 text-center text-sm text-destructive">
                  {favoritesQuery.error instanceof Error
                    ? favoritesQuery.error.message
                    : t(
                        "equipment.loadFavoritesError",
                        "Đã xảy ra lỗi khi tải danh sách mẫu yêu thích."
                      )}
                </div>
              ) : favorites.length === 0 ? (
                <Empty className="py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Package className="size-6 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>
                      {t("equipment.noFavorites", "Chưa có mẫu yêu thích nào")}
                    </EmptyTitle>
                    <EmptyDescription>
                      {t(
                        "equipment.noFavoritesDesc",
                        "Lưu mẫu vật dụng thường dùng để tạo nhanh hơn."
                      )}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t(
                            "equipment.templateNameHeader",
                            "Tên mẫu vật dụng"
                          )}
                        </TableHead>
                        <TableHead>
                          {t(
                            "equipment.defaultQuantityHeader",
                            "Số lượng mặc định"
                          )}
                        </TableHead>
                        <TableHead>
                          {t(
                            "equipment.defaultConditionHeader",
                            "Tình trạng mặc định"
                          )}
                        </TableHead>
                        <TableHead>
                          {t("equipment.defaultCostHeader", "Chi phí mặc định")}
                        </TableHead>
                        {canManage && (
                          <TableHead className="text-right">
                            {t("equipment.actionsHeader", "Thao tác")}
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {favorites.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>{item.defaultQuantity ?? "-"}</TableCell>
                          <TableCell>
                            {item.defaultCondition ? (
                              <EquipmentConditionBadge
                                condition={item.defaultCondition}
                              />
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.defaultCost)}
                          </TableCell>
                          {canManage && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title={t(
                                    "equipment.editTooltip",
                                    "Chỉnh sửa"
                                  )}
                                  onClick={() => handleEditFavorite(item)}
                                >
                                  <Edit className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-yellow-500 hover:bg-yellow-500/10"
                                  title={t(
                                    "equipment.unfavoriteTooltip",
                                    "Bỏ yêu thích"
                                  )}
                                  onClick={() => handleDeleteFavorite(item)}
                                >
                                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EquipmentFormDialog
        key={
          formOpen ? (editingItem ? `edit-${editingItem.id}` : "new") : "closed"
        }
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

      <FavoriteFormDialog
        key={
          editingFavorite ? `edit-${editingFavorite.id}` : "new-favorite-form"
        }
        open={!!editingFavorite}
        onOpenChange={(open) => {
          if (!open) setEditingFavorite(null)
        }}
        groupId={groupId}
        editingItem={editingFavorite}
      />

      <DeleteFavoriteConfirm
        open={!!deleteFavorite}
        onOpenChange={(open) => {
          if (!open) setDeleteFavorite(null)
        }}
        groupId={groupId}
        item={deleteFavorite}
      />
      <PermissionDialog />
    </>
  )
}

// ─── Edit Favorite Template Dialog ──────────────────────────────────────────

interface FavoriteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  editingItem?: EquipmentFavorite | null
}

function FavoriteFormDialog({
  open,
  onOpenChange,
  groupId,
  editingItem,
}: FavoriteFormDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useGroupsTranslation()

  const [name, setName] = useState(editingItem?.name || "")
  const [quantity, setQuantity] = useState(
    editingItem?.defaultQuantity !== undefined &&
      editingItem?.defaultQuantity !== null
      ? String(editingItem.defaultQuantity)
      : ""
  )
  const [purchaseCost, setPurchaseCost] = useState(
    editingItem?.defaultCost !== undefined && editingItem?.defaultCost !== null
      ? String(editingItem.defaultCost)
      : ""
  )
  const [condition, setCondition] = useState<
    "NEW" | "GOOD" | "WORN" | "RETIRED"
  >(
    (editingItem?.defaultCondition as "NEW" | "GOOD" | "WORN" | "RETIRED") ||
      "NEW"
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEquipmentFavoriteInput) =>
      updateEquipmentFavoriteClient(groupId, editingItem!.id, data),
    onSuccess: () => {
      toast.success(
        t("equipment.updateFavoriteSuccess", "Cập nhật mẫu thành công")
      )
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.favorites(groupId),
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      if (
        error.message.includes("409") ||
        error.message.toLowerCase().includes("trùng") ||
        error.message.toLowerCase().includes("already exists")
      ) {
        setErrors({
          name: t(
            "equipment.duplicateNameError",
            "Tên vật dụng yêu thích này đã tồn tại trong nhóm. Vui lòng chọn tên khác."
          ),
        })
      } else {
        toast.error(
          error.message ||
            t(
              "equipment.updateFavoriteError",
              "Không thể cập nhật mẫu yêu thích."
            )
        )
      }
    },
  })

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = t(
        "equipment.errors.nameRequired",
        "Tên vật dụng không được để trống"
      )
    } else if (name.length > 200) {
      newErrors.name = t(
        "equipment.errors.nameMaxLength",
        "Tên vật dụng tối đa 200 ký tự"
      )
    }

    if (quantity) {
      const qty = Number(quantity)
      if (Number.isNaN(qty) || qty < 1) {
        newErrors.quantity = t(
          "equipment.errors.quantityMin",
          "Số lượng phải lớn hơn hoặc bằng 1"
        )
      }
    }

    if (purchaseCost) {
      const cost = Number(purchaseCost.replace(/\D/g, ""))
      if (Number.isNaN(cost) || cost < 1000) {
        newErrors.purchaseCost = t(
          "equipment.errors.purchaseCostMin",
          "Chi phí mua phải từ 1.000 VNĐ trở lên"
        )
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    updateMutation.mutate({
      name: name.trim(),
      defaultQuantity: quantity ? Number(quantity) : undefined,
      defaultCost: purchaseCost
        ? Number(purchaseCost.replace(/\D/g, ""))
        : undefined,
      defaultCondition:
        condition as UpdateEquipmentFavoriteInput["defaultCondition"],
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]" showCloseButton={false}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {t("equipment.editTemplateTitle", "Sửa mẫu yêu thích")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "equipment.editTemplateDesc",
                "Chỉnh sửa thông tin mặc định của mẫu yêu thích."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("equipment.templateName", "Tên mẫu vật dụng")}{" "}
                <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                className={`w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary ${
                  errors.name
                    ? "border-destructive ring-destructive/20 focus:ring-destructive"
                    : ""
                }`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={200}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("equipment.defaultQuantity", "Số lượng mặc định")}
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min={1}
                />
                {errors.quantity && (
                  <p className="text-xs text-destructive">{errors.quantity}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("equipment.defaultCost", "Chi phí mặc định")}
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={purchaseCost}
                  onChange={(e) =>
                    setPurchaseCost(formatVndString(e.target.value))
                  }
                />
                {errors.purchaseCost && (
                  <p className="text-xs text-destructive">
                    {errors.purchaseCost}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("equipment.defaultCondition", "Tình trạng mặc định")}
              </label>
              <select
                className="w-full rounded-md border bg-background py-2 pl-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={condition}
                onChange={(e) =>
                  setCondition(
                    e.target.value as "NEW" | "GOOD" | "WORN" | "RETIRED"
                  )
                }
              >
                <option value="NEW">
                  {t("equipment.conditionNew", "Mới")}
                </option>
                <option value="GOOD">
                  {t("equipment.conditionGood", "Tốt")}
                </option>
                <option value="WORN">
                  {t("equipment.conditionWorn", "Đã mòn")}
                </option>
                <option value="RETIRED">
                  {t("equipment.conditionRetired", "Đã loại bỏ")}
                </option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              {t("equipment.cancel", "Hủy")}
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              variant="orangeCard"
            >
              {updateMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {t("equipment.save", "Lưu")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Favorite Template Confirm Dialog ──────────────────────────────────

interface DeleteFavoriteConfirmProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  item: EquipmentFavorite | null
}

function DeleteFavoriteConfirm({
  open,
  onOpenChange,
  groupId,
  item,
}: DeleteFavoriteConfirmProps) {
  const queryClient = useQueryClient()
  const { t } = useGroupsTranslation()

  const deleteMutation = useMutation({
    mutationFn: () => deleteEquipmentFavoriteClient(groupId, item!.id),
    onSuccess: () => {
      toast.success(t("equipment.deleteFavoriteSuccess", "Xóa mẫu thành công"))
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.favorites(groupId),
      })
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.all(groupId),
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          t("equipment.deleteFavoriteError", "Không thể xóa mẫu yêu thích.")
      )
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            {t("equipment.confirmDeleteTitle", "Bỏ yêu thích mẫu này?")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "equipment.confirmDeleteDesc",
              "Thao tác này sẽ loại bỏ mẫu vật dụng khỏi danh sách gợi ý. Các vật dụng đã mua trước đây sẽ không bị ảnh hưởng."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            {t("equipment.cancel", "Hủy")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              e.preventDefault()
              deleteMutation.mutate()
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            {t("equipment.agree", "Đồng ý")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
