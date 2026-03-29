"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

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
import { Textarea } from "@/components/ui/textarea"
import { createPlaySessionAction } from "@/features/play-sessions/actions/create-play-session"

interface CreatePlaySessionFormProps {
  groupId: string
}

interface FormData {
  title: string
  description?: string
  startTime: string
  endTime: string
  maxSlots?: string
  courtBookingId?: string
}

export function CreatePlaySessionForm({ groupId }: CreatePlaySessionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      maxSlots: "",
      courtBookingId: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const startTime = new Date(data.startTime)
      const endTime = new Date(data.endTime)

      if (startTime >= endTime) {
        setError("Thời gian bắt đầu phải trước thời gian kết thúc")
        setIsLoading(false)
        return
      }

      const createInput = {
        title: data.title,
        description: data.description || undefined,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        maxSlots: data.maxSlots ? parseInt(data.maxSlots, 10) : undefined,
        courtBookingId: data.courtBookingId || undefined,
      }

      const result = await createPlaySessionAction(groupId, createInput)

      if (!result.success) {
        setError(result.error || "Lỗi khi tạo buổi chơi")
        setIsLoading(false)
        return
      }

      router.push(`/groups/${groupId}`)
      router.refresh()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi khi tạo buổi chơi"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Tạo buổi chơi</CardTitle>
        <CardDescription>
          Nhập thông tin chi tiết cho buổi chơi của nhóm
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                    <Input
                      placeholder="Tập luyện cuối tuần"
                      {...field}
                      required
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
                    <Textarea
                      placeholder="Mô tả chi tiết"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian bắt đầu *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} required />
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
                      <Input type="datetime-local" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="maxSlots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng thành viên tối đa</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="16"
                        {...field}
                        min="1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courtBookingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Sân</FormLabel>
                    <FormControl>
                      <Input placeholder="ID của sân đặt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang tạo..." : "Tạo buổi chơi"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
