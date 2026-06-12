"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
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

interface PlaySessionFormProps {
  socialId: string
  session?: PlaySession | null
  showCard?: boolean
  onCancel?: () => void
  onSuccess?: () => void
}

const formSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tên buổi chơi"),
  bookingIds: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 mã đặt sân"),
  pricePerPlayer: z.coerce.number().min(0, "Giá mỗi người chơi không hợp lệ"),
  sessionFee: z.coerce.number().min(0, "Phí buổi chơi không hợp lệ"),
})

type FormData = z.infer<typeof formSchema>

export function PlaySessionForm({
  socialId,
  session,
  showCard = true,
  onCancel,
  onSuccess,
}: PlaySessionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: bookingsResponse } = useQuery({
    queryKey: ["my-bookings", "CONFIRMED"],
    queryFn: () =>
      getMyBookingsAction({ status: "CONFIRMED", limit: 20, offset: 0 }),
  })
  const bookings = bookingsResponse?.data || []

  const availableBookings = bookings.filter((b) => b.playSessionId === null)

  const bookingOptions = availableBookings.map((b) => ({
    value: b.id,
    label: `${b.center?.name || "Sân"} - ${new Date(b.date).toLocaleDateString("vi-VN")}`,
    description: `Giờ: ${b.items?.map((i) => `${i.startTime}-${i.endTime}`).join(", ")}`,
  }))

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
  const formTitle = isEditing ? "Cập nhật buổi chơi" : "Tạo buổi chơi"
  const buttonText = isEditing ? "Cập nhật" : "Tạo buổi chơi"

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
        toast.success("Cập nhật buổi chơi thành công")
        if (onSuccess) {
          onSuccess()
          router.refresh()
        }
        return
      }

      const result = await createSocialPlaySessionAction(socialId, createInput)

      if (!result.success) {
        setError(result.error || "Lỗi khi tạo buổi chơi")
        setIsLoading(false)
        return
      }

      toast.success("Tạo buổi chơi thành công")
      if (onSuccess) {
        onSuccess()
        router.refresh()
        return
      }

      router.replace(`/socials/${socialId}`)
      return
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi khi tạo buổi chơi"
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
          <CardDescription>
            Nhập thông tin chi tiết cho phiên chơi
          </CardDescription>
        </CardHeader>
      ) : (
        <DialogHeader className="mb-4">
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription>
            Nhập thông tin chi tiết cho phiên chơi
          </DialogDescription>
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
                  <FormLabel>Tên buổi chơi *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên buổi chơi" {...field} />
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
                  <FormLabel>Mã đặt sân *</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={bookingOptions}
                      selected={field.value}
                      onSelectionChange={field.onChange}
                      placeholder="Chọn mã đặt sân"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="gap-6">
              {/* <FormField
                control={form.control}
                name="pricePerPlayer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí mỗi người chơi *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="sessionFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí buổi chơi *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading ? "Đang xử lý..." : buttonText}
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
