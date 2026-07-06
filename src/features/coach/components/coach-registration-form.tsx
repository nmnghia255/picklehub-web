"use client"

import { Edit3, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  useCoachProfile,
  usePublishMyProfile,
  useRegisterAsCoach,
} from "@/features/coach/hooks/use-coach-queries"
import { getErrorMessage } from "@/lib/api-client"

const levelOptions = [
  { value: "Beginner", label: "Cơ bản" },
  { value: "Intermediate", label: "Trung cấp" },
  { value: "Advanced", label: "Nâng cao" },
  { value: "Pro", label: "Chuyên nghiệp" },
]

const specialtyOptions = [
  { value: "Beginner Coaching", label: "Dạy người mới" },
  { value: "Advanced Strategy", label: "Dạy nâng cao" },
  { value: "Kids Coaching", label: "Dạy trẻ em" },
  { value: "Tournament Coaching", label: "Huấn luyện thi đấu" },
]

const languageOptions = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "Tiếng Anh" },
  { value: "zh", label: "Tiếng Trung" },
  { value: "ko", label: "Tiếng Hàn" },
  { value: "ja", label: "Tiếng Nhật" },
]

export function CoachRegistrationForm() {
  const { t } = useTranslation("common")
  const router = useRouter()

  const {
    profile: existingProfile,
    isLoading: checkingProfile,
    isError: profileError,
  } = useCoachProfile({ enabled: true })
  const registerCoach = useRegisterAsCoach()
  const publishProfile = usePublishMyProfile()

  const [step, setStep] = useState<"form" | "success">("form")

  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [level, setLevel] = useState("")
  const [yearsExperience, setYearsExperience] = useState("0")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [locationCity, setLocationCity] = useState("")
  const [hourlyRateVnd, setHourlyRateVnd] = useState("0")
  const [paymentAccountName, setPaymentAccountName] = useState("")
  const [paymentAccountNumber, setPaymentAccountNumber] = useState("")
  const [paymentBankName, setPaymentBankName] = useState("")
  const [paymentQrUrl, setPaymentQrUrl] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const profile = !profileError ? (existingProfile ?? null) : null

  const isProfileReady =
    profile && (profile.status === "DRAFT" || profile.status === "ACTIVE")

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!displayName.trim()) {
      newErrors.displayName = "Vui lòng nhập tên hiển thị"
    }
    if (!paymentAccountName.trim()) {
      newErrors.paymentAccountName = "Vui lòng nhập tên tài khoản"
    }
    if (!paymentAccountNumber.trim()) {
      newErrors.paymentAccountNumber = "Vui lòng nhập số tài khoản"
    }
    if (!paymentBankName.trim()) {
      newErrors.paymentBankName = "Vui lòng nhập tên ngân hàng"
    }

    const expYears = Number(yearsExperience)
    if (Number.isNaN(expYears) || expYears < 0) {
      newErrors.yearsExperience = "Số năm kinh nghiệm phải >= 0"
    }

    const rate = Number(hourlyRateVnd)
    if (Number.isNaN(rate) || rate < 0) {
      newErrors.hourlyRateVnd = "Giá theo giờ phải >= 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return

    registerCoach.mutate(
      {
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        level: (level || undefined) as
          | "Beginner"
          | "Intermediate"
          | "Advanced"
          | "Pro"
          | undefined,
        yearsExperience: Number(yearsExperience) || undefined,
        specialties: specialties.length > 0 ? specialties : undefined,
        languages: languages.length > 0 ? languages : undefined,
        locationCity: locationCity.trim() || undefined,
        hourlyRateVnd: Number(hourlyRateVnd) || undefined,
        paymentAccountName: paymentAccountName.trim(),
        paymentAccountNumber: paymentAccountNumber.trim(),
        paymentBankName: paymentBankName.trim(),
        paymentQrUrl: paymentQrUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            t("coach.registration.createSuccess", "Tạo hồ sơ HLV thành công")
          )
          setStep("success")
        },
        onError: (err: Error) => {
          const msg = err.message
          if (msg.includes("409") || msg.includes("đã có hồ sơ")) {
            setApiError("Bạn đã có hồ sơ HLV")
          } else {
            setApiError(getErrorMessage(err) || "Tạo hồ sơ thất bại")
          }
          toast.error(getErrorMessage(err) || "Tạo hồ sơ thất bại")
        },
      }
    )
  }

  const handlePublish = () => {
    publishProfile.mutate(undefined, {
      onSuccess: () => {
        toast.success(t("coach.publish.success", "Đã công khai hồ sơ HLV"))
      },
      onError: (err: Error) => {
        const msg = err.message
        if (msg.includes("already active")) {
          toast.error("Hồ sơ đã ở trạng thái ACTIVE")
        } else {
          toast.error(getErrorMessage(err) || "Công khai thất bại")
        }
      },
    })
  }

  const handleSpecialtyToggle = (value: string) => {
    setSpecialties((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const handleLanguageToggle = (value: string) => {
    setLanguages((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  if (checkingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Đang kiểm tra hồ sơ...</p>
      </div>
    )
  }

  if (step === "success" || (isProfileReady && step === "form")) {
    const currentProfile = publishProfile.data ?? registerCoach.data ?? profile
    const isActive = currentProfile?.status === "ACTIVE"

    return (
      <div className="mx-auto max-w-lg space-y-6 py-10">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <BadgeCheck className="size-8 text-primary" />
            </div>
            <CardTitle className="text-xl">
              {isActive
                ? "Hồ sơ HLV đã được công khai"
                : "Tạo hồ sơ HLV thành công"}
            </CardTitle>
            <CardDescription>
              {isActive
                ? "Hồ sơ của bạn đã được công khai và sẵn sàng nhận học viên."
                : "Hồ sơ của bạn đã được tạo. Hãy công khai để học viên có thể tìm thấy bạn."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trạng thái</span>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "ACTIVE" : "DRAFT"}
                </Badge>
              </div>
              {currentProfile?.displayName && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tên hiển thị
                  </span>
                  <span className="text-sm font-medium">
                    {currentProfile.displayName}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/coach/profile")}
              >
                <Edit3 className="size-4" />
                Chỉnh sửa hồ sơ
              </Button>
              {!isActive && (
                <Button
                  onClick={handlePublish}
                  disabled={publishProfile.isPending}
                >
                  <Send className="size-4" />
                  {publishProfile.isPending
                    ? "Đang công khai..."
                    : "Công khai hồ sơ"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Đăng ký trở thành Huấn luyện viên
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Điền thông tin để tạo hồ sơ HLV. Có thể chỉnh sửa sau.
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
          <CardDescription>
            Thông tin hiển thị công khai đến học viên.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">
              Tên hiển thị <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
            {errors.displayName && (
              <p className="text-xs text-destructive">{errors.displayName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Giới thiệu</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Mô tả ngắn về kinh nghiệm và phong cách huấn luyện"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">URL ảnh đại diện</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="level">Cấp độ</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Số năm kinh nghiệm</Label>
              <Input
                id="yearsExperience"
                type="number"
                min={0}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="0"
              />
              {errors.yearsExperience && (
                <p className="text-xs text-destructive">
                  {errors.yearsExperience}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Chuyên môn</Label>
            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map((opt) => {
                const isSelected = specialties.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSpecialtyToggle(opt.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-accent/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ngôn ngữ</Label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((opt) => {
                const isSelected = languages.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleLanguageToggle(opt.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-accent/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="locationCity">Khu vực</Label>
              <Input
                id="locationCity"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                placeholder="TP. Hồ Chí Minh"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRateVnd">Giá theo giờ (VNĐ)</Label>
              <Input
                id="hourlyRateVnd"
                type="number"
                min={0}
                value={hourlyRateVnd}
                onChange={(e) => setHourlyRateVnd(e.target.value)}
                placeholder="0"
              />
              {errors.hourlyRateVnd && (
                <p className="text-xs text-destructive">
                  {errors.hourlyRateVnd}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin thanh toán</CardTitle>
          <CardDescription>
            Thông tin nhận thanh toán từ học viên.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentAccountName">
              Tên tài khoản <span className="text-destructive">*</span>
            </Label>
            <Input
              id="paymentAccountName"
              value={paymentAccountName}
              onChange={(e) => setPaymentAccountName(e.target.value)}
              placeholder="NGUYEN VAN A"
            />
            {errors.paymentAccountName && (
              <p className="text-xs text-destructive">
                {errors.paymentAccountName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentAccountNumber">
              Số tài khoản <span className="text-destructive">*</span>
            </Label>
            <Input
              id="paymentAccountNumber"
              value={paymentAccountNumber}
              onChange={(e) => setPaymentAccountNumber(e.target.value)}
              placeholder="1234567890"
            />
            {errors.paymentAccountNumber && (
              <p className="text-xs text-destructive">
                {errors.paymentAccountNumber}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentBankName">
              Tên ngân hàng <span className="text-destructive">*</span>
            </Label>
            <Input
              id="paymentBankName"
              value={paymentBankName}
              onChange={(e) => setPaymentBankName(e.target.value)}
              placeholder="Vietcombank"
            />
            {errors.paymentBankName && (
              <p className="text-xs text-destructive">
                {errors.paymentBankName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentQrUrl">URL mã QR thanh toán</Label>
            <Input
              id="paymentQrUrl"
              value={paymentQrUrl}
              onChange={(e) => setPaymentQrUrl(e.target.value)}
              placeholder="https://example.com/qr.png"
            />
          </div>
        </CardContent>
      </Card>

      {apiError && (
        <Card className="border-destructive">
          <CardContent className="py-4 text-sm text-destructive">
            {apiError}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Hủy
        </Button>
        <Button type="submit" disabled={registerCoach.isPending}>
          {registerCoach.isPending ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </div>
    </form>
  )
}

function BadgeCheck(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
