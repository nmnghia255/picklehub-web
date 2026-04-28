"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createPlaySessionAction } from "@/features/play-sessions/actions/create-play-session"

interface CreatePlaySessionFormProps {
  groupId?: string
  showCard?: boolean
  onCancel?: () => void
  onSuccess?: () => void
}

interface FormData {
  title: string
  location: string
  note?: string
  startTime: string
  durationMinutes: string
  maxSlots?: string
  feeType?: string
  feeAmount?: string
  feeMode?: string
  autoApproveJoinRequests: boolean
  submitDupr: boolean
  minimumLevel?: string
  maximumLevel?: string
}

const DURATION_OPTIONS = [
  { value: "60", label: "1 giờ" },
  { value: "90", label: "1,5 giờ" },
  { value: "120", label: "2 giờ" },
  { value: "150", label: "2,5 giờ" },
  { value: "180", label: "3 giờ" },
  { value: "210", label: "3,5 giờ" },
  { value: "240", label: "4 giờ" },
  { value: "270", label: "4,5 giờ" },
  { value: "300", label: "5 giờ" },
  { value: "330", label: "5,5 giờ" },
  { value: "360", label: "6 giờ" },
  { value: "390", label: "6,5 giờ" },
  { value: "420", label: "7 giờ" },
  { value: "450", label: "7,5 giờ" },
  { value: "480", label: "8 giờ" },
  { value: "1440", label: "1 ngày" },
  { value: "2880", label: "2 ngày" },
  { value: "4320", label: "3 ngày" },
]

const FEE_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "FREE", label: "Free" },
  { value: "AUTO_SPLIT_TOTAL", label: "AUTO_SPLIT_TOTAL" },
  { value: "PER_PERSON", label: "PER_PERSON" },
]

