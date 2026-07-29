"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import type { TFunction } from "i18next"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multi-select"
import {
  createSocialPlaySessionAction,
  updateSocialPlaySessionAction,
} from "@/features/socials/actions/play-session"
import type {
  PlaySession,
  PlaySessionRequest,
} from "@/features/socials/types/play-session"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface PlaySessionFormProps {
  socialId: string
  session?: PlaySession | null
  socialStartTime?: string
  socialEndTime?: string
  showCard?: boolean
  onCancel?: () => void
  onSuccess?: () => void
}

const getFormSchema = (t: TFunction) =>
  z.object({
    title: z.string().min(1, t("sessionForm.validation.titleRequired")),
    startTime: z
      .string()
      .min(
        1,
        t("sessionForm.validation.startTimeRequired", "Start time is required")
      ),
    endTime: z
      .string()
      .min(
        1,
        t("sessionForm.validation.endTimeRequired", "End time is required")
      ),
    sessionFee: z.coerce
      .number()
      .min(0, t("sessionForm.validation.feeInvalid")),
    maxSlot: z.coerce
      .number()
      .min(1, t("sessionForm.validation.maxSlotInvalid")),
  })

type FormData = {
  title: string
  startTime: string
  endTime: string
  sessionFee: number
  maxSlot: number
}

