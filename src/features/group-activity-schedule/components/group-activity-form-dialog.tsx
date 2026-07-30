"use client"

import { useQuery } from "@tanstack/react-query"
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
import type { GroupCourtBooking } from "@/features/groups/public/group-activity-integration"
import {
  groupQueryKeys,
  listGroupCourtBookingsClient,
} from "@/features/groups/public/group-activity-integration"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

const formatBookingTime = (isoString?: string) => {
  if (!isoString) return ""
  try {
    if (isoString.length === 5 && isoString.includes(":")) return isoString
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return isoString
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  } catch {
    return isoString
  }
}

const formatBookingDate = (dateStr?: string) => {
  if (!dateStr) return ""
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

const formatBookingDateForInput = (dateStr?: string) => {
  if (!dateStr) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  } catch {
    return dateStr
  }
}

const TIME_OPTIONS_24H = Array.from({ length: 48 }, (_, i) => {
  const hours = String(Math.floor(i / 2)).padStart(2, "0")
  const minutes = i % 2 === 0 ? "00" : "30"
  return `${hours}:${minutes}`
})

const getTimeOptions = (currentTime?: string) => {
  if (currentTime && !TIME_OPTIONS_24H.includes(currentTime)) {
    return [...TIME_OPTIONS_24H, currentTime].sort()
  }
  return TIME_OPTIONS_24H
}

interface GroupActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingEvent: GroupActivity | null
  activeGroupId: string
  initialDate?: string | null
  onCreate: (payload: CreateGroupActivityDto) => void
  onUpdate: (activityId: string, payload: UpdateGroupActivityDto) => void
  isSubmitting?: boolean
}

const defaultValues: EventFormValues = {
  title: "",
  activityType: "PRACTICE",
  date: new Date().toISOString().split("T")[0],
  startTime: "18:00",
  endTime: "20:00",
  location: "",
  description: "",
  status: "SCHEDULED",
  courtBookingId: null,
}

