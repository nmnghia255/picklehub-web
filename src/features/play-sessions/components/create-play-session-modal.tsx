"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { CreatePlaySessionForm } from "./create-play-session-form"

export function CreatePlaySessionModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="h-12 bg-blue-600 px-7 text-base font-semibold text-white hover:cursor-pointer hover:bg-blue-700"
        >
          Tạo buổi chơi
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo buổi chơi mới</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <CreatePlaySessionForm
          showCard={false}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
