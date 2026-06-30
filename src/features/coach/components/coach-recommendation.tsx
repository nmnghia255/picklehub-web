"use client"

import { Check, Info } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { recommendationTags } from "../data/mockReviews"

export function CoachRecommendation() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (value: string) => {
    setSelectedTags((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    )
  }

  const clearAll = () => setSelectedTags([])

  const suggestedTags = useMemo(
    () => recommendationTags.filter((t) => selectedTags.includes(t.value)),
    [selectedTags]
  )

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Đề xuất HLV</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Chọn các tiêu chí phù hợp với nhu cầu của bạn để nhận đề xuất
                huấn luyện viên.
              </p>
            </div>
            <Info className="mt-1 size-4 shrink-0 text-muted-foreground/60" />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {recommendationTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.value)
              return (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => toggleTag(tag.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-muted-foreground/30"
                  )}
                >
                  {isSelected && <Check className="size-3.5" />}
                  {tag.label}
                </button>
              )
            })}
          </div>

          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-muted-foreground"
              >
                Xóa tất cả
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Kết quả đề xuất</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestedTags.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Chọn các tiêu chí bên trên để xem đề xuất HLV phù hợp với bạn.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">Phù hợp:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <Badge
                    key={tag.value}
                    variant="default"
                    className="gap-1 rounded-full px-3 py-1"
                  >
                    <Check className="size-3.5" />
                    {tag.label}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Dựa trên các tiêu chí bạn đã chọn, hệ thống sẽ đề xuất huấn
                luyện viên có chuyên môn phù hợp. Tính năng này đang ở chế độ
                mock và sẽ được kết nối với dữ liệu thực trong tương lai.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