export function GroupActivityFormDialog({
  open,
  onOpenChange,
  editingEvent,
  activeGroupId,
  initialDate,
  onCreate,
  onUpdate,
  isSubmitting = false,
}: GroupActivityFormDialogProps) {
  const { t } = useGroupsTranslation()
  // Query sân chưa liên kết (tương lai) để dùng trong dropdown tạo/sửa activity
  const courtBookingsQuery = useQuery({
    queryKey: groupQueryKeys.courtBookings(activeGroupId, {
      page: 1,
      limit: 100,
      linked: false,
    }),
    queryFn: () =>
      listGroupCourtBookingsClient(activeGroupId, {
        page: 1,
        limit: 100,
        linked: false,
      }),
    enabled: open && !!activeGroupId,
  })

  const courtBookings = useMemo(() => {
    const rawList = courtBookingsQuery.data?.data || []
    const unlinked = rawList.filter((b) => !b.isLinked)
    // Khi edit, booking hiện tại đã linked=true nên sẽ không có trong list trên.
    // Nếu activity.courtBooking có sẵn (embedded), build synthetic entry để dropdown hiển thị đúng label.
    if (editingEvent?.courtBooking && editingEvent.courtBookingId) {
      const alreadyInList = unlinked.some(
        (b) => b.id === editingEvent.courtBookingId
      )
      if (!alreadyInList) {
        const snap = editingEvent.courtBooking
        const syntheticEntry = {
          id: editingEvent.courtBookingId,
          bookingId: editingEvent.courtBookingId,
          groupId: activeGroupId,
          title: snap.title || "Lịch đặt sân",
          note: null,
          createdAt: "",
          updatedAt: "",
          centerName: snap.centerName,
          totalBookingCost: 0,
          date: snap.date,
          startTime: snap.startTime,
          endTime: snap.endTime,
          bookingItemsSnapshot: [],
          isLinked: true,
        } as GroupCourtBooking
        return [syntheticEntry, ...unlinked]
      }
    }
    return unlinked
  }, [courtBookingsQuery.data, editingEvent, activeGroupId])

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
        courtBookingId:
          editingEvent.courtBookingId || editingEvent.bookingId || null,
      }
    }

    return {
      ...defaultValues,
      date: initialDate || defaultValues.date,
      startTime: "18:00",
      endTime: "20:00",
    }
  }, [editingEvent, initialDate])

  const dialogTitle = useMemo(
    () =>
      editingEvent
        ? t("activitySchedule.activityFormTitleEdit")
        : t("activitySchedule.activityFormTitleCreate"),
    [editingEvent, t]
  )

  const dialogDescription = useMemo(
    () =>
      editingEvent
        ? t(
            "activitySchedule.activityFormDescEdit",
            "Cập nhật thông tin thời gian, địa điểm và các cấu phần liên quan."
          )
        : t(
            "activitySchedule.activityFormDescCreate",
            "Điền thông tin để tạo hoạt động mới cho nhóm."
          ),
    [editingEvent, t]
  )

  const formKey = `${editingEvent?.id ?? "new"}-${open ? "open" : "closed"}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        showCloseButton={false}
      >
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
          courtBookings={courtBookings}
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
  courtBookings: GroupCourtBooking[]
}

function GroupActivityFormFields({
  initialValues,
  editingEvent,
  onCreate,
  onUpdate,
  onCancel,
  isSubmitting,
  courtBookings,
}: GroupActivityFormFieldsProps) {
  const { t } = useGroupsTranslation()
  const [values, setValues] = useState<EventFormValues>(initialValues)
  const [errors, setErrors] = useState<
    Partial<Record<keyof EventFormValues, string>>
  >({})

  const filteredCourtBookings = useMemo(() => {
    if (!values.date) return courtBookings

    return courtBookings.filter((b) => {
      if (
        values.courtBookingId &&
        (b.id === values.courtBookingId ||
          b.bookingId === values.courtBookingId)
      ) {
        return true
      }

      const bookingDateStr = formatBookingDateForInput(b.date || b.startTime)
      return bookingDateStr === values.date
    })
  }, [courtBookings, values.date, values.courtBookingId])

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
      nextErrors.title = t(
        "activitySchedule.formValidationTitle",
        "Vui lòng nhập tên hoạt động"
      )
    }

    if (!values.date) {
      nextErrors.date = t(
        "activitySchedule.formValidationDate",
        "Vui lòng chọn ngày"
      )
    }

    if (!values.startTime) {
      nextErrors.startTime = t(
        "activitySchedule.formValidationStartTime",
        "Vui lòng chọn giờ bắt đầu"
      )
    }

    if (!values.endTime) {
      nextErrors.endTime = t(
        "activitySchedule.formValidationEndTime",
        "Vui lòng chọn giờ kết thúc"
      )
    }

    if (
      values.startTime &&
      values.endTime &&
      values.endTime <= values.startTime
    ) {
      nextErrors.endTime = t(
        "activitySchedule.formValidationTimeOrder",
        "Giờ kết thúc phải sau giờ bắt đầu"
      )
    }

    if (values.date && values.startTime) {
      const { startAt } = buildEventDateRange(
        values.date,
        values.startTime,
        values.endTime
      )
      const startTimeMs = new Date(startAt).getTime()

      let isTimeUnchanged = false
      if (editingEvent) {
        const origStart = new Date(editingEvent.startAt).getTime()
        if (Math.abs(startTimeMs - origStart) < 1000) {
          isTimeUnchanged = true
        }
      }

      if (!isTimeUnchanged && startTimeMs <= Date.now()) {
        nextErrors.startTime = t(
          "activitySchedule.formValidationStartTimeFuture",
          "Thời gian bắt đầu hoạt động phải nằm trong tương lai"
        )
      }
    }

    if (!values.location.trim()) {
      nextErrors.location = t(
        "activitySchedule.formValidationLocation",
        "Vui lòng nhập địa điểm"
      )
    }

    if (!values.description.trim()) {
      nextErrors.description = t(
        "activitySchedule.formValidationDescription",
        "Vui lòng nhập mô tả"
      )
    }

    if (values.remindAt) {
      const remindTime = new Date(values.remindAt).getTime()
      if (remindTime <= Date.now()) {
        nextErrors.remindAt = t(
          "activitySchedule.formValidationRemindAt",
          "Thời gian nhắc phải nằm trong tương lai"
        )
      } else if (values.date && values.startTime) {
        const { startAt } = buildEventDateRange(
          values.date,
          values.startTime,
          values.endTime
        )
        const startTimeMs = new Date(startAt).getTime()
        if (remindTime >= startTimeMs) {
          nextErrors.remindAt = t(
            "activitySchedule.formValidationReminderBeforeStart",
            "Thời gian nhắc nhở phải trước thời gian bắt đầu hoạt động"
          )
        }
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
        courtBookingId: values.courtBookingId,
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
        courtBookingId: values.courtBookingId,
      }
      onCreate(payload)
    }
  }

  const handleSelectBooking = (bookingId: string) => {
    if (bookingId === "none") {
      handleChange("courtBookingId", null)
      return
    }
    const booking = courtBookings.find(
      (b) => b.id === bookingId || b.bookingId === bookingId
    )
    if (booking) {
      setValues((prev) => ({
        ...prev,
        courtBookingId: booking.id || booking.bookingId,
        date: formatBookingDateForInput(booking.date),
        startTime: formatBookingTime(booking.startTime),
        endTime: formatBookingTime(booking.endTime),
        location: booking.centerName || prev.location,
      }))
    }
  }

  return (
    <>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="event-title">
            {t("activitySchedule.formActivityName")}{" "}
            <span className="text-rose-500">*</span>
          </FieldLabel>
          <Input
            id="event-title"
            value={values.title}
            onChange={(event) => handleChange("title", event.target.value)}
            placeholder={t(
              "activitySchedule.formActivityNamePlaceholder",
              "Ví dụ: Tập luyện sáng thứ 7"
            )}
          />
          <FieldError>{errors.title}</FieldError>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>{t("activitySchedule.formActivityType")}</FieldLabel>
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
                <SelectValue
                  placeholder={t(
                    "activitySchedule.formSelectActivityType",
                    "Chọn loại hoạt động"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRACTICE">
                  {t("activityTypes.PRACTICE")}
                </SelectItem>
                <SelectItem value="MEETUP">
                  {t("activityTypes.MEETUP")}
                </SelectItem>
                <SelectItem value="INTERNAL_MATCH">
                  {t("activityTypes.INTERNAL_MATCH")}
                </SelectItem>
                <SelectItem value="MEETING">
                  {t("activityTypes.MEETING")}
                </SelectItem>
                <SelectItem value="OTHER">
                  {t("activityTypes.OTHER")}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>{t("activitySchedule.formLinkBooking")}</FieldLabel>
            <Select
              value={values.courtBookingId || "none"}
              onValueChange={handleSelectBooking}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    "activitySchedule.formLinkBookingPlaceholder",
                    "Chọn lịch đặt sân để liên kết..."
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {filteredCourtBookings.length === 0 ? (
                  <SelectItem
                    value="none"
                    disabled
                    className="text-xs text-muted-foreground"
                  >
                    {values.date
                      ? t(
                          "activitySchedule.formLinkBookingEmptyForDate",
                          "Không có lịch đặt sân nhóm nào trong ngày đã chọn"
                        )
                      : t("activitySchedule.formLinkBookingEmpty")}
                  </SelectItem>
                ) : (
                  <>
                    <SelectItem value="none">
                      {t(
                        "activitySchedule.formLinkBookingNone",
                        "Không liên kết"
                      )}
                    </SelectItem>
                    {filteredCourtBookings.map((b) => (
                      <SelectItem key={b.id} value={b.id} className="text-xs">
                        {b.centerName} - {formatBookingDate(b.date)} (
                        {formatBookingTime(b.startTime)} -{" "}
                        {formatBookingTime(b.endTime)})
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel>
              {t("activitySchedule.formDate", "Ngày")}{" "}
              <span className="text-rose-500">*</span>
            </FieldLabel>
            <Input
              type="date"
              value={values.date}
              onChange={(event) => handleChange("date", event.target.value)}
            />
            <FieldError>{errors.date}</FieldError>
          </Field>
          <Field>
            <FieldLabel>
              {t("activitySchedule.formStartTime")}{" "}
              <span className="text-rose-500">*</span>
            </FieldLabel>
            <Select
              value={values.startTime}
              onValueChange={(val) => handleChange("startTime", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="--:--" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {getTimeOptions(values.startTime).map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors.startTime}</FieldError>
          </Field>
          <Field>
            <FieldLabel>
              {t("activitySchedule.formEndTime")}{" "}
              <span className="text-rose-500">*</span>
            </FieldLabel>
            <Select
              value={values.endTime}
              onValueChange={(val) => handleChange("endTime", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="--:--" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {getTimeOptions(values.endTime).map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors.endTime}</FieldError>
          </Field>
        </div>

        <Field>
          <FieldLabel>
            {t("activitySchedule.formLocation")}{" "}
            <span className="text-rose-500">*</span>
          </FieldLabel>
          <Input
            value={values.location}
            onChange={(event) => handleChange("location", event.target.value)}
            placeholder={t(
              "activitySchedule.formLocationPlaceholder",
              "Ví dụ: Sân Pickleball A"
            )}
          />
          <FieldError>{errors.location}</FieldError>
        </Field>

        <Field>
          <FieldLabel>
            {t("activitySchedule.formDescription")}{" "}
            <span className="text-rose-500">*</span>
          </FieldLabel>
          <Textarea
            rows={4}
            value={values.description}
            onChange={(event) =>
              handleChange("description", event.target.value)
            }
            placeholder={t(
              "activitySchedule.formDescriptionPlaceholder",
              "Mô tả thêm về nội dung hoạt động"
            )}
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
              {t("activitySchedule.formEnableReminder", "Nhắc nhở thành viên")}
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
          {t("activitySchedule.formBtnCancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="orangeCard"
        >
          {isSubmitting
            ? t("activitySchedule.formBtnProcessing", "Đang xử lý...")
            : editingEvent
              ? t("activitySchedule.formBtnSubmitUpdate")
              : t("activitySchedule.formBtnSubmitCreate")}
        </Button>
      </DialogFooter>
    </>
  )
}
