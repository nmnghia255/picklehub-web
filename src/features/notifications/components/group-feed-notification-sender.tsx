"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Bell, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { sendGroupFeedNotificationAction } from "@/features/notifications/actions/notifications"
import { useToast } from "@/hooks/use-toast"

const sendNotificationSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(200),
  message: z.string().min(1, "Nội dung không được để trống").max(1000),
})

type SendNotificationFormValues = z.infer<typeof sendNotificationSchema>

interface GroupFeedNotificationSenderProps {
  groupId: string
  groupName: string
  canSend?: boolean
}

export function GroupFeedNotificationSender({
  groupId,
  groupName,
  canSend = true,
}: GroupFeedNotificationSenderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<SendNotificationFormValues>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  })

  const onSubmit = async (data: SendNotificationFormValues) => {
    if (!canSend) {
      toast({
        title: "Không có quyền",
        description:
          "Chỉ quản trị viên và trưởng nhóm mới có thể gửi thông báo.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await sendGroupFeedNotificationAction({
        groupId,
        title: data.title,
        message: data.message,
      })

      toast({
        title: "Thành công",
        description: "Thông báo đã được gửi đến tất cả thành viên nhóm.",
      })

      form.reset()
      setIsOpen(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể gửi thông báo"

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })

      console.error("Error sending notification:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!canSend) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="size-4" />
          Gửi thông báo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gửi thông báo cho nhóm</DialogTitle>
          <DialogDescription>
            Gửi thông báo feed tới tất cả thành viên của nhóm{" "}
            <span className="font-semibold">{groupName}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tiêu đề thông báo..."
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Tối đa 200 ký tự</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập nội dung thông báo..."
                      disabled={isLoading}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Tối đa 1000 ký tự</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Gửi thông báo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
