"use client"

import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import CreateMatchForm, { type GeneratedMatch } from "./create-match-form"

interface CreateMatchTriggerProps {
  sessionId: string
  players?: { id: string; name?: string | null }[]
  onMatchesCreated?: (matches: GeneratedMatch[]) => void
}

export default function CreateMatchTrigger({
  sessionId,
  players = [],
  onMatchesCreated,
}: CreateMatchTriggerProps) {
  const [open, setOpen] = useState(false)

  const handleCreate = async (matches: GeneratedMatch[]) => {
    if (onMatchesCreated) {
      onMatchesCreated(matches)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-blue-600 text-white">
          Tạo trận đấu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo trận đấu</DialogTitle>
          <DialogDescription>
            Chọn thể thức và người chơi tham gia. Hệ thống sẽ tự động tạo các
            cặp/trận phù hợp.
          </DialogDescription>
        </DialogHeader>
        <CreateMatchForm
          sessionId={sessionId}
          players={players}
          onCreate={async (matches) => {
            await handleCreate(matches)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
