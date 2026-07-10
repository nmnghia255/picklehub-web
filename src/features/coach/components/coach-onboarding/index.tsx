"use client"

import { Save, Send, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

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

export function CoachOnboarding() {
  const { t } = useTranslation("common")
  const router = useRouter()

  const { refetch } = useCoachProfile({ enabled: false })
  const registerCoach = useRegisterAsCoach()
  const publishProfile = usePublishMyProfile()

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

  const getDto = () => ({
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
  })

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

  const handleSaveDraft = (e: FormEvent) => {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return

    registerCoach.mutate(getDto(), {
      onSuccess: () => {
        toast.success(
          t("coach.registration.createSuccess", "Tạo hồ sơ HLV thành công")
        )
        refetch()
      },
      onError: (err: Error) => {
        setApiError(getErrorMessage(err) || "Tạo hồ sơ thất bại")
        toast.error(getErrorMessage(err) || "Tạo hồ sơ thất bại")
      },
    })
  }

  const handlePublish = (e: FormEvent) => {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return

    registerCoach.mutate(getDto(), {
      onSuccess: () => {
        publishProfile.mutate(undefined, {
          onSuccess: () => {
            toast.success(t("coach.publish.success", "Đã công khai hồ sơ HLV"))
            refetch()
            router.push("/coach")
          },
          onError: (err: Error) => {
            setApiError(getErrorMessage(err) || "Công khai thất bại")
            toast.error(getErrorMessage(err) || "Công khai thất bại")
          },
        })
      },
      onError: (err: Error) => {
        setApiError(getErrorMessage(err) || "Tạo hồ sơ thất bại")
        toast.error(getErrorMessage(err) || "Tạo hồ sơ thất bại")
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

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Become a Coach
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete your coach profile before using Coach features.
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-8">
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
            <CardContent className="py-3 text-sm text-destructive">
              {apiError}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={registerCoach.isPending}
          >
            <Save className="size-4" />
            {registerCoach.isPending ? "Đang lưu..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={registerCoach.isPending || publishProfile.isPending}
          >
            <Send className="size-4" />
            {publishProfile.isPending ? "Đang công khai..." : "Publish Profile"}
          </Button>
        </div>
      </form>
    </div>
  )
}
