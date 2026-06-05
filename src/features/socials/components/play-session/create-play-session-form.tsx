"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createSocialPlaySessionAction } from "@/features/socials/actions/create-play-session"
import type { PlaySessionRequest } from "@/features/socials/types/play-session"

interface CreatePlaySessionFormProps {
  socialId: string
  showCard?: boolean
  onCancel?: () => void
  onSuccess?: () => void
}

const formSchema = z
  .object({
    title: z.string().min(1, "Vui lòng nhập tên buổi chơi"),
    bookingIds: z.string().min(1, "Vui lòng nhập mã đặt sân"),
    startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
    endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime)
      const end = new Date(data.endTime)
      return end > start
    },
    {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      path: ["endTime"],
    }
  )

type FormData = z.infer<typeof formSchema>

export function CreatePlaySessionForm({
  socialId,
  showCard = true,
  onCancel,
  onSuccess,
}: CreatePlaySessionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      bookingIds: "",
      startTime: "",
      endTime: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const createInput: PlaySessionRequest = {
        title: data.title,
        bookingIds: data.bookingIds,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
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
      {showCard && (
        <CardHeader>
          <CardTitle>Tạo buổi chơi</CardTitle>
          <CardDescription>
            Nhập thông tin chi tiết cho buổi chơi mới
          </CardDescription>
        </CardHeader>
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
                    <Input placeholder="Nhập mã đặt sân" {...field} />
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
                    <FormLabel>Thời gian bắt đầu *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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
                    <FormLabel>Thời gian kết thúc *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-4">
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
                {isLoading ? "Đang tạo..." : "Tạo buổi chơi"}
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
