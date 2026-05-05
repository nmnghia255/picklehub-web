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
    const levels = ["", "Beginner", "Intermediate", "Advanced", "Expert", "Pro"]
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
        <h2 className="mb-4 text-lg font-semibold">Match Configuration</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Number of Courts */}
        <div className="space-y-2">
          <Label htmlFor="courts">Number of Courts</Label>
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
          <p className="text-xs text-muted-foreground">Set up 1-12 courts</p>
        </div>

        {/* Number of Hours/Sessions */}
        <div className="space-y-2">
          <Label htmlFor="hours">Number of Sessions</Label>
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
          <p className="text-xs text-muted-foreground">1 hour per session</p>
        </div>

        {/* Total Match Slots */}
        <div className="space-y-2">
          <Label>Total Match Slots</Label>
          <Card className="flex h-10 items-center justify-center bg-muted/50 text-lg font-semibold">
            {courts * hours}
          </Card>
          <p className="text-xs text-muted-foreground">
            {courts} courts × {hours} sessions
          </p>
        </div>
      </div>

      {/* Player Selection */}
      <div className="space-y-2">
        <Label>Select Players</Label>
        <MultiSelect
          options={playerOptions}
          selected={selectedPlayerIds}
          onSelectionChange={onPlayersChange}
          placeholder="Select players to include in matches..."
        />
        <p className="text-xs text-muted-foreground">
          {selectedPlayerIds.length === 0
            ? "All players will be included"
            : `${selectedPlayerIds.length} players selected`}
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
          {isGenerating ? "Generating..." : "Generate Matches"}
        </Button>
        <Button
          onClick={handleGenerate}
          variant="outline"
          size="lg"
          disabled={isGenerating}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
      </div>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50 p-4">
        <div className="space-y-1 text-sm">
          <p className="font-medium text-blue-900">💡 How it works</p>
          <ul className="ml-4 list-disc space-y-1 text-xs text-blue-800">
            <li>Select players and configure your court setup</li>
            <li>
              Click &quot;Generate Matches&quot; for AI-powered fair pairings
            </li>
            <li>Drag players between matches to manually adjust</li>
            <li>Change match type (Singles/Doubles) as needed</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
