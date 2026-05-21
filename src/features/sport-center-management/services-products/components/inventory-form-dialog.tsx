"use client"

import { type FormEvent, useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"

import type {
  CourtInventoryRecord,
  InventoryKind,
  ProductInventoryItem,
  ProductStatus,
  ServiceInventoryItem,
  ServiceStatus,
} from "../types"
import { formatCurrencyVnd, getInventoryKindLabel } from "../utils"

const productCategories = [
  "Bóng",
  "Thiết bị",
  "Đồ uống",
  "Thời trang",
  "Phụ kiện",
]
const serviceCategories = [
  "Cho thuê",
  "Huấn luyện",
  "Bảo trì",
  "Tiện ích",
  "Media",
]

type InventoryDialogItem = ProductInventoryItem | ServiceInventoryItem | null

interface InventoryFormDialogProps {
  kind: InventoryKind
  open: boolean
  mode: "create" | "edit"
  selectedCourt: CourtInventoryRecord | null
  item: InventoryDialogItem
  onOpenChange: (open: boolean) => void
  onSave: (
    payload:
      | Omit<
          ProductInventoryItem,
          "id" | "kind" | "courtId" | "courtName" | "updatedAt"
        >
      | Omit<
          ServiceInventoryItem,
          "id" | "kind" | "courtId" | "courtName" | "updatedAt"
        >
  ) => void
}

interface FormState {
  name: string
  category: string
  price: string
  description: string
  stock: string
  status: string
  imageUrl: string
}

const defaultFormState: FormState = {
  name: "",
  category: "",
  price: "",
  description: "",
  stock: "",
  status: "",
  imageUrl: "",
}

function getInitialFormState(
  kind: InventoryKind,
  item: InventoryDialogItem
): FormState {
  if (!item) {
    return kind === "product"
      ? {
          ...defaultFormState,
          category: productCategories[0],
          price: "120000",
          stock: "20",
          status: "in_stock",
        }
      : {
          ...defaultFormState,
          category: serviceCategories[0],
          price: "50000",
          status: "active",
        }
  }

  if (item.kind === "product") {
    return {
      name: item.name,
      category: item.category,
      price: String(item.price),
      description: item.description,
      stock: String(item.stock),
      status: item.status,
      imageUrl: item.imageUrl,
    }
  }

  return {
    name: item.name,
    category: item.category,
    price: String(item.price),
    description: item.description,
    stock: "",
    status: item.status,
    imageUrl: "",
  }
}

export function InventoryFormDialog({
  kind,
  open,
  mode,
  selectedCourt,
  item,
  onOpenChange,
  onSave,
}: InventoryFormDialogProps) {
  const [formState, setFormState] = useState<FormState>(() =>
    getInitialFormState(kind, item)
  )

  const updateField = (field: keyof FormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (kind === "product") {
      const productStatus =
        formState.status === "out_of_stock" ? "out_of_stock" : "in_stock"

      onSave({
        name: formState.name.trim(),
        category: formState.category as ProductInventoryItem["category"],
        price: Number(formState.price || 0),
        stock: Number(formState.stock || 0),
        status: productStatus as ProductStatus,
        description: formState.description.trim(),
        imageUrl: formState.imageUrl.trim(),
      })

      return
    }

    onSave({
      name: formState.name.trim(),
      category: formState.category as ServiceInventoryItem["category"],
      price: Number(formState.price || 0),
      status: (formState.status || "active") as ServiceStatus,
      description: formState.description.trim(),
    })
  }

  const categoryOptions =
    kind === "product" ? productCategories : serviceCategories
  const statusOptions =
    kind === "product"
      ? [
          { value: "in_stock", label: "Còn hàng" },
          { value: "out_of_stock", label: "Hết hàng" },
        ]
      : [
          { value: "active", label: "Đang hoạt động" },
          { value: "paused", label: "Tạm ngưng" },
        ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tạo mới" : "Chỉnh sửa"}{" "}
            {getInventoryKindLabel(kind).toLowerCase()}
          </DialogTitle>
          <DialogDescription>
            Giao diện mock nội bộ cho{" "}
            {selectedCourt?.courtName ?? "sân đang chọn"}.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">
                Tên {kind === "product" ? "sản phẩm" : "dịch vụ"}
              </Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder={
                  kind === "product"
                    ? "Ví dụ: Paddle pickleball"
                    : "Ví dụ: Thuê paddle"
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Loại</Label>
              <Select
                value={formState.category}
                onValueChange={(value) => updateField("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Giá</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formState.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="0"
                required
              />
              <p className="text-xs text-muted-foreground">
                Hiển thị:{" "}
                {formState.price
                  ? formatCurrencyVnd(Number(formState.price))
                  : "0 ₫"}
              </p>
            </div>

            {kind === "product" ? (
              <div className="space-y-2">
                <Label htmlFor="stock">Tồn kho mock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formState.stock}
                  onChange={(event) => updateField("stock", event.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formState.status}
                onValueChange={(value) => updateField("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {kind === "product" ? (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="imageUrl">Hình ảnh mock</Label>
                <Input
                  id="imageUrl"
                  value={formState.imageUrl}
                  onChange={(event) =>
                    updateField("imageUrl", event.target.value)
                  }
                  placeholder="Dán URL hoặc giữ mock image mặc định"
                />
              </div>
            ) : null}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formState.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder={
                  kind === "product"
                    ? "Mô tả ngắn cho sản phẩm..."
                    : "Mô tả ngắn cho dịch vụ..."
                }
                rows={4}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            Dữ liệu sẽ được lưu vào mock state của sân hiện tại:{" "}
            {selectedCourt?.courtName ?? "—"}.
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit">
              {mode === "create" ? "Tạo mới" : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
