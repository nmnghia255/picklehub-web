"use client"

import { Camera } from "lucide-react"
import { startTransition, useActionState, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { updateProfileDetailsAction } from "@/features/profile/actions"

type EditPlayerInfoValues = {
  name?: string | null
  avatarUrl?: string | null
  bio?: string | null
  gender?: "MALE" | "FEMALE" | "OTHER" | null
  selfRating?: number | null
  preferredHand?: "RIGHT" | "LEFT" | "AMBIDEXTROUS" | null
}

export function EditPlayerInfoForm({
  initialValues,
}: {
  initialValues?: EditPlayerInfoValues
}) {
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarMethod, setAvatarMethod] = useState<"file" | "url">("file")

  const displayName = initialValues?.name?.trim() || "Unnamed Player"
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  const [state, formAction, isPending] = useActionState(
    updateProfileDetailsAction,
    {}
  )

  return (
    <form
      action={(formData) => {
        startTransition(() => formAction(formData))
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <div
          className="cursor-pointer rounded-xl border bg-muted/20 p-4 transition-colors hover:bg-muted/35"
          role="button"
          tabIndex={0}
          onClick={() => setAvatarDialogOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              setAvatarDialogOpen(true)
            }
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage
                src={initialValues?.avatarUrl || undefined}
                alt={displayName}
              />
              <AvatarFallback>{initials || "U"}</AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <p className="text-sm font-medium">Ảnh đại diện hiện tại</p>
              <p className="text-sm text-muted-foreground">
                Nhấn vào đây để chọn cách cập nhật avatar.
              </p>
              <p className="text-xs text-muted-foreground">
                Cách hiện tại:{" "}
                {avatarMethod === "file"
                  ? "Tải ảnh từ thiết bị"
                  : "Dùng Avatar URL"}
              </p>
            </div>
          </div>
        </div>

        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Chọn cách cập nhật avatar</DialogTitle>
              <DialogDescription>
                Bạn có thể tải ảnh từ thiết bị hoặc dùng đường dẫn ảnh công
                khai.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-2 md:grid-cols-2">
              <Button
                type="button"
                variant={avatarMethod === "file" ? "default" : "outline"}
                className="h-auto w-full justify-start p-4 text-left"
                onClick={() => {
                  setAvatarMethod("file")
                }}
              >
                <span className="flex w-full flex-col items-start gap-1">
                  <span className="text-sm leading-tight font-medium">
                    Tải ảnh từ thiết bị
                  </span>
                  <span className="text-xs leading-snug opacity-80">
                    Chọn ảnh từ máy của bạn.
                  </span>
                </span>
              </Button>

              <Button
                type="button"
                variant={avatarMethod === "url" ? "default" : "outline"}
                className="h-auto w-full justify-start p-4 text-left"
                onClick={() => {
                  setAvatarMethod("url")
                }}
              >
                <span className="flex w-full flex-col items-start gap-1">
                  <span className="text-sm leading-tight font-medium">
                    Dùng Avatar URL
                  </span>
                  <span className="text-xs leading-snug opacity-80">
                    Dán link ảnh công khai từ internet.
                  </span>
                </span>
              </Button>
            </div>

            <div className="py-2">
              {avatarMethod === "file" ? (
                <Field>
                  <FieldLabel htmlFor="avatarFile">
                    Tải ảnh từ thiết bị
                  </FieldLabel>
                  <Input
                    id="avatarFile"
                    name="avatarFile"
                    type="file"
                    accept="image/*"
                  />
                </Field>
              ) : (
                <Field>
                  <FieldLabel htmlFor="avatarUrl">Avatar URL</FieldLabel>
                  <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    defaultValue={initialValues?.avatarUrl ?? ""}
                  />
                </Field>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Xong
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="name">Tên hiển thị</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder="Ví dụ: Minh Anh"
              defaultValue={initialValues?.name ?? ""}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="bio">Giới thiệu</FieldLabel>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Viết vài dòng để giới thiệu về bạn..."
            defaultValue={initialValues?.bio ?? ""}
            rows={4}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="gender">Giới tính</FieldLabel>
            <NativeSelect
              id="gender"
              name="gender"
              defaultValue={initialValues?.gender ?? ""}
            >
              <NativeSelectOption value="">Chọn giới tính</NativeSelectOption>
              <NativeSelectOption value="MALE">Nam</NativeSelectOption>
              <NativeSelectOption value="FEMALE">Nữ</NativeSelectOption>
              <NativeSelectOption value="OTHER">Khác</NativeSelectOption>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="selfRating">Tự đánh giá</FieldLabel>
            <NativeSelect
              id="selfRating"
              name="selfRating"
              defaultValue={initialValues?.selfRating ?? "Newbie 2.5"}
            >
              <NativeSelectOption value="">Chọn mức độ</NativeSelectOption>
              <NativeSelectOption value="1">2.0</NativeSelectOption>
              <NativeSelectOption value="2">2.25</NativeSelectOption>
              <NativeSelectOption value="3">2.5</NativeSelectOption>
              <NativeSelectOption value="4">2.75</NativeSelectOption>
              <NativeSelectOption value="5">3.0</NativeSelectOption>
              <NativeSelectOption value="6">3.25</NativeSelectOption>
              <NativeSelectOption value="7">3.5</NativeSelectOption>
              <NativeSelectOption value="8">3.75</NativeSelectOption>
              <NativeSelectOption value="9">4.0</NativeSelectOption>
              <NativeSelectOption value="10">4.25</NativeSelectOption>
              <NativeSelectOption value="11">4.5</NativeSelectOption>
              <NativeSelectOption value="12">4.75</NativeSelectOption>
              <NativeSelectOption value="13">5.0+</NativeSelectOption>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="preferredHand">Tay thuận</FieldLabel>
            <NativeSelect
              id="preferredHand"
              name="preferredHand"
              defaultValue={initialValues?.preferredHand ?? ""}
            >
              <NativeSelectOption value="">Chọn tay thuận</NativeSelectOption>
              <NativeSelectOption value="RIGHT">Tay phải</NativeSelectOption>
              <NativeSelectOption value="LEFT">Tay trái</NativeSelectOption>
              <NativeSelectOption value="AMBIDEXTROUS">
                Hai tay
              </NativeSelectOption>
            </NativeSelect>
          </Field>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          <Camera className="mt-0.5 size-4 shrink-0" />
          <p>
            Các trường này được lưu cùng hồ sơ người dùng để hiển thị ở trang cá
            nhân và các khu vực ghép trận.
          </p>
        </div>

        {state.error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
        )}

        {state.success && state.message && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3">
            <p className="text-sm text-green-700">{state.message}</p>
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Đang lưu..." : "Lưu thông tin"}
        </Button>
      </FieldGroup>
    </form>
  )
}
