"use client"

import { RefreshCw, Sparkles } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"

interface MatchesControlPanelProps {
  courts: number
  hours: number
  availablePlayers: Array<{ id: string; name: string; skillLevel?: number }>
  selectedPlayerIds: string[]
  onCourtsChange: (courts: number) => void
  onHoursChange: (hours: number) => void
  onPlayersChange: (playerIds: string[]) => void
  onGenerateMatches: () => void
}

export function MatchesControlPanel({
  courts,
  hours,
  availablePlayers,
  selectedPlayerIds,
  onCourtsChange,
  onHoursChange,
  onPlayersChange,
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

  const skillLevelLabel = (skillLevel?: number) => {
    const levels = [
      "",
      "Người mới bắt đầu",
      "Trung cấp",
      "Nâng cao",
      "Chuyên gia",
      "Chuyên nghiệp",
    ]
    return skillLevel ? levels[skillLevel] || "" : ""
  }

  const playerOptions = availablePlayers.map((player) => ({
    value: player.id,
    label: player.name,
    description: skillLevelLabel(player.skillLevel),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Cấu hình trận đấu</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Number of Courts */}
        <div className="space-y-2">
          <Label htmlFor="courts">Số sân</Label>
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
          <p className="text-xs text-muted-foreground">Thiết lập 1-12 sân</p>
        </div>

        {/* Number of Hours/Sessions */}
        <div className="space-y-2">
          <Label htmlFor="hours">Số phiên</Label>
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
          <p className="text-xs text-muted-foreground">1 giờ mỗi phiên</p>
        </div>

        {/* Total Match Slots */}
        <div className="space-y-2">
          <Label>Tổng số vị trí trận</Label>
          <Card className="flex h-10 items-center justify-center bg-muted/50 text-lg font-semibold">
            {courts * hours}
          </Card>
          <p className="text-xs text-muted-foreground">
            {courts} sân × {hours} phiên
          </p>
        </div>
      </div>

      {/* Player Selection */}
      <div className="space-y-2">
        <Label>Chọn cầu thủ</Label>
        <MultiSelect
          options={playerOptions}
          selected={selectedPlayerIds}
          onSelectionChange={onPlayersChange}
          placeholder="Chọn cầu thủ để bao gồm trong trận..."
        />
        <p className="text-xs text-muted-foreground">
          {selectedPlayerIds.length === 0
            ? "Tất cả cầu thủ sẽ được bao gồm"
            : `${selectedPlayerIds.length} cầu thủ được chọn`}
        </p>
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
      <Card className="border-blue-200 bg-blue-50 p-4">
        <div className="space-y-1 text-sm">
          <p className="font-medium text-blue-900">💡 Cách hoạt động</p>
          <ul className="ml-4 list-disc space-y-1 text-xs text-blue-800">
            <li>Chọn cầu thủ và cấu hình sân của bạn</li>
            <li>
              Nhấp &quot;Tạo trận&quot; để ghép cặp công bằng do AI điều khiển
            </li>
            <li>Kéo cầu thủ giữa các trận để điều chỉnh thủ công</li>
            <li>Đổi loại trận (Đơn/Đôi) khi cần</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
