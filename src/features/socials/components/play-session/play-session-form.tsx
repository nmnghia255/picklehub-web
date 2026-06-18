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
import { createSocialPlaySessionAction } from "@/features/socials/actions/play-session"
import type {
  PlaySession,
  PlaySessionRequest,
} from "@/features/socials/types/play-session"
import { getMyBookingsAction } from "@/features/sport-center/actions/get-my-bookings"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface PlaySessionFormProps {
  socialId: string
  session?: PlaySession | null
  showCard?: boolean
  onCancel?: () => void
  onSuccess?: () => void
}

const getFormSchema = (t: TFunction) =>
  z.object({
    title: z.string().min(1, t("sessionForm.validation.titleRequired")),
    bookingIds: z
      .array(z.string())
      .min(1, t("sessionForm.validation.bookingRequired")),
    pricePerPlayer: z.coerce
      .number()
      .min(0, t("sessionForm.validation.priceInvalid")),
    sessionFee: z.coerce
      .number()
      .min(0, t("sessionForm.validation.feeInvalid")),
  })

type FormData = {
  title: string
  bookingIds: string[]
  pricePerPlayer: number
  sessionFee: number
}

export function PlaySessionForm({
  socialId,
  session,
  showCard = true,
  onCancel,
  onSuccess,
}: PlaySessionFormProps) {
  const { t, i18n } = useSocialsTranslation()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: bookingsResponse } = useQuery({
    queryKey: ["my-bookings", "CONFIRMED"],
    queryFn: () =>
      getMyBookingsAction({
        status: "CONFIRMED",
        startDate: format(new Date(), "yyyy-MM-dd"),
        limit: 200,
        offset: 0,
      }),
  })
  const bookings = bookingsResponse?.data || []

  const availableBookings = bookings.filter((b) => b.playSessionId === null)

  const bookingOptions = availableBookings.map((b) => {
    const items = b.bookingItems?.length ? b.bookingItems : b.items || []
    const timeString = items
      .map((i) => `${i.startTime}-${i.endTime}`)
      .join(", ")
    return {
      value: b.id,
      label: `${b.center?.name || t("sessionForm.defaultCourt")} - ${new Date(b.date).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US")}`,
      description: t("sessionForm.timeLabel", { time: timeString || "—" }),
    }
  })

  const formSchema = getFormSchema(t)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: session?.title || "",
      bookingIds: session?.bookingIds || [],
      pricePerPlayer: session?.pricePerPlayer || 0,
      sessionFee: session?.sessionFee || 0,
    },
  })

  useEffect(() => {
    if (session) {
      form.reset({
        title: session.title,
        bookingIds: session.bookingIds,
        pricePerPlayer: session.pricePerPlayer,
        sessionFee: session.sessionFee,
      })
    } else {
      form.reset({
        title: "",
        bookingIds: [],
        pricePerPlayer: 0,
        sessionFee: 0,
      })
    }
  }, [session, form])

  const isEditing = !!session
  const formTitle = isEditing
    ? t("sessionForm.editTitle")
    : t("sessionForm.createTitle")
  const buttonText = isEditing ? t("form.update") : t("sessionForm.createTitle")

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const createInput: PlaySessionRequest = {
        title: data.title,
        bookingIds: data.bookingIds,
        pricePerPlayer: data.pricePerPlayer,
        sessionFee: data.sessionFee,
      }

      if (isEditing) {
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
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

            <FormField
              control={form.control}
              name="bookingIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("sessionForm.bookingLabel")}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={bookingOptions}
                      selected={field.value}
                      onSelectionChange={field.onChange}
                      placeholder={t("sessionForm.bookingPlaceholder")}
                      emptyMessage={t("sessionForm.noBookingsAvailable")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="gap-6">
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
                            placeholder="0"
                            value={displayValue}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/\D/g, "")
                              field.onChange(rawValue ? Number(rawValue) : 0)
                            }}
                            className="pr-12"
                          />
                          <span className="pointer-events-none absolute right-3 text-sm font-medium text-muted-foreground">
                            VND
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
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
