"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { TFunction } from "i18next"
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
import { useRecurringSocialsTranslation } from "@/i18n/use-recurring-socials-translation"

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

interface RecurringSocialsFormProps {
  onSubmit?: (data: RecurringSocialFormData) => void
}

function createFormSchema(t: TFunction) {
  return z.object({
    name: z.string().min(3, t("recurringSocials.form.validation.nameMin")),
    description: z
      .string()
      .min(10, t("recurringSocials.form.validation.descriptionMin")),
    socialType: z
      .string()
      .min(1, t("recurringSocials.form.validation.selectSocialType")),
    skillLevel: z
      .string()
      .min(1, t("recurringSocials.form.validation.selectSkillLevel")),
    startTime: z
      .string()
      .min(1, t("recurringSocials.form.validation.selectStartTime")),
    endTime: z
      .string()
      .min(1, t("recurringSocials.form.validation.selectEndTime")),
    recurrenceType: z.enum(["weekly", "monthly", "quarterly"]),
    daysOfWeek: z.array(z.string()).optional(),
    dayOfMonth: z.number().optional(),
    monthPosition: z.string().optional(),
    quarterStartMonth: z.number().optional(),
    quarterDay: z.number().optional(),
    startDate: z
      .string()
      .min(1, t("recurringSocials.form.validation.selectStartDate")),
    endDate: z
      .string()
      .min(1, t("recurringSocials.form.validation.selectEndDate")),
    selectedCourts: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          labelKey: z.string().optional(),
          capacity: z.number(),
        })
      )
      .min(1, t("recurringSocials.form.validation.selectCourt")),
    maxParticipants: z
      .number()
      .min(4, t("recurringSocials.form.validation.minParticipants"))
      .max(256, t("recurringSocials.form.validation.maxParticipants")),
    maxPerCourt: z
      .number()
      .min(2, t("recurringSocials.form.validation.minPerCourt"))
      .max(20, t("recurringSocials.form.validation.maxPerCourt")),
    maxWaitlist: z
      .number()
      .min(0, t("recurringSocials.form.validation.nonNegative"))
      .max(100, t("recurringSocials.form.validation.maxWaitlist")),
    fee: z.number().min(0, t("recurringSocials.form.validation.nonNegative")),
    courtRentFee: z
      .number()
      .min(0, t("recurringSocials.form.validation.nonNegative")),
    costNote: z.string().optional(),
  })
}

function mapLabel<T extends { value: string | number; labelKey: string }>(
  items: T[],
  t: TFunction
) {
  return items.map((item) => ({ ...item, label: t(item.labelKey) }))
}

function getCourtDisplayName(court: Court, t: TFunction) {
  return court.labelKey ? t(court.labelKey) : court.name
}

