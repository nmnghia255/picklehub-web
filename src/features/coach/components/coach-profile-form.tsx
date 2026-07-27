"use client"

import {
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  Globe2,
  MapPin,
  Plus,
  Save,
  Send,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react"
import {
  type ChangeEvent,
  type ComponentType,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "@/features/auth/hooks/use-session"
import { CoachMediaService } from "@/features/coach/api/media-service"
import { formatCertificationDate } from "@/features/coach/utils/format-certification-date"

import {
  useAddCertification,
  useDeleteCertification,
  useMyCertifications,
  useMyCoachProfile,
  usePublishMyProfile,
  useUpdateMyCoachProfile,
} from "../hooks/use-coach-queries"

function getLocaleCode(language: string) {
  return language.startsWith("vi") ? "vi-VN" : "en-US"
}

function getSkillOptions(t: (key: string) => string) {
  return [
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
  ] as const
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function getCertStatusColor(status: string) {
  switch (status) {
    case "VERIFIED":
      return "default"
    case "PENDING":
      return "outline"
    case "REJECTED":
      return "destructive"
    default:
      return "outline"
  }
}

function getCertStatusLabel(t: (key: string) => string, status: string) {
  switch (status) {
    case "VERIFIED":
      return t("coach.profile.confirmed")
    case "PENDING":
      return t("coach.profile.pending")
    case "REJECTED":
      return t("coach.profile.rejected")
    default:
      return t("coach.profile.unverified")
  }
}

function getCertStatusIcon(status: string) {
  switch (status) {
    case "VERIFIED":
      return CheckCircle2
    case "PENDING":
      return Clock3
    default:
      return Clock3
  }
}

function CoachProfileLoadingState() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-48 rounded-3xl" />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  )
}

function CertificationSummary({
  verifiedCount,
  pendingCount,
  t,
}: {
  verifiedCount: number
  pendingCount: number
  t: (key: string) => string
}) {
  return (
    <>
      <div className="rounded-2xl border bg-background/80 p-4 backdrop-blur-sm">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          {t("coach.profile.verifiedCerts")}
        </p>
        <p className="mt-1 text-2xl font-semibold">{verifiedCount}</p>
      </div>
      <div className="rounded-2xl border bg-background/80 p-4 backdrop-blur-sm">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          {t("coach.profile.pendingCerts")}
        </p>
        <p className="mt-1 text-2xl font-semibold">{pendingCount}</p>
      </div>
    </>
  )
}

export function CoachProfileForm() {
  const { t, i18n } = useTranslation("common")
  const locale = getLocaleCode(i18n.language)
  const session = useSession()
  const { data: profile, isLoading: profileLoading } = useMyCoachProfile({
    enabled: !!session?.user,
  })
  const { data: certs, isLoading: certsLoading } = useMyCertifications({
    enabled: !!session?.user,
  })
  const updateProfile = useUpdateMyCoachProfile()
  const publishProfile = usePublishMyProfile()
  const addCert = useAddCertification()
  const deleteCert = useDeleteCertification()

  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false)

  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [locationCity, setLocationCity] = useState("")
  const [yearsExperience, setYearsExperience] = useState("0")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("")
  const [avatarFileName, setAvatarFileName] = useState(
    t("coach.profile.noAvatarUploaded")
  )
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarUploadError, setAvatarUploadError] = useState("")

  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [certDialogOpen, setCertDialogOpen] = useState(false)
  const [certName, setCertName] = useState("")
  const [certOrg, setCertOrg] = useState("")
  const [certIssuedAt, setCertIssuedAt] = useState("")
  const [certExpiresAt, setCertExpiresAt] = useState("")
  const [certDocumentUrl, setCertDocumentUrl] = useState("")
  const [certFileName, setCertFileName] = useState("")
  const [certFileSize, setCertFileSize] = useState(0)
  const [certUploading, setCertUploading] = useState(false)
  const [certUploadError, setCertUploadError] = useState("")
  const [certDeleteId, setCertDeleteId] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const certInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl)
      }
    }
  }, [avatarPreviewUrl])

  const certifications = useMemo(() => certs ?? [], [certs])
  const skillOptions = getSkillOptions(t)

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayName(profile.displayName)
      setBio(profile.bio ?? "")
      setLocationCity(profile.locationCity ?? "")
      setYearsExperience(String(profile.yearsExperience ?? 0))
      setAvatarUrl(profile.avatarUrl ?? "")
      setAvatarPreviewUrl(profile.avatarUrl ?? "")
      setSelectedSkills(profile.specialties ?? [])
    }
  }, [profile])

  const verifiedCount = useMemo(
    () =>
      certifications.filter((c) => c.verificationStatus === "VERIFIED").length,
    [certifications]
  )
  const pendingCount = useMemo(
    () =>
      certifications.filter(
        (c) =>
          c.verificationStatus === "PENDING" ||
          c.verificationStatus === "UNVERIFIED"
      ).length,
    [certifications]
  )

  const openBasicInfoEditor = () => {
    setDisplayName(profile?.displayName ?? "")
    setBio(profile?.bio ?? "")
    setLocationCity(profile?.locationCity ?? "")
    setYearsExperience(String(profile?.yearsExperience ?? 0))
    setAvatarUrl(profile?.avatarUrl ?? "")
    setAvatarPreviewUrl(profile?.avatarUrl ?? "")
    setAvatarFileName(t("coach.profile.noAvatarUploaded"))
    setAvatarUploadError("")
    setIsEditingBasicInfo(true)
  }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setAvatarUploadError("")
    if (!file.type.startsWith("image/")) {
      setAvatarUploadError(t("coach.profile.invalidImage"))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarUploadError(t("coach.profile.imageTooLarge"))
      return
    }

    const localPreviewUrl = URL.createObjectURL(file)
    setAvatarPreviewUrl(localPreviewUrl)
    setAvatarFileName(file.name)
    setAvatarUploading(true)
    try {
      const uploadedUrl = await CoachMediaService.uploadImage(file)
      setAvatarUrl(uploadedUrl)
      setAvatarPreviewUrl(uploadedUrl)
    } catch {
      setAvatarUploadError(t("coach.profile.uploadError"))
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleBasicInfoSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const expYears = Number(yearsExperience)
    if (Number.isNaN(expYears) || expYears < 0) return
    if (avatarUploading) return

    updateProfile.mutate({
      displayName: displayName.trim() || undefined,
      bio: bio.trim() || undefined,
      locationCity: locationCity.trim() || undefined,
      yearsExperience: expYears || undefined,
      avatarUrl: avatarUrl || undefined,
    })
    setIsEditingBasicInfo(false)
  }

  const handleBasicInfoCancel = () => {
    setIsEditingBasicInfo(false)
    setAvatarUrl(profile?.avatarUrl ?? "")
    setAvatarPreviewUrl(profile?.avatarUrl ?? "")
    setAvatarUploadError("")
    if (avatarInputRef.current) avatarInputRef.current.value = ""
  }

  const handleSkillToggle = (value: string) => {
    setSelectedSkills((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }

  const handleSkillsSave = () => {
    updateProfile.mutate({
      specialties: selectedSkills,
    })
  }

  const openCreateCertificationDialog = () => {
    setCertName("")
    setCertOrg("")
    setCertIssuedAt("")
    setCertExpiresAt("")
    setCertDocumentUrl("")
    setCertFileName("")
    setCertFileSize(0)
    setCertUploadError("")
    setCertDialogOpen(true)
  }

  const handleCertificationFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setCertUploadError("")
    setCertDocumentUrl("")
    const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf")
    if (file.type !== "application/pdf" || !hasPdfExtension) {
      setCertUploadError(t("coach.profile.invalidCertificationFile"))
      return
    }
    if (file.size === 0) {
      setCertUploadError(t("coach.profile.emptyCertificationFile"))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setCertUploadError(t("coach.profile.certificationFileTooLarge"))
      return
    }

    setCertFileName(file.name)
    setCertFileSize(file.size)
    setCertUploading(true)
    CoachMediaService.uploadDocument(file)
      .then((uploadedUrl) => setCertDocumentUrl(uploadedUrl))
      .catch(() => {
        setCertUploadError(t("coach.profile.certificationUploadError"))
        setCertDocumentUrl("")
      })
      .finally(() => setCertUploading(false))
  }

  const removeCertificationFile = () => {
    setCertDocumentUrl("")
    setCertFileName("")
    setCertFileSize(0)
    setCertUploadError("")
    if (certInputRef.current) certInputRef.current.value = ""
  }

  const handleCertificationSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = certName.trim()
    const org = certOrg.trim()
    const issuedAt = certIssuedAt.trim()
    const expiresAt = certExpiresAt.trim()
    const documentUrl = certDocumentUrl.trim()
    if (!name || !org || !issuedAt || !documentUrl) {
      toast.error(
        certUploading
          ? t("coach.profile.uploadPending")
          : t("coach.profile.certificationRequired")
      )
      return
    }
    try {
      const parsedUrl = new URL(documentUrl)
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("Unsupported URL protocol")
      }
    } catch {
      toast.error(t("coach.profile.invalidDocumentUrl"))
      return
    }
    if (expiresAt && expiresAt < issuedAt) {
      toast.error(t("coach.profile.expiryBeforeIssue"))
      return
    }
    addCert.mutate(
      {
        name,
        issuingOrganization: org,
        issuedAt,
        expiresAt: expiresAt || null,
        documentUrl,
      },
      {
        onSuccess: () => {
          setCertDialogOpen(false)
          toast.success(t("coach.profile.certAdded"))
        },
        onError: () => toast.error(t("coach.profile.certificationAddError")),
      }
    )
  }

  const handleCertificationDelete = () => {
    if (!certDeleteId) return
    deleteCert.mutate(certDeleteId, {
      onSuccess: () => {
        setCertDeleteId(null)
        toast.success(t("coach.profile.certDeleted"))
      },
      onError: () => toast.error(t("coach.profile.certificationDeleteError")),
    })
  }

  if (profileLoading || certsLoading) {
    return <CoachProfileLoadingState />
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border bg-linear-to-br from-primary/15 via-sky-500/10 to-emerald-500/10 p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {t("coach.profile.pageTitle")}
              </h2>
              <p className="text-sm text-muted-foreground md:text-base">
                {t("coach.profile.pageDescription")}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-90 lg:grid-cols-2">
            <CertificationSummary
              verifiedCount={verifiedCount}
              pendingCount={pendingCount}
              t={t}
            />
            {profile?.status === "DRAFT" && (
              <Button
                type="button"
                className="col-span-full rounded-full"
                onClick={() => publishProfile.mutate()}
                disabled={publishProfile.isPending}
              >
                <Send className="size-4" />
                {publishProfile.isPending
                  ? t("coach.profile.publishingButton")
                  : t("coach.profile.publishButton")}
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{t("coach.profile.basicInfoTitle")}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("coach.profile.basicInfoDescription")}
                  </p>
                </div>

                {!isEditingBasicInfo ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={openBasicInfoEditor}
                    disabled={updateProfile.isPending}
                  >
                    <Edit3 className="size-4" />
                    {t("coach.profile.editButton")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={handleBasicInfoCancel}
                  >
                    {t("coach.profile.cancelButton")}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {!isEditingBasicInfo ? (
                <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
                  <Avatar size="lg" className="size-20 rounded-3xl">
                    <AvatarImage
                      src={profile?.avatarUrl ?? ""}
                      alt={profile?.displayName}
                    />
                    <AvatarFallback className="rounded-3xl text-lg font-semibold">
                      {profile ? getInitials(profile.displayName) : "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold">
                          {profile?.displayName ?? t("coach.profile.noName")}
                        </h3>
                        <Badge variant="secondary" className="rounded-full">
                          {t("coach.profile.coachBadge")}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                          <MapPin className="size-4" />
                          {profile?.locationCity ??
                            t("coach.profile.noLocation")}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                          <CalendarDays className="size-4" />
                          {t("coach.profile.experienceYears", {
                            years: profile?.yearsExperience ?? 0,
                          })}
                        </span>
                      </div>
                    </div>

                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {profile?.bio ?? t("coach.profile.noBio")}
                    </p>
                  </div>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleBasicInfoSave}>
                  <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start">
                    <div className="space-y-3">
                      <Avatar size="lg" className="size-24 rounded-3xl border">
                        <AvatarImage src={avatarPreviewUrl} alt={displayName} />
                        <AvatarFallback className="rounded-3xl text-lg font-semibold">
                          {getInitials(displayName || "?")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-2 rounded-2xl border border-dashed p-4">
                        <Label htmlFor="avatarUpload">
                          {t("coach.profile.uploadAvatar")}
                        </Label>
                        <Input
                          id="avatarUpload"
                          ref={avatarInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handleAvatarChange}
                          disabled={avatarUploading}
                        />
                        <p className="text-xs text-muted-foreground">
                          {avatarUploading
                            ? t("coach.profile.uploading")
                            : avatarFileName}
                        </p>
                        {avatarUploadError ? (
                          <p className="text-xs text-destructive">
                            {avatarUploadError}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="displayName">
                          {t("coach.profile.displayNameLabel")}
                        </Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder={t(
                            "coach.profile.displayNamePlaceholder"
                          )}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="bio">
                          {t("coach.profile.bioLabel")}
                        </Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          placeholder={t("coach.profile.bioPlaceholder")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="locationCity">
                          {t("coach.profile.locationLabel")}
                        </Label>
                        <Input
                          id="locationCity"
                          value={locationCity}
                          onChange={(e) => setLocationCity(e.target.value)}
                          placeholder={t("coach.profile.locationPlaceholder")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="yearsExperience">
                          {t("coach.profile.experienceLabel")}
                        </Label>
                        <Input
                          id="yearsExperience"
                          type="number"
                          min={0}
                          value={yearsExperience}
                          onChange={(e) => setYearsExperience(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      className="rounded-full"
                      disabled={updateProfile.isPending || avatarUploading}
                    >
                      <Save className="size-4" />
                      {updateProfile.isPending
                        ? t("coach.profile.saving")
                        : t("coach.profile.saveChanges")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={handleBasicInfoCancel}
                    >
                      {t("coach.profile.cancelEditButton")}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{t("coach.profile.certificationTitle")}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("coach.profile.certificationDescription")}
                  </p>
                </div>

                <Button
                  type="button"
                  className="rounded-full"
                  onClick={openCreateCertificationDialog}
                  disabled={addCert.isPending}
                >
                  <Plus className="size-4" />
                  {t("coach.profile.addCertButton")}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {certifications.map((certification, index) => {
                const StatusIcon = getCertStatusIcon(
                  certification.verificationStatus
                )

                return (
                  <div
                    key={certification.id ?? index}
                    className="rounded-2xl border p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold">
                            {certification.name}
                          </h3>
                          <Badge
                            variant={
                              getCertStatusColor(
                                certification.verificationStatus
                              ) as "default" | "outline" | "destructive"
                            }
                            className="rounded-full"
                          >
                            <StatusIcon className="size-3.5" />
                            {getCertStatusLabel(
                              t,
                              certification.verificationStatus
                            )}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                            <Award className="size-4" />
                            {certification.issuingOrganization ??
                              t("coach.profile.noOrganization")}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                            <CalendarDays className="size-4" />
                            <span>
                              {t("coach.profile.certDateLabel")}:{" "}
                              {formatCertificationDate(
                                certification.issuedAt,
                                locale
                              ) ?? t("coach.profile.noDate")}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                            <CalendarDays className="size-4" />
                            <span>
                              {t("coach.profile.certExpiryLabel")}:{" "}
                              {certification.expiresAt
                                ? (formatCertificationDate(
                                    certification.expiresAt,
                                    locale
                                  ) ?? t("coach.profile.noDate"))
                                : t("coach.profile.noExpiry")}
                            </span>
                          </span>
                        </div>

                        {certification.documentUrl && (
                          <a
                            href={certification.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                          >
                            <FileText className="size-4" />
                            {t("coach.profile.viewDocument")}
                          </a>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full text-destructive hover:text-destructive"
                          onClick={() => setCertDeleteId(certification.id)}
                          disabled={
                            deleteCert.isPending || Boolean(certDeleteId)
                          }
                        >
                          <Trash2 className="size-4" />
                          {t("coach.profile.delete")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {certifications.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t("coach.profile.noCertification")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{t("coach.profile.skillsTitle")}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("coach.profile.skillsDescription")}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {skillOptions.map((skill) => (
                  <label
                    key={skill.value}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors hover:bg-muted/30"
                  >
                    <Checkbox
                      checked={selectedSkills.includes(skill.value)}
                      onCheckedChange={() => handleSkillToggle(skill.value)}
                    />
                    <span className="text-sm leading-5 font-medium">
                      {skill.label}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="rounded-full"
                  onClick={handleSkillsSave}
                  disabled={updateProfile.isPending}
                >
                  <Save className="size-4" />
                  {updateProfile.isPending
                    ? t("coach.profile.saving")
                    : t("coach.profile.saveChanges")}
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {t("coach.profile.selectedSkills")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      {t("coach.profile.noSkillsSelected")}
                    </span>
                  ) : (
                    selectedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="rounded-full"
                      >
                        {skill}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Globe2 className="size-4" />
                  {profile?.bio ?? t("coach.profile.noBio")}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{t("coach.profile.statsTitle")}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("coach.profile.statsDescription")}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {t("coach.profile.autoUpdate")}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={CalendarDays}
                label={t("coach.profile.sessionsTaught")}
                value={profile ? String(profile.yearsExperience ?? 0) : "0"}
              />
              <StatCard
                icon={Users}
                label={t("coach.profile.studentsTaught")}
                value={String(profile?.reviewCount ?? 0)}
              />
              <StatCard
                icon={Star}
                label={t("coach.profile.averageRating")}
                value={(profile?.averageRating ?? 0).toFixed(1)}
                suffix="/ 5"
              />
              <StatCard
                icon={CheckCircle2}
                label={t("coach.profile.reviewCount")}
                value={String(profile?.reviewCount ?? 0)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={certDialogOpen}
        onOpenChange={(open) => {
          setCertDialogOpen(open)
          if (!open) {
            setCertName("")
            setCertOrg("")
            setCertIssuedAt("")
            setCertExpiresAt("")
            setCertDocumentUrl("")
            setCertFileName("")
            setCertFileSize(0)
            setCertUploadError("")
            if (certInputRef.current) certInputRef.current.value = ""
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("coach.profile.addCertButton")}</DialogTitle>
            <DialogDescription>
              {t("coach.profile.certDialogDescription")}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCertificationSave}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="certName">
                  {t("coach.profile.certNameLabel")}
                </Label>
                <Input
                  id="certName"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder={t("coach.profile.certNamePlaceholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certOrg">
                  {t("coach.profile.certOrgLabel")}
                </Label>
                <Input
                  id="certOrg"
                  value={certOrg}
                  onChange={(e) => setCertOrg(e.target.value)}
                  placeholder={t("coach.profile.certOrgPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certIssuedAt">
                  {t("coach.profile.certDateLabel")}
                </Label>
                <Input
                  id="certIssuedAt"
                  type="date"
                  lang="en-GB"
                  value={certIssuedAt}
                  onChange={(e) => setCertIssuedAt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certExpiresAt">
                  {t("coach.profile.certExpiryLabel")}
                </Label>
                <Input
                  id="certExpiresAt"
                  type="date"
                  lang="en-GB"
                  min={certIssuedAt || undefined}
                  value={certExpiresAt}
                  onChange={(e) => setCertExpiresAt(e.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="certFile">
                  {t("coach.profile.certFileLabel")}
                </Label>
                <Input
                  id="certFile"
                  ref={certInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleCertificationFileChange}
                  disabled={certUploading}
                />
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed px-3 py-2 text-sm text-muted-foreground">
                  <FileText className="size-4" />
                  <span className="min-w-0 flex-1 truncate">
                    {certUploading
                      ? t("coach.profile.certificationUploading")
                      : certFileName || t("coach.profile.noFileSelected")}
                  </span>
                  {certFileName ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeCertificationFile}
                      disabled={certUploading}
                      aria-label={t("coach.profile.removeFile")}
                    >
                      <X className="size-4" />
                    </Button>
                  ) : null}
                </div>
                {certFileName && !certUploading ? (
                  <p className="text-xs text-muted-foreground">
                    {certFileSize > 0
                      ? `${(certFileSize / (1024 * 1024)).toFixed(2)} MB`
                      : t("coach.profile.uploadFailed")}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {t("coach.profile.pdfOnlyHint")}
                </p>
                {certDocumentUrl.trim() ? (
                  <a
                    href={certDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    <FileText className="size-4" />
                    {t("coach.profile.viewDocument")}
                  </a>
                ) : null}
                {certUploadError ? (
                  <p className="text-xs text-destructive">{certUploadError}</p>
                ) : null}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCertDialogOpen(false)}
              >
                {t("coach.profile.cancelButton")}
              </Button>
              <Button
                type="submit"
                disabled={
                  addCert.isPending ||
                  certUploading ||
                  !certName.trim() ||
                  !certOrg.trim() ||
                  !certIssuedAt ||
                  !certDocumentUrl.trim()
                }
              >
                <Save className="size-4" />
                {addCert.isPending
                  ? t("coach.profile.saving")
                  : t("coach.profile.saveCert")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(certDeleteId)}
        onOpenChange={(open) => {
          if (!open && !deleteCert.isPending) setCertDeleteId(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("coach.profile.confirmDeleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("coach.profile.confirmDeleteDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCertDeleteId(null)}
              disabled={deleteCert.isPending}
            >
              {t("coach.profile.cancelButton")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCertificationDelete}
              disabled={deleteCert.isPending}
            >
              {deleteCert.isPending
                ? t("coach.profile.deleting")
                : t("coach.profile.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {updateProfile.isSuccess && (
        <p className="text-sm font-medium text-green-600">
          {t("coach.profile.updated")}
        </p>
      )}

      {publishProfile.isSuccess && (
        <p className="text-sm font-medium text-green-600">
          {t("coach.profile.published")}
        </p>
      )}
    </div>
  )
}

type StatCardProps = {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  suffix?: string
}

function StatCard({ icon: Icon, label, value, suffix }: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3 text-muted-foreground">
        <span className="text-sm">{label}</span>
        <Icon className="size-4" />
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {suffix ? (
          <span className="pb-0.5 text-sm text-muted-foreground">{suffix}</span>
        ) : null}
      </div>
    </div>
  )
}
