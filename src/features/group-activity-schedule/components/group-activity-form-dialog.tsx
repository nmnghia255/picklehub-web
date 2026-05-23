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
  EventFormValues,
  GroupEvent,
  GroupMember,
  Venue,
} from "@/features/group-activity-schedule/group-activity-schedule.types"
import { buildEventDateRange } from "@/features/group-activity-schedule/group-activity-schedule.utils"

interface GroupActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingEvent: GroupEvent | null
  activeGroupId: string
  activeGroupName: string
  members: GroupMember[]
  venues: Venue[]
  onCreate: (
    payload: Omit<GroupEvent, "id" | "createdAt" | "updatedAt" | "updatedById">
  ) => void
  onUpdate: (
    eventId: string,
    payload: Omit<GroupEvent, "id" | "createdAt" | "updatedAt" | "updatedById">
  ) => void
}

const defaultValues: EventFormValues = {
  title: "",
  activityType: "CHOI_THUONG",
  date: new Date().toISOString().split("T")[0],
  startTime: "19:00",
  endTime: "21:00",
  venueId: "",
  description: "",
  createdById: "",
  status: "SAP_DIEN_RA",
}

export function GroupActivityFormDialog({
  open,
  onOpenChange,
  editingEvent,
  activeGroupId,
  activeGroupName,
  members,
  venues,
  onCreate,
  onUpdate,
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
        venueId: editingEvent.venueId,
        description: editingEvent.description,
        createdById: editingEvent.createdById,
        status: editingEvent.status,
      }
    }

    return {
      ...defaultValues,
      createdById: members[0]?.id ?? "",
      venueId: venues[0]?.id ?? "",
    }
  }, [editingEvent, members, venues])

  const dialogTitle = useMemo(
    () => (editingEvent ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"),
    [editingEvent]
  )

  const dialogDescription = useMemo(
    () =>
      editingEvent
        ? "Cập nhật thông tin thời gian, địa điểm và trạng thái sự kiện."
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
          activeGroupId={activeGroupId}
          activeGroupName={activeGroupName}
          members={members}
          venues={venues}
          onOpenChange={onOpenChange}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface GroupActivityFormFieldsProps {
  initialValues: EventFormValues
  editingEvent: GroupEvent | null
  activeGroupId: string
  activeGroupName: string
  members: GroupMember[]
  venues: Venue[]
  onOpenChange: (open: boolean) => void
  onCreate: GroupActivityFormDialogProps["onCreate"]
  onUpdate: GroupActivityFormDialogProps["onUpdate"]
  onCancel: () => void
}

function GroupActivityFormFields({
  initialValues,
  editingEvent,
  activeGroupId,
  activeGroupName,
  members,
  venues,
  onOpenChange,
  onCreate,
  onUpdate,
  onCancel,
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
      nextErrors.title = "Vui lòng nhập tên sự kiện"
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

    if (!values.venueId) {
      nextErrors.venueId = "Vui lòng chọn địa điểm"
    }

    if (!values.createdById) {
      nextErrors.createdById = "Vui lòng chọn người tạo"
    }

    if (!values.description.trim()) {
      nextErrors.description = "Vui lòng nhập ghi chú"
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

    const payload: Omit<
      GroupEvent,
      "id" | "createdAt" | "updatedAt" | "updatedById"
    > = {
      groupId: editingEvent?.groupId ?? activeGroupId,
      groupName: editingEvent?.groupName ?? activeGroupName,
      title: values.title.trim(),
      activityType: values.activityType,
      status: values.status,
      startAt,
      endAt,
      venueId: values.venueId,
      description: values.description.trim(),
      createdById: values.createdById,
      participantIds:
        editingEvent?.participantIds.length &&
        editingEvent.participantIds.length > 0
          ? editingEvent.participantIds
          : [values.createdById],
    }

    if (editingEvent) {
      onUpdate(editingEvent.id, payload)
    } else {
      onCreate(payload)
    }

    onOpenChange(false)
  }

  return (
    <>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="event-title">Tên sự kiện</FieldLabel>
          <Input
            id="event-title"
            value={values.title}
            onChange={(event) => handleChange("title", event.target.value)}
            placeholder="Ví dụ: Social tối thứ 6"
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
                <SelectItem value="CHOI_THUONG">Buổi chơi thường</SelectItem>
                <SelectItem value="SOCIAL">Social</SelectItem>
                <SelectItem value="GIAI_DAU">Giải đấu nhỏ</SelectItem>
                <SelectItem value="THUE_SAN_GIAO_LUU">
                  Thuê sân giao lưu
                </SelectItem>
                <SelectItem value="MEETUP">Meetup nhóm</SelectItem>
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
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAP_DIEN_RA">Sắp diễn ra</SelectItem>
                <SelectItem value="DANG_DIEN_RA">Đang diễn ra</SelectItem>
                <SelectItem value="DA_KET_THUC">Đã kết thúc</SelectItem>
                <SelectItem value="DA_HUY">Đã hủy</SelectItem>
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
          <Select
            value={values.venueId}
            onValueChange={(value) => handleChange("venueId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn địa điểm" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.venueId}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Ghi chú</FieldLabel>
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
          <FieldLabel>Người tạo</FieldLabel>
          <Select
            value={values.createdById}
            onValueChange={(value) => handleChange("createdById", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn người tạo" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.createdById}</FieldError>
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button onClick={handleSubmit}>
          {editingEvent ? "Lưu thay đổi" : "Tạo sự kiện"}
        </Button>
      </DialogFooter>
    </>
  )
}