export function RecurringSocialsForm({ onSubmit }: RecurringSocialsFormProps) {
  const { t, i18n } = useRecurringSocialsTranslation()
  const [selectedRecurrence, setSelectedRecurrence] =
    useState<RecurrenceType>("weekly")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [previewData, setPreviewData] = useState<
    (RecurringSocialFormData & { schedulePreview: SchedulePreview[] }) | null
  >(null)

  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US"
  const formSchema = React.useMemo(() => createFormSchema(t), [t])

  const socialTypeOptions = mapLabel(SOCIAL_TYPES, t)
  const skillLevelOptions = mapLabel(SKILL_LEVELS, t)
  const dayOptions = mapLabel(DAYS_OF_WEEK, t)
  const monthPositionOptions = mapLabel(MONTH_POSITIONS, t)
  const quarterOptions = mapLabel(QUARTERS, t)

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
      values as RecurringSocialFormData,
      locale
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
        if (onSubmit) onSubmit(previewData)
        setShowConfirmModal(false)
        form.reset()
      } catch (err) {
        console.error("Create recurring social failed:", err)
        alert(t("recurringSocials.toast.createFailed"))
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
          <Card>
            <CardHeader>
              <CardTitle>{t("recurringSocials.form.basicInfoTitle")}</CardTitle>
              <CardDescription>
                {t("recurringSocials.form.basicInfoDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("recurringSocials.form.nameLabel")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("recurringSocials.form.namePlaceholder")}
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
                    <FormLabel>
                      {t("recurringSocials.form.descriptionLabel")}
                    </FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={t(
                          "recurringSocials.form.descriptionPlaceholder"
                        )}
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
                      <FormLabel>
                        {t("recurringSocials.form.socialTypeLabel")}
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "recurringSocials.form.socialTypePlaceholder"
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {socialTypeOptions.map((type) => (
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
                      <FormLabel>
                        {t("recurringSocials.form.skillLevelLabel")}
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "recurringSocials.form.skillLevelPlaceholder"
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {skillLevelOptions.map((level) => (
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

          <Card>
            <CardHeader>
              <CardTitle>{t("recurringSocials.form.timeTitle")}</CardTitle>
              <CardDescription>
                {t("recurringSocials.form.timeDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("recurringSocials.form.startTimeLabel")}
                      </FormLabel>
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
                      <FormLabel>
                        {t("recurringSocials.form.endTimeLabel")}
                      </FormLabel>
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

          <Card>
            <CardHeader>
              <CardTitle>
                {t("recurringSocials.form.recurrenceTitle")}
              </CardTitle>
              <CardDescription>
                {t("recurringSocials.form.recurrenceDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="recurrenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("recurringSocials.form.recurrenceLabel")}
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        handleRecurrenceChange(value as RecurrenceType)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "recurringSocials.form.recurrencePlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">
                          {t("recurringSocials.form.recurrenceTypes.weekly")}
                        </SelectItem>
                        <SelectItem value="monthly">
                          {t("recurringSocials.form.recurrenceTypes.monthly")}
                        </SelectItem>
                        <SelectItem value="quarterly">
                          {t("recurringSocials.form.recurrenceTypes.quarterly")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRecurrence === "weekly" && (
                <FormField
                  control={form.control}
                  name="daysOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("recurringSocials.form.weekdaysLabel")}
                      </FormLabel>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {dayOptions.map((day) => (
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

              {selectedRecurrence === "monthly" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dayOfMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("recurringSocials.form.monthDayLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            placeholder={t(
                              "recurringSocials.form.monthDayPlaceholder"
                            )}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t("recurringSocials.form.monthDayDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("recurringSocials.form.monthPositionLabel")}
                        </FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  "recurringSocials.form.monthPositionPlaceholder"
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {monthPositionOptions.map((pos) => (
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

              {selectedRecurrence === "quarterly" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="quarterStartMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("recurringSocials.form.quarterLabel")}
                        </FormLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  "recurringSocials.form.quarterPlaceholder"
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {quarterOptions.map((quarter) => (
                              <SelectItem
                                key={quarter.value}
                                value={String(quarter.value)}
                              >
                                {quarter.label}
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
                        <FormLabel>
                          {t("recurringSocials.form.quarterDayLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            placeholder={t(
                              "recurringSocials.form.quarterDayPlaceholder"
                            )}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t("recurringSocials.form.quarterDayDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("recurringSocials.form.dateRangeTitle")}</CardTitle>
              <CardDescription>
                {t("recurringSocials.form.dateRangeDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("recurringSocials.form.startDateLabel")}
                      </FormLabel>
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
                      <FormLabel>
                        {t("recurringSocials.form.endDateLabel")}
                      </FormLabel>
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

          <Card>
            <CardHeader>
              <CardTitle>{t("recurringSocials.form.courtsTitle")}</CardTitle>
              <CardDescription>
                {t("recurringSocials.form.courtsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="selectedCourts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("recurringSocials.form.courtLabel")}
                    </FormLabel>
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
                              {getCourtDisplayName(court, t)}
                            </FormLabel>
                            <FormDescription>
                              {t("recurringSocials.form.courtCapacity", {
                                count: court.capacity,
                              })}
                            </FormDescription>
                          </div>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("selectedCourts").length > 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <CardContent className="pt-4">
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900 dark:text-blue-100">
                        {t("recurringSocials.form.courtSummaryTotal", {
                          count: form.watch("selectedCourts").length,
                        })}
                      </p>
                      <p className="text-blue-800 dark:text-blue-200">
                        {t("recurringSocials.form.courtSummaryCapacity", {
                          count:
                            form.watch("selectedCourts").length *
                            form.watch("maxPerCourt"),
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("recurringSocials.form.capacityTitle")}</CardTitle>
              <CardDescription>
                {t("recurringSocials.form.capacityDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("recurringSocials.form.maxParticipantsLabel")}
                      </FormLabel>
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
                      <FormDescription>
                        {t("recurringSocials.form.maxParticipantsDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxPerCourt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("recurringSocials.form.maxPerCourtLabel")}
                      </FormLabel>
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
                      <FormDescription>
                        {t("recurringSocials.form.maxPerCourtDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxWaitlist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("recurringSocials.form.maxWaitlistLabel")}
                      </FormLabel>
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
                      <FormDescription>
                        {t("recurringSocials.form.maxWaitlistDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("recurringSocials.form.costTitle")}</CardTitle>
              <CardDescription>
                {t("recurringSocials.form.costDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("recurringSocials.form.feeLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder={t(
                            "recurringSocials.form.feePlaceholder"
                          )}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {t("recurringSocials.form.feeDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="courtRentFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("recurringSocials.form.courtRentFeeLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder={t(
                            "recurringSocials.form.courtRentFeePlaceholder"
                          )}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {t("recurringSocials.form.courtRentFeeDescription")}
                      </FormDescription>
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
                    <FormLabel>
                      {t("recurringSocials.form.costNoteLabel")}
                    </FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-15 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={t(
                          "recurringSocials.form.costNotePlaceholder"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {form.watch("selectedCourts").length > 0 && (
            <RecurringSocialsPreview
              formData={form.getValues() as RecurringSocialFormData}
              locale={locale}
            />
          )}

          <div className="flex gap-4">
            <Button type="submit" size="lg" className="flex-1">
              {t("recurringSocials.form.submitButton")}
            </Button>
          </div>
        </form>
      </Form>

      {showConfirmModal && previewData && (
        <ConfirmCreateModal
          scheduleCount={previewData.schedulePreview.length}
          schedules={previewData.schedulePreview}
          formData={previewData}
          locale={locale}
          onConfirm={handleConfirmCreate}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  )
}
