"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createRecurringSocial } from "../api/recurring-socials-service"
import {
  DAYS_OF_WEEK,
  MOCK_COURTS,
  MONTH_POSITIONS,
  QUARTERS,
  SKILL_LEVELS,
  SOCIAL_TYPES,
} from "../recurring-socials.mock"
import type {
  Court,
  RecurrenceType,
  RecurringSocialFormData,
  SchedulePreview,
} from "../recurring-socials.types"
import { generateSchedulePreview } from "../recurring-socials.utils"
import { ConfirmCreateModal } from "./confirm-create-modal"
import { RecurringSocialsPreview } from "./recurring-socials-preview"

const formSchema = z.object({
  name: z.string().min(3, "Tên social phải từ 3 ký tự trở lên"),
  description: z.string().min(10, "Mô tả phải từ 10 ký tự trở lên"),
  socialType: z.string().min(1, "Vui lòng chọn loại social"),
  skillLevel: z.string().min(1, "Vui lòng chọn trình độ"),
  startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
  endTime: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
  recurrenceType: z.enum(["weekly", "monthly", "quarterly"]),
  daysOfWeek: z.array(z.string()).optional(),
  dayOfMonth: z.number().optional(),
  monthPosition: z.string().optional(),
  quarterStartMonth: z.number().optional(),
  quarterDay: z.number().optional(),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  selectedCourts: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        capacity: z.number(),
      })
    )
    .min(1, "Vui lòng chọn ít nhất 1 sân"),
  maxParticipants: z
    .number()
    .min(4, "Tối thiểu 4 người")
    .max(256, "Tối đa 256 người"),
  maxPerCourt: z
    .number()
    .min(2, "Tối thiểu 2 người/sân")
    .max(20, "Tối đa 20 người/sân"),
  maxWaitlist: z.number().min(0, "Không âm").max(100, "Tối đa 100 người"),
  fee: z.number().min(0, "Không âm"),
  courtRentFee: z.number().min(0, "Không âm"),
  costNote: z.string().optional(),
})

interface RecurringSocialsFormProps {
  onSubmit?: (data: RecurringSocialFormData) => void
}

