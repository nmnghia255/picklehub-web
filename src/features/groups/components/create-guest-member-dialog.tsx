"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import type { CreateGuestInput } from "../types/guest-member"

interface CreateGuestMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateGuestInput) => void
}

export function CreateGuestMemberDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateGuestMemberDialogProps) {
  const [guestCount, setGuestCount] = useState<number>(1)
  const [sessionCount, setSessionCount] = useState<number>(1)

  const handleSubmit = () => {
    if (guestCount < 1 || sessionCount < 1) return
    onSubmit({
      // Backend only accepts guestsCount / sessionsCount
      guestsCount: guestCount,
      sessionsCount: sessionCount,
    })
    setGuestCount(1)
    setSessionCount(1)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gửi yêu cầu khách vãng lai</DialogTitle>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="guest-count">Số lượng khách</FieldLabel>
            <Input
              id="guest-count"
              type="number"
              min={1}
              placeholder="Nhập số lượng khách"
              value={guestCount}
              onChange={(e) =>
                setGuestCount(Math.max(1, parseInt(e.target.value) || 1))
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="session-count">Số buổi đăng ký</FieldLabel>
            <Input
              id="session-count"
              type="number"
              min={1}
              placeholder="Nhập số buổi"
              value={sessionCount}
              onChange={(e) =>
                setSessionCount(Math.max(1, parseInt(e.target.value) || 1))
              }
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={guestCount < 1 || sessionCount < 1}
          >
            Gửi yêu cầu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
