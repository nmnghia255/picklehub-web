"use client"

import { RefreshCw, Sparkles } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MatchesControlPanelProps {
  courts: number
  hours: number
  onCourtsChange: (courts: number) => void
  onHoursChange: (hours: number) => void
  onGenerateMatches: () => void
}

export function MatchesControlPanel({
  courts,
  hours,
  onCourtsChange,
  onHoursChange,
  onGenerateMatches,
}: MatchesControlPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    onGenerateMatches()
    setIsGenerating(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-slate-50">
          Cấu hình trận đấu
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Number of Courts */}
        <div className="space-y-2">
          <Label
            htmlFor="courts"
            className="text-foreground dark:text-slate-200"
          >
            Số sân
          </Label>
          <Input
            id="courts"
            type="number"
            min={1}
            max={12}
            value={courts}
            onChange={(e) =>
              onCourtsChange(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="h-10"
          />
          <p className="text-xs text-muted-foreground dark:text-slate-400">
            Thiết lập 1-12 sân
          </p>
        </div>

        {/* Number of Hours/Sessions */}
        <div className="space-y-2">
          <Label
            htmlFor="hours"
            className="text-foreground dark:text-slate-200"
          >
            Số phiên
          </Label>
          <Input
            id="hours"
            type="number"
            min={1}
            max={8}
            value={hours}
            onChange={(e) =>
              onHoursChange(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="h-10"
          />
          <p className="text-xs text-muted-foreground dark:text-slate-400">
            1 giờ mỗi phiên
          </p>
        </div>

        {/* Total Match Slots */}
        <div className="space-y-2">
          <Label className="text-foreground dark:text-slate-200">
            Tổng số trận
          </Label>
          <Card className="flex h-10 items-center justify-center border-border bg-muted/50 text-lg font-semibold text-foreground dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-50">
            {courts * hours}
          </Card>
          <p className="text-xs text-muted-foreground dark:text-slate-400">
            {courts} sân × {hours} phiên
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="lg"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "Đang tạo..." : "Tạo trận"}
        </Button>
        <Button
          onClick={handleGenerate}
          variant="outline"
          size="lg"
          disabled={isGenerating}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Tạo lại
        </Button>
      </div>

      {/* Info Box */}
      <Card className="border-sky-200 bg-sky-50 p-4 dark:border-cyan-900/60 dark:bg-slate-950/60">
        <div className="space-y-1 text-sm">
          <p className="font-medium text-sky-900 dark:text-cyan-200">
            💡 Cách hoạt động
          </p>
          <ul className="ml-4 list-disc space-y-1 text-xs text-sky-800 dark:text-slate-300">
            <li>Điều chỉnh số sân và số phiên cho buổi chơi</li>
            <li>
              Nhấp &quot;Tạo trận&quot; để ghép cặp tất cả cầu thủ trong phiên
            </li>
            <li>Kéo cầu thủ giữa các trận để điều chỉnh thủ công</li>
            <li>Đổi loại trận (Đơn/Đôi) khi cần</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
