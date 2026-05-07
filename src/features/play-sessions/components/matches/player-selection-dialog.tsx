"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Player {
  id: string
  name: string
  skillLevel?: number
  avatarUrl?: string | null
}

interface PlayerSelectionDialogProps {
  open: boolean
  slotLabel?: string
  players: Player[]
  sessionPlayerIds: string[]
  skillLevelLabel: (skillLevel?: number) => string
  onClose: () => void
  onSelect: (playerId: string) => void
}

export function PlayerSelectionDialog({
  open,
  slotLabel,
  players,
  sessionPlayerIds,
  skillLevelLabel,
  onClose,
  onSelect,
}: PlayerSelectionDialogProps) {
  const visiblePlayers = players.filter(
    (player) => !sessionPlayerIds.includes(player.id)
  )

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle>Chọn cầu thủ</DialogTitle>
          <DialogDescription>
            {slotLabel
              ? `Chọn cầu thủ cho ${slotLabel}`
              : "Chọn một cầu thủ để thêm vào trận đấu"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-96 gap-2 overflow-y-auto">
          {visiblePlayers.length > 0 ? (
            visiblePlayers.map((player) => (
              <Button
                key={player.id}
                variant="outline"
                className="h-auto justify-start py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => onSelect(player.id)}
              >
                <div className="text-left">
                  <div className="font-medium">{player.name}</div>
                  {player.skillLevel && (
                    <div className="text-xs text-muted-foreground dark:text-slate-400">
                      {skillLevelLabel(player.skillLevel)}
                    </div>
                  )}
                </div>
              </Button>
            ))
          ) : (
            <div className="rounded border border-dashed border-slate-300 p-4 text-sm text-muted-foreground dark:border-slate-700 dark:text-slate-400">
              Không còn cầu thủ phù hợp để thêm vào trận này.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
