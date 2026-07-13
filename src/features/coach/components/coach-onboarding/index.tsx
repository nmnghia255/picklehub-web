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

export function CoachOnboarding() {
  const { t } = useTranslation("common")
  const router = useRouter()

  const levelOptions = [
    { value: "Beginner", label: t("coach.discovery.levelLabels.beginner") },
    {
      value: "Intermediate",
      label: t("coach.discovery.levelLabels.intermediate"),
    },
    { value: "Advanced", label: t("coach.discovery.levelLabels.advanced") },
    { value: "Pro", label: t("coach.discovery.levelLabels.pro") },
  ]

  const specialtyOptions = [
    {
      value: "Beginner Coaching",
      label: t("coach.onboarding.specialtyBeginner"),
    },
    {
      value: "Advanced Strategy",
      label: t("coach.onboarding.specialtyAdvanced"),
    },
    { value: "Kids Coaching", label: t("coach.onboarding.specialtyKids") },
    {
      value: "Tournament Coaching",
      label: t("coach.onboarding.specialtyTournament"),
    },
  ]

  const languageOptions = [
    { value: "vi", label: t("coach.onboarding.langVi") },
    { value: "en", label: t("coach.onboarding.langEn") },
    { value: "zh", label: t("coach.onboarding.langZh") },
    { value: "ko", label: t("coach.onboarding.langKo") },
    { value: "ja", label: t("coach.onboarding.langJa") },
  ]

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
      newErrors.displayName = t("coach.onboarding.displayNameRequired")
    }
    if (!paymentAccountName.trim()) {
      newErrors.paymentAccountName = t("coach.onboarding.accountNameRequired")
    }
    if (!paymentAccountNumber.trim()) {
      newErrors.paymentAccountNumber = t(
        "coach.onboarding.accountNumberRequired"
      )
    }
    if (!paymentBankName.trim()) {
      newErrors.paymentBankName = t("coach.onboarding.bankNameRequired")
    }

    const expYears = Number(yearsExperience)
    if (Number.isNaN(expYears) || expYears < 0) {
      newErrors.yearsExperience = t("coach.onboarding.experienceRequired")
    }

    const rate = Number(hourlyRateVnd)
    if (Number.isNaN(rate) || rate < 0) {
      newErrors.hourlyRateVnd = t("coach.onboarding.hourlyRateRequired")
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
        toast.success(t("coach.registration.createSuccess"))
        refetch()
      },
      onError: (err: Error) => {
        setApiError(getErrorMessage(err) || t("coach.registration.createError"))
        toast.error(getErrorMessage(err) || t("coach.registration.createError"))
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
            toast.success(t("coach.registration.publishSuccess"))
            refetch()
            router.push("/coach")
          },
          onError: (err: Error) => {
            setApiError(
              getErrorMessage(err) || t("coach.registration.publishError")
            )
            toast.error(
              getErrorMessage(err) || t("coach.registration.publishError")
            )
          },
        })
      },
      onError: (err: Error) => {
        setApiError(getErrorMessage(err) || t("coach.registration.createError"))
        toast.error(getErrorMessage(err) || t("coach.registration.createError"))
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
              {t("coach.onboarding.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("coach.onboarding.description")}
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("coach.onboarding.basicInfoTitle")}
            </CardTitle>
            <CardDescription>
              {t("coach.onboarding.basicInfoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">
                {t("coach.onboarding.displayName")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("coach.onboarding.displayNamePlaceholder")}
              />
              {errors.displayName && (
                <p className="text-xs text-destructive">{errors.displayName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t("coach.onboarding.bioLabel")}</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder={t("coach.onboarding.bioPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">
                {t("coach.onboarding.avatarLabel")}
              </Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder={t("coach.onboarding.avatarPlaceholder")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level">
                  {t("coach.onboarding.levelLabel")}
                </Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t("coach.onboarding.levelPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.value === "Beginner"
                          ? t("coach.onboarding.level.beginner")
                          : opt.value === "Intermediate"
                            ? t("coach.onboarding.level.intermediate")
                            : opt.value === "Advanced"
                              ? t("coach.onboarding.level.advanced")
                              : t("coach.onboarding.level.pro")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsExperience">
                  {t("coach.onboarding.experienceLabel")}
                </Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min={0}
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder={t("coach.onboarding.yearsExperiencePlaceholder")}
                />
                {errors.yearsExperience && (
                  <p className="text-xs text-destructive">
                    {errors.yearsExperience}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("coach.onboarding.specialtiesLabel")}</Label>
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
                      {opt.value === "Beginner Coaching"
                        ? t("coach.onboarding.specialtyBeginner")
                        : opt.value === "Advanced Strategy"
                          ? t("coach.onboarding.specialtyAdvanced")
                          : opt.value === "Kids Coaching"
                            ? t("coach.onboarding.specialtyKids")
                            : t("coach.onboarding.specialtyTournament")}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("coach.onboarding.languagesLabel")}</Label>
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
                      {opt.value === "vi"
                        ? t("coach.onboarding.langVi")
                        : opt.value === "en"
                          ? t("coach.onboarding.langEn")
                          : opt.value === "zh"
                            ? t("coach.onboarding.langZh")
                            : opt.value === "ko"
                              ? t("coach.onboarding.langKo")
                              : t("coach.onboarding.langJa")}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="locationCity">
                  {t("coach.onboarding.locationLabel")}
                </Label>
                <Input
                  id="locationCity"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  placeholder={t("coach.onboarding.locationPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRateVnd">
                  {t("coach.onboarding.hourlyRateLabel")}
                </Label>
                <Input
                  id="hourlyRateVnd"
                  type="number"
                  min={0}
                  value={hourlyRateVnd}
                  onChange={(e) => setHourlyRateVnd(e.target.value)}
                  placeholder={t("coach.onboarding.hourlyRatePlaceholder")}
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
            <CardTitle className="text-lg">
              {t("coach.onboarding.paymentInfoTitle")}
            </CardTitle>
            <CardDescription>
              {t("coach.onboarding.paymentInfoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAccountName">
                {t("coach.onboarding.accountNameLabel")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="paymentAccountName"
                value={paymentAccountName}
                onChange={(e) => setPaymentAccountName(e.target.value)}
                placeholder={t(
                  "coach.onboarding.paymentAccountNamePlaceholder"
                )}
              />
              {errors.paymentAccountName && (
                <p className="text-xs text-destructive">
                  {errors.paymentAccountName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAccountNumber">
                {t("coach.onboarding.accountNumberLabel")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="paymentAccountNumber"
                value={paymentAccountNumber}
                onChange={(e) => setPaymentAccountNumber(e.target.value)}
                placeholder={t(
                  "coach.onboarding.paymentAccountNumberPlaceholder"
                )}
              />
              {errors.paymentAccountNumber && (
                <p className="text-xs text-destructive">
                  {errors.paymentAccountNumber}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentBankName">
                {t("coach.onboarding.bankNameLabel")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="paymentBankName"
                value={paymentBankName}
                onChange={(e) => setPaymentBankName(e.target.value)}
                placeholder={t("coach.onboarding.paymentBankNamePlaceholder")}
              />
              {errors.paymentBankName && (
                <p className="text-xs text-destructive">
                  {errors.paymentBankName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentQrUrl">
                {t("coach.onboarding.qrUrlLabel")}
              </Label>
              <Input
                id="paymentQrUrl"
                value={paymentQrUrl}
                onChange={(e) => setPaymentQrUrl(e.target.value)}
                placeholder={t("coach.onboarding.paymentQrUrlPlaceholder")}
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
            {registerCoach.isPending
              ? t("coach.onboarding.saving")
              : t("coach.onboarding.saveDraft")}
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={registerCoach.isPending || publishProfile.isPending}
          >
            <Send className="size-4" />
            {publishProfile.isPending
              ? t("coach.onboarding.publishing")
              : t("coach.onboarding.publishButton")}
          </Button>
        </div>
      </form>
    </div>
  )
}
