"use client"

import { Clock3, MapPin, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import type { InventoryItem, InventoryKind } from "../types"
import {
  formatCurrencyVnd,
  formatMockDateTime,
  getCourtStatusClass,
  getCourtStatusLabel,
  getInventoryStatusClass,
  getProductStatusLabel,
  getServiceStatusLabel,
} from "../utils"

interface InventoryDetailSheetProps {
  kind: InventoryKind
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InventoryDetailSheet({
  kind,
  item,
  open,
  onOpenChange,
}: InventoryDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        {item ? (
          <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
            <SheetHeader className="px-0">
              <SheetTitle className="text-xl">
                {kind === "product" ? "Chi tiết sản phẩm" : "Chi tiết dịch vụ"}
              </SheetTitle>
              <SheetDescription>
                Thông tin mock theo từng sân pickleball để hỗ trợ vận hành tại
                quầy.
              </SheetDescription>
            </SheetHeader>

            {item.kind === "product" ? (
              <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-48 w-full object-cover"
                />
              </div>
            ) : null}

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Tên</p>
                <p className="text-base font-semibold">{item.name}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Giá</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {formatCurrencyVnd(item.price)}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Sân sở hữu</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {item.courtName}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Trạng thái</p>
                  <Badge
                    className={`mt-2 ${getInventoryStatusClass(kind, item.status)}`}
                  >
                    {kind === "product"
                      ? getProductStatusLabel(
                          item.status as "in_stock" | "out_of_stock"
                        )
                      : getServiceStatusLabel(
                          item.status as "active" | "paused"
                        )}
                  </Badge>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Cập nhật mock</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {formatMockDateTime(item.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="mb-1 text-xs text-muted-foreground">Loại</p>
                <Badge variant="secondary">{item.category}</Badge>
              </div>

              {item.kind === "product" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      Tồn kho mock
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                      {item.stock}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      Hình ảnh mock
                    </p>
                    <p className="mt-1 text-sm break-all text-muted-foreground">
                      Đã gắn vào dữ liệu mock
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="mb-2 text-xs text-muted-foreground">Mô tả</p>
                <p className="text-sm leading-6 text-foreground">
                  {item.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    Sân áp dụng
                  </div>
                  <p className="font-medium">{item.courtName}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    Trạng thái sân
                  </div>
                  <Badge className={getCourtStatusClass("active")}>
                    {getCourtStatusLabel("active")}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/20 p-3 text-sm text-muted-foreground">
                <Sparkles className="size-4" />
                Dữ liệu chỉ phục vụ giao diện mô phỏng, không gọi API thật.
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
