"use client"

import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatCurrencyVnd } from "@/features/sport-center-management/revenue-report/utils/format"
import { formatDateTime } from "@/features/sport-center-management/revenue-report/utils/format"

import type { InventoryKind } from "../store/services-products-store"
import type { SportCenterProduct, SportCenterService } from "../types"
import { ActiveBadge, TypeBadge } from "./badges"

type InventoryRow = SportCenterService | SportCenterProduct

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium break-words text-foreground">
        {value}
      </p>
    </div>
  )
}

export function InventoryDetailSheet({
  kind,
  item,
  open,
  onOpenChange,
  onEdit,
}: {
  kind: InventoryKind
  item: InventoryRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (item: InventoryRow) => void
}) {
  const product =
    item && kind === "product" ? (item as SportCenterProduct) : undefined

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        {item ? (
          <div className="flex h-full flex-col overflow-y-auto">
            <SheetHeader className="border-b px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <SheetTitle className="text-xl">{item.name}</SheetTitle>
                  <SheetDescription>
                    {kind === "service"
                      ? "Thông tin chi tiết dịch vụ"
                      : "Thông tin chi tiết sản phẩm"}
                  </SheetDescription>
                </div>
                <ActiveBadge isActive={item.isActive} />
              </div>
            </SheetHeader>

            <div className="space-y-6 px-6 py-5">
              {product?.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-48 w-full rounded-2xl border object-cover"
                />
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Loại</p>
                  <div className="mt-1">
                    <TypeBadge kind={kind} type={item.type} />
                  </div>
                </div>
                <DetailBlock
                  label="Giá"
                  value={formatCurrencyVnd(item.price)}
                />
                {item.unit ? (
                  <DetailBlock label="Đơn vị" value={item.unit} />
                ) : null}
                {product ? (
                  <DetailBlock
                    label="Tồn kho"
                    value={String(product.stock ?? 0)}
                  />
                ) : null}
              </div>

              {item.description ? (
                <div className="rounded-2xl border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Mô tả</p>
                  <p className="mt-1 text-sm leading-6 text-foreground">
                    {item.description}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailBlock
                  label="Ngày tạo"
                  value={formatDateTime(item.createdAt)}
                />
                <DetailBlock
                  label="Cập nhật gần nhất"
                  value={formatDateTime(item.updatedAt)}
                />
              </div>

              <Button className="w-full gap-2" onClick={() => onEdit(item)}>
                <Pencil className="size-4" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-6 py-10 text-sm text-muted-foreground">
            Chưa chọn mục nào.
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
