"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type {
  CreateGroupActivityDto,
  EventFormValues,
  GroupActivity,
  UpdateGroupActivityDto,
} from "@/features/group-activity-schedule/group-activity-schedule.types"
import {
  buildEventDateRange,
  formatISO,
} from "@/features/group-activity-schedule/group-activity-schedule.utils"

interface GroupActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingEvent: GroupActivity | null
  activeGroupId: string
  onCreate: (payload: CreateGroupActivityDto) => void
  onUpdate: (activityId: string, payload: UpdateGroupActivityDto) => void
  isSubmitting?: boolean
}

const defaultValues: EventFormValues = {
  title: "",
  activityType: "PRACTICE",
  date: new Date().toISOString().split("T")[0],
  startTime: "19:00",
  endTime: "21:00",
  location: "",
  description: "",
  status: "SCHEDULED",
}

export function GroupActivityFormDialog({
  open,
  onOpenChange,
  editingEvent,
  onCreate,
  onUpdate,
  isSubmitting = false,
}: GroupActivityFormDialogProps) {
  const initialValues = useMemo<EventFormValues>(() => {
    if (editingEvent) {
      const start = new Date(editingEvent.startAt)
      const end = new Date(editingEvent.endAt)

      return {
        title: editingEvent.title,
        activityType: editingEvent.activityType,
        date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
        startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
        endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
        location: editingEvent.location,
        description: editingEvent.description,
        status: editingEvent.status,
        remindAt: editingEvent.remindAt,
      }
    }

    return defaultValues
  }, [editingEvent])

  const dialogTitle = useMemo(
    () => (editingEvent ? "Chỉnh sửa hoạt động" : "Tạo hoạt động mới"),
    [editingEvent]
  )

  const dialogDescription = useMemo(
    () =>
      editingEvent
        ? "Cập nhật thông tin thời gian, địa điểm và trạng thái hoạt động."
        : "Điền thông tin để tạo hoạt động mới cho nhóm.",
    [editingEvent]
  )

  const formKey = `${editingEvent?.id ?? "new"}-${open ? "open" : "closed"}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <GroupActivityFormFields
          key={formKey}
          initialValues={initialValues}
          editingEvent={editingEvent}
          onOpenChange={onOpenChange}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}

interface GroupActivityFormFieldsProps {
  initialValues: EventFormValues
  editingEvent: GroupActivity | null
  onOpenChange: (open: boolean) => void
  onCreate: GroupActivityFormDialogProps["onCreate"]
  onUpdate: GroupActivityFormDialogProps["onUpdate"]
  onCancel: () => void
  isSubmitting: boolean
}

function GroupActivityFormFields({
  initialValues,
  editingEvent,
  onCreate,
  onUpdate,
  onCancel,
  isSubmitting,
}: GroupActivityFormFieldsProps) {
  const [values, setValues] = useState<EventFormValues>(initialValues)
  const [errors, setErrors] = useState<
    Partial<Record<keyof EventFormValues, string>>
  >({})

  const handleChange = <K extends keyof EventFormValues>(
    key: K,
    value: EventFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof EventFormValues, string>> = {}

    if (!values.title.trim()) {
      nextErrors.title = "Vui lòng nhập tên hoạt động"
    }

    if (!values.date) {
      nextErrors.date = "Vui lòng chọn ngày"
    }

    if (!values.startTime) {
      nextErrors.startTime = "Vui lòng chọn giờ bắt đầu"
    }

    if (!values.endTime) {
      nextErrors.endTime = "Vui lòng chọn giờ kết thúc"
    }

    if (
      values.startTime &&
      values.endTime &&
      values.endTime <= values.startTime
    ) {
      nextErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu"
    }

    if (!values.location.trim()) {
      nextErrors.location = "Vui lòng nhập địa điểm"
    }

    if (!values.description.trim()) {
      nextErrors.description = "Vui lòng nhập mô tả"
    }

    if (values.remindAt) {
      const remindTime = new Date(values.remindAt).getTime()
      if (remindTime <= Date.now()) {
        nextErrors.remindAt = "Thời gian nhắc phải nằm trong tương lai"
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) {
      return
    }

    const { startAt, endAt } = buildEventDateRange(
      values.date,
      values.startTime,
      values.endTime
    )

    if (editingEvent) {
      const payload: UpdateGroupActivityDto = {
        title: values.title.trim(),
        activityType: values.activityType,
        status: values.status,
        startAt,
        endAt,
        location: values.location.trim(),
        description: values.description.trim(),
        remindAt: values.remindAt ? formatISO(values.remindAt) : undefined,
      }
      onUpdate(editingEvent.id, payload)
    } else {
      const payload: CreateGroupActivityDto = {
        title: values.title.trim(),
        activityType: values.activityType,
        startAt,
        endAt,
        location: values.location.trim(),
        description: values.description.trim(),
        remindAt: values.remindAt ? formatISO(values.remindAt) : undefined,
      }
      onCreate(payload)
    }
  }

  return (
    <>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="event-title">Tên hoạt động</FieldLabel>
          <Input
            id="event-title"
            value={values.title}
            onChange={(event) => handleChange("title", event.target.value)}
            placeholder="Ví dụ: Tập luyện sáng thứ 7"
          />
          <FieldError>{errors.title}</FieldError>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Loại hoạt động</FieldLabel>
            <Select
              value={values.activityType}
              onValueChange={(value) =>
                handleChange(
                  "activityType",
                  value as EventFormValues["activityType"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại hoạt động" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRACTICE">Tập luyện</SelectItem>
                <SelectItem value="MEETUP">Giao lưu (Meetup)</SelectItem>
                <SelectItem value="INTERNAL_MATCH">Thi đấu nội bộ</SelectItem>
                <SelectItem value="MEETING">Họp mặt</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Trạng thái</FieldLabel>
            <Select
              value={values.status}
              onValueChange={(value) =>
                handleChange("status", value as EventFormValues["status"])
              }
              disabled={!editingEvent}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Sắp diễn ra</SelectItem>
                <SelectItem value="COMPLETED">Đã kết thúc</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel>Ngày</FieldLabel>
            <Input
              type="date"
              value={values.date}
              onChange={(event) => handleChange("date", event.target.value)}
            />
            <FieldError>{errors.date}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Giờ bắt đầu</FieldLabel>
            <Input
              type="time"
              value={values.startTime}
              onChange={(event) =>
                handleChange("startTime", event.target.value)
              }
            />
            <FieldError>{errors.startTime}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Giờ kết thúc</FieldLabel>
            <Input
              type="time"
              value={values.endTime}
              onChange={(event) => handleChange("endTime", event.target.value)}
            />
            <FieldError>{errors.endTime}</FieldError>
          </Field>
        </div>

        <Field>
          <FieldLabel>Địa điểm</FieldLabel>
          <Input
            value={values.location}
            onChange={(event) => handleChange("location", event.target.value)}
            placeholder="Ví dụ: Sân Pickleball A"
          />
          <FieldError>{errors.location}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Mô tả</FieldLabel>
          <Textarea
            rows={4}
            value={values.description}
            onChange={(event) =>
              handleChange("description", event.target.value)
            }
            placeholder="Mô tả thêm về nội dung hoạt động"
          />
          <FieldError>{errors.description}</FieldError>
        </Field>

        <Field>
          <div className="mb-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="enable-reminder"
              checked={!!values.remindAt}
              onChange={(e) => {
                if (e.target.checked) {
                  // Default to 1 hour before start time, or 1 hour from now if that's in the past
                  const { startAt } = buildEventDateRange(
                    values.date,
                    values.startTime,
                    values.endTime
                  )
                  const startDate = new Date(startAt)
                  let defaultRemindDate = new Date(
                    startDate.getTime() - 60 * 60 * 1000
                  )

                  if (defaultRemindDate.getTime() <= Date.now()) {
                    defaultRemindDate = new Date(Date.now() + 60 * 60 * 1000)
                  }

                  handleChange("remindAt", formatISO(defaultRemindDate))
                } else {
                  handleChange("remindAt", undefined)
                }
              }}
              className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <FieldLabel htmlFor="enable-reminder" className="mb-0">
              Nhắc nhở thành viên
            </FieldLabel>
          </div>
          {values.remindAt && (
            <div className="space-y-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="date"
                  value={values.remindAt.split("T")[0]}
                  onChange={(e) => {
                    const time = values.remindAt?.split("T")[1] || "09:00:00Z"
                    handleChange(
                      "remindAt",
                      formatISO(`${e.target.value}T${time}`)
                    )
                  }}
                />
                <Input
                  type="time"
                  value={values.remindAt.split("T")[1]?.slice(0, 5) || "09:00"}
                  onChange={(e) => {
                    const date =
                      values.remindAt?.split("T")[0] ||
                      formatISO(new Date()).split("T")[0]
                    handleChange(
                      "remindAt",
                      formatISO(`${date}T${e.target.value}:00Z`)
                    )
                  }}
                />
              </div>
              <FieldError>{errors.remindAt}</FieldError>
            </div>
          )}
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting
            ? "Đang xử lý..."
            : editingEvent
              ? "Lưu thay đổi"
              : "Tạo hoạt động"}
        </Button>
      </DialogFooter>
    </>
  )
}
