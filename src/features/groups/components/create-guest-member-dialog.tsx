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
import { NativeSelect } from "@/components/ui/native-select"

interface CreateGuestMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: {
    fullName: string
    dateOfBirth: string
    gender: "MALE" | "FEMALE" | "OTHER" | null
    selfRating: number
    note: string
  }) => void
}

export function CreateGuestMemberDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateGuestMemberDialogProps) {
  const [fullName, setFullName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | null>(null)
  const [selfRating, setSelfRating] = useState(2.5)
  const [note, setNote] = useState("")

  const handleSubmit = () => {
    if (!fullName.trim() || !dateOfBirth) return
    onSubmit({
      fullName: fullName.trim(),
      dateOfBirth,
      gender,
      selfRating,
      note: note.trim(),
    })
    setFullName("")
    setDateOfBirth("")
    setGender(null)
    setSelfRating(2.5)
    setNote("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gửi yêu cầu người vãng lai</DialogTitle>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="guest-fullname">Họ tên</FieldLabel>
            <Input
              id="guest-fullname"
              placeholder="Nhập họ tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="guest-dob">Ngày sinh</FieldLabel>
            <Input
              id="guest-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="guest-gender">Giới tính</FieldLabel>
            <NativeSelect
              id="guest-gender"
              value={gender ?? ""}
              onChange={(e) => {
                const v = e.target.value
                setGender(
                  v === "MALE" || v === "FEMALE" || v === "OTHER" ? v : null
                )
              }}
            >
              <option value="">Chọn giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="guest-rating">Rank (trình độ)</FieldLabel>
            <NativeSelect
              id="guest-rating"
              value={String(selfRating)}
              onChange={(e) => setSelfRating(Number(e.target.value))}
            >
              <option value="2.0">2.0</option>
              <option value="2.5">2.5</option>
              <option value="3.0">3.0</option>
              <option value="3.5">3.5</option>
              <option value="4.0">4.0</option>
              <option value="4.5">4.5</option>
              <option value="5.0">5.0</option>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="guest-note">Ghi chú</FieldLabel>
            <Input
              id="guest-note"
              placeholder="Nhập ghi chú (nếu có)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
        </FieldGroup>

        <DialogFooter showCloseButton>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!fullName.trim() || !dateOfBirth}
          >
            Gửi yêu cầu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
