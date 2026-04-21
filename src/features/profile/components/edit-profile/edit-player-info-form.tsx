"use client"

import { startTransition, useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { updateProfileDetailsAction } from "@/features/profile/actions"

type EditPlayerInfoValues = {
  height?: number | null
  weight?: number | null
  level?: string | null
  playStyle?: string | null
  timeToPlay?: string | null
}

export function EditPlayerInfoForm({
  initialValues,
}: {
  initialValues?: EditPlayerInfoValues
}) {
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="height">Chiều cao (cm)</FieldLabel>
            <Input
              id="height"
              name="height"
              type="number"
              min={80}
              max={250}
              placeholder="Ví dụ: 175"
              defaultValue={initialValues?.height ?? ""}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="weight">Cân nặng (kg)</FieldLabel>
            <Input
              id="weight"
              name="weight"
              type="number"
              min={20}
              max={300}
              placeholder="Ví dụ: 70"
              defaultValue={initialValues?.weight ?? ""}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="level">Trình độ</FieldLabel>
            <NativeSelect
              id="level"
              name="level"
              defaultValue={initialValues?.level ?? ""}
            >
              <NativeSelectOption value="">Chọn trình độ</NativeSelectOption>
              <NativeSelectOption value="beginner">
                Người mới
              </NativeSelectOption>
              <NativeSelectOption value="low-intermediate">
                Cơ bản
              </NativeSelectOption>
              <NativeSelectOption value="intermediate">
                Trung cấp
              </NativeSelectOption>
              <NativeSelectOption value="advanced">Cao cấp</NativeSelectOption>
              <NativeSelectOption value="professional">
                Chuyên nghiệp
              </NativeSelectOption>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="playStyle">Lối chơi</FieldLabel>
            <NativeSelect
              id="playStyle"
              name="playStyle"
              defaultValue={initialValues?.playStyle ?? ""}
            >
              <NativeSelectOption value="">Chọn lối chơi</NativeSelectOption>
              <NativeSelectOption value="defensive">
                Phòng thủ
              </NativeSelectOption>
              <NativeSelectOption value="balanced">Cân bằng</NativeSelectOption>
              <NativeSelectOption value="aggressive">
                Tấn công
              </NativeSelectOption>
            </NativeSelect>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="timeToPlay">Thời gian có thể chơi</FieldLabel>
          <NativeSelect
            id="timeToPlay"
            name="timeToPlay"
            defaultValue={initialValues?.timeToPlay ?? ""}
          >
            <NativeSelectOption value="">Chọn thời gian</NativeSelectOption>
            <NativeSelectOption value="weekday-morning">
              Sáng các ngày trong tuần
            </NativeSelectOption>
            <NativeSelectOption value="weekday-evening">
              Tối các ngày trong tuần
            </NativeSelectOption>
            <NativeSelectOption value="weekend">Cuối tuần</NativeSelectOption>
            <NativeSelectOption value="flexible">Linh hoạt</NativeSelectOption>
          </NativeSelect>
        </Field>

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