export function CreatePlaySessionForm({
  groupId,
  showCard = true,
  onCancel,
  onSuccess,
}: CreatePlaySessionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      note: "",
      startTime: "",
      durationMinutes: "60",
      location: "",
      maxSlots: "12",
      feeMode: "NONE",
      feeAmount: "",
      autoApproveJoinRequests: false,
      submitDupr: false,
      minimumLevel: "",
      maximumLevel: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const startTime = new Date(data.startTime)
      const currentTime = new Date()
      const durationMinutes = Number.parseInt(data.durationMinutes, 10)
      const location = data.location

      if (
        Number.isNaN(startTime.getTime()) ||
        startTime.getTime() <= currentTime.getTime()
      ) {
        setError("Vui lòng chọn thời gian bắt đầu hợp lệ")
        form.setError("startTime", { type: "manual" })
        setIsLoading(false)
        return
      }

      if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
        setError("Vui lòng chọn thời lượng buổi chơi hợp lệ")
        form.setError("durationMinutes", { type: "manual" })
        setIsLoading(false)
        return
      }

      const endTime = new Date(
        startTime.getTime() + durationMinutes * 60 * 1000
      )

      const feeModeValue = data.feeMode ?? "NONE"
      const feeAmountValue =
        data.feeAmount && data.feeAmount !== ""
          ? parseInt(data.feeAmount, 10)
          : undefined
      const minimumLevelValue =
        data.minimumLevel && data.minimumLevel !== ""
          ? Number(parseFloat(data.minimumLevel).toFixed(2))
          : undefined
      const maximumLevelValue =
        data.maximumLevel && data.maximumLevel !== ""
          ? Number(parseFloat(data.maximumLevel).toFixed(2))
          : undefined

      if (
        (feeModeValue === "AUTO_SPLIT_TOTAL" ||
          feeModeValue === "PER_PERSON") &&
        (!feeAmountValue || Number.isNaN(feeAmountValue) || feeAmountValue <= 0)
      ) {
        setError("Vui lòng nhập số tiền hợp lệ")
        form.setError("feeAmount", { type: "manual" })
        setIsLoading(false)
        return
      }

      if (
        minimumLevelValue !== undefined &&
        maximumLevelValue !== undefined &&
        minimumLevelValue > maximumLevelValue
      ) {
        setError("Trình độ tối thiểu phải nhỏ hơn hoặc bằng trình độ tối đa")
        form.setError("maximumLevel", { type: "manual" })
        form.setError("minimumLevel", { type: "manual" })
        setIsLoading(false)
        return
      }

      // Map frontend feeMode/feeAmount to backend fields (feeMode / totalFee / feePerPerson / fee)
      const feeMode =
        feeModeValue && feeModeValue !== "NONE" ? feeModeValue : undefined
      const totalFee =
        feeMode === "AUTO_SPLIT_TOTAL" ? feeAmountValue : undefined
      const feePerPerson = feeMode === "PER_PERSON" ? feeAmountValue : undefined
      const fee = feeMode === "FREE" ? 0 : undefined

      const createInput = {
        title: data.title,
        note: data.note || undefined,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: location,
        maxSlots: data.maxSlots ? parseInt(data.maxSlots, 10) : undefined,
        feeMode: feeMode,
        totalFee: totalFee,
        feePerPerson: feePerPerson,
        fee: fee,
        autoApproveJoinRequests: data.autoApproveJoinRequests,
        submitDupr: data.submitDupr,
        minimumLevel: minimumLevelValue,
        maximumLevel: maximumLevelValue,
      }

      const result = await createPlaySessionAction(groupId ?? null, createInput)

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

      router.replace(groupId ? `/groups/${groupId}` : "/play-sessions")
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
            Nhập thông tin chi tiết cho buổi chơi của nhóm
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
            {/* Title */}
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
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa điểm *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1 Đ. Số 38, An Khánh, Hồ Chí Minh"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Start Time & Duration */}
            <div className="grid grid-cols-2 gap-6">
              {/* Start Time */}
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

              {/* Duration */}
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời lượng buổi chơi *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn thời lượng" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          side="bottom"
                          align="start"
                          sideOffset={4}
                        >
                          {DURATION_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* MaxSlots */}
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
                        placeholder="12"
                        {...field}
                        min="2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Fee */}{" "}
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="feeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí tham gia</FormLabel>
                    <FormControl>
                      <div className="flex w-full items-center gap-3">
                        <div className="w-1/2">
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn loại phí" />
                            </SelectTrigger>
                            <SelectContent
                              position="popper"
                              side="bottom"
                              align="start"
                              sideOffset={4}
                            >
                              {FEE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {" "}
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-1/2">
                          <FormField
                            control={form.control}
                            name="feeAmount"
                            render={({ field: amountField }) => {
                              const show =
                                field.value === "AUTO_SPLIT_TOTAL" ||
                                field.value === "PER_PERSON"
                              return (
                                <div>
                                  {show && (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        className="w-full"
                                        type="number"
                                        placeholder="Số tiền"
                                        {...amountField}
                                        min="0"
                                      />
                                      <span className="text-sm">đ</span>
                                    </div>
                                  )}
                                </div>
                              )
                            }}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />{" "}
            </div>
            {/* Toggle auto approve join request */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="autoApproveJoinRequests"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border px-3 py-2">
                    <FormLabel className="mb-0">
                      Tự động duyệt yêu cầu tham gia
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Submit DUPR */}
              <FormField
                control={form.control}
                name="submitDupr"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border px-3 py-2">
                    <FormLabel className="mb-0">Gửi DUPR</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {/* Minimum Level */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="minimumLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trình độ tối thiểu</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        max="99.99"
                        placeholder="Ví dụ: 3.50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Maximum Level */}
              <FormField
                control={form.control}
                name="maximumLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trình độ tối đa</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        max="99.99"
                        placeholder="Ví dụ: 5.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú chi tiết cho buổi chơi"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Cancel & Create Buttons*/}
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