export function RecurringSocialsForm({ onSubmit }: RecurringSocialsFormProps) {
  const [selectedRecurrence, setSelectedRecurrence] =
    useState<RecurrenceType>("weekly")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [previewData, setPreviewData] = useState<
    (RecurringSocialFormData & { schedulePreview: SchedulePreview[] }) | null
  >(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      socialType: "",
      skillLevel: "",
      startTime: "08:00",
      endTime: "10:00",
      recurrenceType: "weekly",
      daysOfWeek: ["saturday"],
      dayOfMonth: 15,
      quarterStartMonth: 1,
      quarterDay: 15,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      selectedCourts: [MOCK_COURTS[0]],
      maxParticipants: 16,
      maxPerCourt: 8,
      maxWaitlist: 5,
      fee: 150000,
      courtRentFee: 200000,
      costNote: "",
    },
  })

  const handleRecurrenceChange = (value: RecurrenceType) => {
    setSelectedRecurrence(value)
    form.setValue("recurrenceType", value)
  }

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    const schedulePreview = generateSchedulePreview(
      values as RecurringSocialFormData
    )
    setPreviewData({
      ...(values as RecurringSocialFormData),
      schedulePreview,
    })
    setShowConfirmModal(true)
  }

  const handleConfirmCreate = () => {
    const doCreate = async () => {
      try {
        if (!previewData) return
        await createRecurringSocial(previewData)
        if (onSubmit) onSubmit(previewData)
        setShowConfirmModal(false)
        form.reset()
      } catch (err) {
        // basic error handling

        console.error("Create recurring social failed:", err)
        // show simple alert for now
        // In production replace with toast UI

        alert("Tạo social thất bại. Vui lòng thử lại.")
      }
    }

    void doCreate()
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-8"
        >
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Nhập thông tin cơ bản về social tự động
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên social</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Saturday Morning Social"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Mô tả chi tiết về buổi chơi này..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="socialType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại social</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại social" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SOCIAL_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trình độ</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trình độ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SKILL_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Time Section */}
          <Card>
            <CardHeader>
              <CardTitle>Khung giờ chơi</CardTitle>
              <CardDescription>Chọn giờ bắt đầu và kết thúc</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ kết thúc</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recurrence Type Section */}
          <Card>
            <CardHeader>
              <CardTitle>Kiểu lặp</CardTitle>
              <CardDescription>
                Chọn kiểu lặp cho social tự động
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="recurrenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lặp định kỳ</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        handleRecurrenceChange(value as RecurrenceType)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn kiểu lặp" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Hàng tuần</SelectItem>
                        <SelectItem value="monthly">Hàng tháng</SelectItem>
                        <SelectItem value="quarterly">Hàng quý</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weekly Recurrence */}
              {selectedRecurrence === "weekly" && (
                <FormField
                  control={form.control}
                  name="daysOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chọn ngày trong tuần</FormLabel>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {DAYS_OF_WEEK.map((day) => (
                          <FormItem
                            key={day.value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={
                                field.value?.includes(day.value) || false
                              }
                              onCheckedChange={(checked) => {
                                const currentDays = field.value || []
                                if (checked) {
                                  field.onChange([...currentDays, day.value])
                                } else {
                                  field.onChange(
                                    currentDays.filter((d) => d !== day.value)
                                  )
                                }
                              }}
                            />
                            <FormLabel className="cursor-pointer font-normal">
                              {day.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Monthly Recurrence */}
              {selectedRecurrence === "monthly" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dayOfMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chọn ngày trong tháng</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="Ví dụ: 15"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>Nhập số ngày (1-31)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hoặc chọn vị trí trong tháng</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ví dụ: Thứ 7 đầu tiên của tháng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MONTH_POSITIONS.map((pos) => (
                              <SelectItem key={pos.value} value={pos.value}>
                                {pos.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Quarterly Recurrence */}
              {selectedRecurrence === "quarterly" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="quarterStartMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chọn quý</FormLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(e) => field.onChange(parseInt(e))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn quý" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {QUARTERS.map((q) => (
                              <SelectItem key={q.value} value={String(q.value)}>
                                {q.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quarterDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày tổ chức trong quý</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="Ví dụ: 20"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>Nhập số ngày (1-31)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date Range Section */}
          <Card>
            <CardHeader>
              <CardTitle>Khoảng thời gian áp dụng</CardTitle>
              <CardDescription>Chọn ngày bắt đầu và kết thúc</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày kết thúc</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Courts Section */}
          <Card>
            <CardHeader>
              <CardTitle>Chọn sân</CardTitle>
              <CardDescription>Chọn các sân sẽ được sử dụng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="selectedCourts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sân</FormLabel>
                    <div className="space-y-3">
                      {MOCK_COURTS.map((court) => (
                        <FormItem
                          key={court.id}
                          className="flex items-start space-x-3"
                        >
                          <Checkbox
                            checked={
                              field.value?.some(
                                (c: Court) => c.id === court.id
                              ) || false
                            }
                            onCheckedChange={(checked) => {
                              const currentCourts = field.value ?? []
                              if (checked) {
                                field.onChange([...currentCourts, court])
                              } else {
                                field.onChange(
                                  currentCourts.filter(
                                    (c: Court) => c.id !== court.id
                                  )
                                )
                              }
                            }}
                          />
                          <div className="flex-1">
                            <FormLabel className="cursor-pointer font-normal">
                              {court.name}
                            </FormLabel>
                            <FormDescription>
                              Sức chứa: {court.capacity} người
                            </FormDescription>
                          </div>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Court Capacity Summary */}
              {form.watch("selectedCourts").length > 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <CardContent className="pt-4">
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900 dark:text-blue-100">
                        Tổng sân: {form.watch("selectedCourts").length}
                      </p>
                      <p className="text-blue-800 dark:text-blue-200">
                        Sức chứa dự kiến:{" "}
                        {form.watch("selectedCourts").length *
                          form.watch("maxPerCourt")}{" "}
                        người
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Capacity Section */}
          <Card>
            <CardHeader>
              <CardTitle>Giới hạn người tham gia</CardTitle>
              <CardDescription>
                Cấu hình số lượng người cho mỗi buổi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tối đa toàn social</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="4"
                          max="256"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>Tổng cộng tất cả sân</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxPerCourt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tối đa mỗi sân</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2"
                          max="20"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>Người chơi chính</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxWaitlist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dự bị tối đa</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>Danh sách chờ</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cost Section */}
          <Card>
            <CardHeader>
              <CardTitle>Chi phí</CardTitle>
              <CardDescription>
                Cấu hình giá tham gia và chi phí thuê sân
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá tham gia (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Ví dụ: 150000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>Giá cho mỗi người</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="courtRentFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi phí thuê sân (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Ví dụ: 200000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>Tổng chi phí sân/buổi</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="costNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú chi phí</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-15 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Ví dụ: Bao gồm đồ uống nhẹ, quả bóng mới..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Preview Section */}
          {form.watch("selectedCourts").length > 0 && (
            <RecurringSocialsPreview
              formData={form.getValues() as RecurringSocialFormData}
            />
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" size="lg" className="flex-1">
              Tiếp theo: Xác nhận tạo
            </Button>
          </div>
        </form>
      </Form>

      {/* Confirm Modal */}
      {showConfirmModal && previewData && (
        <ConfirmCreateModal
          scheduleCount={previewData.schedulePreview.length}
          schedules={previewData.schedulePreview}
          formData={previewData}
          onConfirm={handleConfirmCreate}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  )
}
