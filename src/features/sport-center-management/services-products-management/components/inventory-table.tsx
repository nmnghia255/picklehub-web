"use client"

import { ImageOff, PackageSearch, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrencyVnd } from "@/features/sport-center-management/revenue-report/utils/format"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { InventoryKind } from "../store/services-products-store"
import type { SportCenterProduct, SportCenterService } from "../types"
import { ActiveBadge, TypeBadge } from "./badges"

type InventoryRow = SportCenterService | SportCenterProduct

export function InventoryTable({
  kind,
  items,
  loading,
  onView,
  onEdit,
  onDelete,
}: {
  kind: InventoryKind
  items: InventoryRow[]
  loading: boolean
  onView: (item: InventoryRow) => void
  onEdit: (item: InventoryRow) => void
  onDelete: (item: InventoryRow) => void
}) {
  const { t } = useSportCenterManagementTranslation()
  const isProduct = kind === "product"

  if (loading) {
    return (
      <div className="space-y-2 rounded-2xl border p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
        <PackageSearch className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">
          {isProduct
            ? t("inventory.table.noProducts")
            : t("inventory.table.noServices")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("inventory.table.emptyDescription")}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            {isProduct ? (
              <TableHead className="w-14">
                {t("inventory.table.image")}
              </TableHead>
            ) : null}
            <TableHead>{t("inventory.table.name")}</TableHead>
            <TableHead>{t("inventory.table.type")}</TableHead>
            <TableHead className="text-right">
              {t("inventory.table.price")}
            </TableHead>
            {isProduct ? (
              <TableHead className="text-right">
                {t("inventory.table.stock")}
              </TableHead>
            ) : null}
            <TableHead>{t("inventory.table.status")}</TableHead>
            <TableHead className="w-[1%] text-right">
              {t("inventory.table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const product = isProduct ? (item as SportCenterProduct) : undefined

            return (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => onView(item)}
              >
                {isProduct ? (
                  <TableCell>
                    {product?.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="size-10 rounded-md border object-cover"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                        <ImageOff className="size-4" />
                      </div>
                    )}
                  </TableCell>
                ) : null}
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-medium">{item.name}</p>
                    {item.unit ? (
                      <p className="text-xs text-muted-foreground">
                        {item.unit}
                      </p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <TypeBadge kind={kind} type={item.type} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrencyVnd(item.price)}
                </TableCell>
                {isProduct ? (
                  <TableCell className="text-right">
                    {product?.stock ?? 0}
                  </TableCell>
                ) : null}
                <TableCell>
                  <ActiveBadge isActive={item.isActive} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation()
                        onEdit(item)
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDelete(item)
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
