"use client"

import { Edit, Package, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { mockEquipment } from "../mock-data/equipment"
import type { Equipment } from "../types"

export function GroupEquipmentSection({
  groupId,
  canManage,
}: {
  groupId: string
  canManage: boolean
}) {
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment)

  const handleAdd = () => {
    toast.info("Tính năng Thêm vật dụng sẽ được cập nhật khi có API.")
  }

  const handleEdit = (item: Equipment) => {
    toast.info(
      `Tính năng Chỉnh sửa "${item.name}" sẽ được cập nhật khi có API.`
    )
  }

  const handleDelete = (item: Equipment) => {
    toast.info(`Tính năng Xóa "${item.name}" sẽ được cập nhật khi có API.`)
  }

  return (
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên vật dụng</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày mua</TableHead>
                <TableHead>Ghi chú</TableHead>
                {canManage && (
                  <TableHead className="text-right">Thao tác</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(item.purchaseDate).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {item.notes || "-"}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {equipment.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 6 : 5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Chưa có vật dụng nào được quản lý.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
