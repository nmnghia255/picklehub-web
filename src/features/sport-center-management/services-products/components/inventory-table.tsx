"use client"

import {
  Eye,
  MoreHorizontal,
  Package,
  PencilLine,
  Power,
  SearchX,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type {
  InventoryItem,
  InventoryKind,
  ProductInventoryItem,
} from "../types"
import {
  formatCurrencyVnd,
  getInventoryKindLabel,
  getInventoryStatusClass,
  getProductStatusLabel,
  getServiceStatusLabel,
} from "../utils"

interface InventoryTableProps {
  kind: InventoryKind
  items: InventoryItem[]
  onView: (item: InventoryItem) => void
  onEdit: (item: InventoryItem) => void
  onToggleStatus: (item: InventoryItem) => void
}

export function InventoryTable({
  kind,
  items,
  onView,
  onEdit,
  onToggleStatus,
}: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="mb-4 size-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">
            Không tìm thấy {getInventoryKindLabel(kind).toLowerCase()} phù hợp
          </h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Thử thay đổi từ khóa, trạng thái hoặc loại để xem dữ liệu mock khác.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[320px]">Thông tin</TableHead>
            <TableHead>Sân</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>{kind === "product" ? "Giá" : "Giá dịch vụ"}</TableHead>
            {kind === "product" ? <TableHead>Tồn kho</TableHead> : null}
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {item.kind === "product" ? (
                    <div className="h-14 w-14 overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                      <Package className="size-6" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="line-clamp-2 max-w-[360px] text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="outline">{item.courtName}</Badge>
              </TableCell>

              <TableCell>
                <Badge variant="secondary">{item.category}</Badge>
              </TableCell>

              <TableCell className="font-medium text-foreground">
                {formatCurrencyVnd(item.price)}
              </TableCell>

              {kind === "product" ? (
                <TableCell>
                  <Badge
                    variant={
                      (item as ProductInventoryItem).stock <= 0
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {(item as ProductInventoryItem).stock} sản phẩm
                  </Badge>
                </TableCell>
              ) : null}

              <TableCell>
                <Badge className={getInventoryStatusClass(kind, item.status)}>
                  {kind === "product"
                    ? getProductStatusLabel(
                        item.status as "in_stock" | "out_of_stock"
                      )
                    : getServiceStatusLabel(item.status as "active" | "paused")}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(item)}>
                      <Eye className="mr-2 size-4" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <PencilLine className="mr-2 size-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus(item)}>
                      <Power className="mr-2 size-4" />
                      {kind === "product"
                        ? "Đánh dấu hết hàng"
                        : item.status === "active"
                          ? "Tạm ngưng"
                          : "Bật dịch vụ"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
