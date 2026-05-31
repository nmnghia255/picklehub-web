"use client"

import { ImagePlus, Loader2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import { uploadProductImage } from "../api/services-products-service"
import type { InventoryKind } from "../store/services-products-store"
import { useServicesProductsStore } from "../store/services-products-store"
import {
  PRODUCT_TYPE_OPTIONS,
  type ProductType,
  SERVICE_TYPE_OPTIONS,
  type ServiceType,
  type SportCenterProduct,
  type SportCenterService,
} from "../types"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

type InventoryRow = SportCenterService | SportCenterProduct
type DialogMode = "create" | "edit"

type FormState = {
  name: string
  type: string
  price: string
  unit: string
  description: string
  imageUrl: string
  stock: string
  isActive: boolean
}

function buildInitialState(
  kind: InventoryKind,
  item: InventoryRow | null
): FormState {
  const defaultType =
    kind === "service"
      ? SERVICE_TYPE_OPTIONS[0].value
      : PRODUCT_TYPE_OPTIONS[0].value

  const product =
    item && kind === "product" ? (item as SportCenterProduct) : null

  return {
    name: item?.name ?? "",
    type: item?.type ?? defaultType,
    price: item ? String(item.price) : "",
    unit: item?.unit ?? "",
    description: item?.description ?? "",
    imageUrl: product?.imageUrl ?? "",
    stock: product?.stock != null ? String(product.stock) : "",
    isActive: item?.isActive ?? true,
  }
}

export function InventoryFormDialog({
  kind,
  mode,
  item,
  open,
  onOpenChange,
}: {
  kind: InventoryKind
  mode: DialogMode
  item: InventoryRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const saving = useServicesProductsStore((state) => state.saving)
  const createService = useServicesProductsStore((state) => state.createService)
  const updateService = useServicesProductsStore((state) => state.updateService)
  const createProduct = useServicesProductsStore((state) => state.createProduct)
  const updateProduct = useServicesProductsStore((state) => state.updateProduct)

  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(kind, item)
  )
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(buildInitialState(kind, item))
    }
  }, [open, kind, item])

  const isProduct = kind === "product"
  const typeOptions = isProduct ? PRODUCT_TYPE_OPTIONS : SERVICE_TYPE_OPTIONS

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp ảnh (png, jpeg, jpg).")
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Ảnh vượt quá dung lượng tối đa 5MB.")
      return
    }

    setUploading(true)
    try {
      const result = await uploadProductImage(file)
      updateField("imageUrl", result.url)
      toast.success("Đã tải ảnh lên.")
    } catch (error) {
      console.error("[ServicesProducts] uploadProductImage error:", error)
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    const name = form.name.trim()
    if (!name) {
      toast.error("Vui lòng nhập tên.")
      return
    }

    const price = Number(form.price)
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Giá không hợp lệ.")
      return
    }

    const description = form.description.trim()
    const unit = form.unit.trim()

    let success = false

    if (kind === "service") {
      if (mode === "create") {
        success = await createService({
          name,
          type: form.type as ServiceType,
          price,
          description: description || undefined,
          unit: unit || undefined,
        })
      } else if (item) {
        success = await updateService(item.id, {
          name,
          type: form.type as ServiceType,
          price,
          description: description || null,
          unit: unit || null,
          isActive: form.isActive,
        })
      }
    } else {
      const stock = form.stock.trim() === "" ? undefined : Number(form.stock)
      if (stock != null && (!Number.isFinite(stock) || stock < 0)) {
        toast.error("Tồn kho không hợp lệ.")
        return
      }

      if (mode === "create") {
        success = await createProduct({
          name,
          type: form.type as ProductType,
          price,
          description: description || undefined,
          unit: unit || undefined,
          imageUrl: form.imageUrl || undefined,
          stock,
        })
      } else if (item) {
        success = await updateProduct(item.id, {
          name,
          type: form.type as ProductType,
          price,
          description: description || null,
          unit: unit || null,
          imageUrl: form.imageUrl || null,
          stock,
          isActive: form.isActive,
        })
      }
    }

    if (success) {
      toast.success(
        mode === "create"
          ? isProduct
            ? "Đã thêm sản phẩm."
            : "Đã thêm dịch vụ."
          : isProduct
            ? "Đã cập nhật sản phẩm."
            : "Đã cập nhật dịch vụ."
      )
      onOpenChange(false)
    }
  }

  const title =
    mode === "create"
      ? isProduct
        ? "Thêm sản phẩm"
        : "Thêm dịch vụ"
      : isProduct
        ? "Chỉnh sửa sản phẩm"
        : "Chỉnh sửa dịch vụ"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Điền thông tin {isProduct ? "sản phẩm" : "dịch vụ"} bên dưới.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inv-name">
              Tên <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="inv-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder={
                isProduct ? "VD: Pocari Sweat 500ml" : "VD: Thuê vợt"
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Loại <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.type}
                onValueChange={(value) => updateField("type", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inv-price">
                Giá (VND) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="inv-price"
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="25000"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inv-unit">Đơn vị hiển thị</Label>
              <Input
                id="inv-unit"
                value={form.unit}
                onChange={(event) => updateField("unit", event.target.value)}
                placeholder={isProduct ? "VND / chai" : "VND / 3h"}
              />
            </div>

            {isProduct ? (
              <div className="space-y-2">
                <Label htmlFor="inv-stock">Tồn kho</Label>
                <Input
                  id="inv-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(event) => updateField("stock", event.target.value)}
                  placeholder="100"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inv-description">Mô tả</Label>
            <Textarea
              id="inv-description"
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Mô tả ngắn gọn..."
              rows={3}
            />
          </div>

          {isProduct ? (
            <div className="space-y-2">
              <Label>Ảnh sản phẩm</Label>
              {form.imageUrl ? (
                <div className="relative w-fit">
                  {}
                  <img
                    src={form.imageUrl}
                    alt="Ảnh sản phẩm"
                    className="h-32 w-32 rounded-xl border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => updateField("imageUrl", "")}
                    className="absolute -top-2 -right-2 rounded-full bg-background p-1 shadow-sm ring-1 ring-border"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 text-xs text-muted-foreground transition-colors hover:bg-muted/40">
                  {uploading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <ImagePlus className="size-5" />
                  )}
                  <span>{uploading ? "Đang tải..." : "Tải ảnh lên"}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </label>
              )}
              <p className="text-xs text-muted-foreground">
                PNG, JPEG, JPG · tối đa 5MB
              </p>
            </div>
          ) : null}

          {mode === "edit" ? (
            <div className="flex items-center justify-between rounded-2xl border bg-muted/20 p-3">
              <div>
                <p className="text-sm font-medium">Đang hoạt động</p>
                <p className="text-xs text-muted-foreground">
                  Tắt để tạm ngưng hiển thị/đặt mục này.
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => updateField("isActive", checked)}
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={saving || uploading}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : mode === "create" ? (
              "Tạo mới"
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