export function PlaySessionForm({
  socialId,
  session,
  socialStartTime,
  socialEndTime,
  showCard = true,
  onCancel,
  onSuccess,
}: PlaySessionFormProps) {
  const { t, i18n } = useSocialsTranslation()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formSchema = getFormSchema(t)

  const initialStart = session?.startTime
    ? format(new Date(session.startTime), "HH:mm")
    : socialStartTime
      ? format(new Date(socialStartTime), "HH:mm")
      : ""

  const initialEnd = session?.endTime
    ? format(new Date(session.endTime), "HH:mm")
    : socialEndTime
      ? format(new Date(socialEndTime), "HH:mm")
      : ""

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: session?.title || "",
      startTime: initialStart,
      endTime: initialEnd,
      sessionFee: session?.sessionFee || 0,
      maxSlot: session?.maxSlot || 10,
    },
  })

  useEffect(() => {
    if (session) {
      form.reset({
        title: session.title,
        startTime: session.startTime
          ? format(new Date(session.startTime), "HH:mm")
          : "",
        endTime: session.endTime
          ? format(new Date(session.endTime), "HH:mm")
          : "",
        sessionFee: session.sessionFee || 0,
        maxSlot: session.maxSlot || 10,
      })
    } else {
      form.reset({
        title: "",
        startTime: socialStartTime
          ? format(new Date(socialStartTime), "HH:mm")
          : "",
        endTime: socialEndTime ? format(new Date(socialEndTime), "HH:mm") : "",
        sessionFee: 0,
        maxSlot: 10,
      })
    }
  }, [session, socialStartTime, socialEndTime, form])

  // Debug logging for form validation errors
  const errors = form.formState.errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("PlaySessionForm validation errors:", errors)
    }
  }, [errors])

  const isEditing = !!session
  const formTitle = isEditing
    ? t("sessionForm.editTitle")
    : t("sessionForm.createTitle")
  const buttonText = isEditing ? t("form.update") : t("sessionForm.createTitle")

  const getIsoStringForTime = (timeStr: string) => {
    if (timeStr.includes("T")) {
      return new Date(timeStr).toISOString()
    }
    const baseDate = session?.startTime
      ? new Date(session.startTime)
      : socialStartTime
        ? new Date(socialStartTime)
        : new Date()
    const datePart = format(baseDate, "yyyy-MM-dd")
    return new Date(`${datePart}T${timeStr}:00`).toISOString()
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const createInput: PlaySessionRequest = {
        title: data.title,
        startTime: getIsoStringForTime(data.startTime),
        endTime: getIsoStringForTime(data.endTime),
        sessionFee: data.sessionFee,
        maxSlot: data.maxSlot,
      }

      if (isEditing && session) {
        const updatePayload: Partial<PlaySessionRequest> = {}

        if (data.title !== session.title) {
          updatePayload.title = data.title
        }

        const newStartIso = getIsoStringForTime(data.startTime)
        if (
          !session.startTime ||
          newStartIso !== new Date(session.startTime).toISOString()
        ) {
          updatePayload.startTime = newStartIso
        }

        const newEndIso = getIsoStringForTime(data.endTime)
        if (
          !session.endTime ||
          newEndIso !== new Date(session.endTime).toISOString()
        ) {
          updatePayload.endTime = newEndIso
        }

        if (data.sessionFee !== session.sessionFee) {
          updatePayload.sessionFee = data.sessionFee
        }

        if (data.maxSlot !== session.maxSlot) {
          updatePayload.maxSlot = data.maxSlot
        }

        if (Object.keys(updatePayload).length > 0) {
          const result = await updateSocialPlaySessionAction(
            socialId,
            session.id,
            updatePayload
          )

          if (!result.success) {
            setError(result.error || t("sessionForm.errors.update"))
            setIsLoading(false)
            return
          }
        }

        toast.success(t("sessionForm.success.update"))
        if (onSuccess) {
          onSuccess()
          router.refresh()
        }
        return
      }

      const result = await createSocialPlaySessionAction(socialId, createInput)

      if (!result.success) {
        setError(result.error || t("sessionForm.errors.create"))
        setIsLoading(false)
        return
      }

      toast.success(t("sessionForm.success.create"))
      if (onSuccess) {
        onSuccess()
        router.refresh()
        return
      }

      router.replace(`/socials/${socialId}`)
      return
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("sessionForm.errors.create")
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const formContent = (
    <>
      {showCard ? (
        <CardHeader>
          <CardTitle>{formTitle}</CardTitle>
          <CardDescription>{t("sessionForm.subtitle")}</CardDescription>
        </CardHeader>
      ) : (
        <DialogHeader className="mb-4">
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription>{t("sessionForm.subtitle")}</DialogDescription>
        </DialogHeader>
      )}
      <CardContent className={showCard ? undefined : "p-0"}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errs) => {
              console.error(
                "PlaySessionForm validation errors on submit:",
                errs
              )
            })}
            className="space-y-6"
          >
            {(error || Object.keys(errors).length > 0) && (
              <Alert variant="destructive">
                <AlertDescription>
                  <p className="font-semibold">
                    {error || t("common.validationError")}
                  </p>
                  <ul className="mt-1 list-inside list-disc text-xs">
                    {Object.keys(errors).map((key) => {
                      const err = errors[key as keyof typeof errors]
                      return err ? (
                        <li key={key}>
                          {key}: {err.message}
                        </li>
                      ) : null
                    })}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("sessionForm.titleLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("sessionForm.titlePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("sessionForm.startTimeLabel", "Bắt đầu")}
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
                      {t("sessionForm.endTimeLabel", "Kết thúc")}
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sessionFee"
                render={({ field }) => {
                  const displayValue = field.value
                    ? new Intl.NumberFormat("vi-VN").format(field.value)
                    : ""
                  return (
                    <FormItem>
                      <FormLabel>{t("sessionForm.feeLabel")}</FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <Input
                            type="text"
                            placeholder={t("sessionForm.feePlaceholder")}
                            value={displayValue}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/\D/g, "")
                              field.onChange(rawValue ? Number(rawValue) : 0)
                            }}
                            className="pr-12"
                          />
                          <span className="pointer-events-none absolute right-3 text-sm font-medium text-muted-foreground">
                            {t("common.currency")}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name="maxSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("sessionForm.maxSlotLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("sessionForm.maxSlotPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  if (onCancel) {
                    onCancel()
                    return
                  }
                  router.back()
                }}
                disabled={isLoading}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading ? t("sessionForm.errors.processing") : buttonText}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </>
  )

  if (!showCard) {
    return <div className="w-full">{formContent}</div>
  }

  return <Card className="w-full max-w-2xl">{formContent}</Card>
}
