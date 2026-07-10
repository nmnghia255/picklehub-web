"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

import {
  equipmentQueryKeys,
  listEquipmentFavoritesClient,
} from "../../api/equipment-client"
import type { EquipmentFavorite } from "../../types"

interface FavoriteTemplatesSelectorProps {
  groupId: string
  onSelect: (template: EquipmentFavorite) => void
}

export function FavoriteTemplatesSelector({
  groupId,
  onSelect,
}: FavoriteTemplatesSelectorProps) {
  const { t } = useTranslation("common")

  const { data, isLoading } = useQuery({
    queryKey: equipmentQueryKeys.favorites(groupId),
    queryFn: () => listEquipmentFavoritesClient(groupId),
  })

  const templates = data?.data ?? []

  if (isLoading) {
    return (
      <div className="space-y-2" data-testid="selector-skeleton">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {t("equipment.selectFromFavorite", "Chọn từ mẫu yêu thích")}
      </label>
      <Select
        onValueChange={(value) => {
          const selected = templates.find((t) => t.id === value)
          if (selected) {
            onSelect(selected)
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={t(
              "equipment.selectFromFavorite",
              "Chọn từ mẫu yêu thích"
            )}
          />
        </SelectTrigger>
        <SelectContent>
          {templates.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              {t("equipment.noFavorites", "Chưa có mẫu yêu thích nào")}
            </div>
          ) : (
            templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
                {template.defaultQuantity && ` (${template.defaultQuantity})`}
                {template.defaultCost &&
                  ` - ${template.defaultCost.toLocaleString("vi-VN")}đ`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
