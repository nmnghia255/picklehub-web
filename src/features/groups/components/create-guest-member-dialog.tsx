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
    name: string
    email: string
    skillLevel: string
    phone?: string
    gender?: "MALE" | "FEMALE"
  }) => void
}

export function CreateGuestMemberDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateGuestMemberDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [skillLevel, setSkillLevel] = useState("INTERMEDIATE")
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("")

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      skillLevel,
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(gender ? { gender: gender as "MALE" | "FEMALE" } : {}),
    })
    setName("")
    setEmail("")
    setSkillLevel("INTERMEDIATE")
    setPhone("")
    setGender("")
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
            <FieldLabel htmlFor="guest-name">Họ tên</FieldLabel>
            <Input
              id="guest-name"
              placeholder="Nhập họ tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="guest-email">Email</FieldLabel>
            <Input
              id="guest-email"
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="guest-skill">Trình độ</FieldLabel>
            <NativeSelect
              id="guest-skill"
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
            >
              <option value="BEGINNER">Mới bắt đầu</option>
              <option value="INTERMEDIATE">Trung bình</option>
              <option value="ADVANCED">Khá</option>
              <option value="EXPERT">Chuyên nghiệp</option>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="guest-phone">
              Số điện thoại (tùy chọn)
            </FieldLabel>
            <Input
              id="guest-phone"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="guest-gender">Giới tính (tùy chọn)</FieldLabel>
            <NativeSelect
              id="guest-gender"
              value={gender}
              onChange={(e) =>
                setGender(e.target.value as "MALE" | "FEMALE" | "")
              }
            >
              <option value="">Chọn giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </NativeSelect>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !email.trim()}
          >
            Gửi yêu cầu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
