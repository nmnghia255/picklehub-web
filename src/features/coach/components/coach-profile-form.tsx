"use client"

import {
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  Globe2,
  ImageIcon,
  MapPin,
  Plus,
  Save,
  Send,
  Star,
  Trash2,
  Users,
} from "lucide-react"
import {
  type ChangeEvent,
  type ComponentType,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react"

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
import {
  useAddCertification,
  useDeleteCertification,
  useMyCertifications,
  useMyCoachProfile,
  usePublishMyProfile,
  useUpdateMyCoachProfile,
} from "../hooks/use-coach-queries"

const skillOptions = [
  { value: "Beginner Coaching", label: "Dạy người mới" },
  { value: "Advanced Strategy", label: "Dạy nâng cao" },
  { value: "Kids Coaching", label: "Dạy trẻ em" },
  { value: "Tournament Coaching", label: "Huấn luyện thi đấu" },
] as const

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

function getCertStatusLabel(status: string) {
  switch (status) {
    case "VERIFIED":
      return "Đã xác minh"
    case "PENDING":
      return "Chờ duyệt"
    case "REJECTED":
      return "Từ chối"
    default:
      return "Chưa xác minh"
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

export function CoachProfileForm() {
  const session = useSession()
  const { data: profile, isLoading: profileLoading } = useMyCoachProfile({ enabled: !!session?.user })
  const { data: certs, isLoading: certsLoading } = useMyCertifications({ enabled: !!session?.user })
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
  const [avatarFileName, setAvatarFileName] = useState("Chưa tải ảnh mới")

  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [certDialogOpen, setCertDialogOpen] = useState(false)
  const [certName, setCertName] = useState("")
  const [certOrg, setCertOrg] = useState("")
  const [certIssuedAt, setCertIssuedAt] = useState("")
  const [certFileUrl, setCertFileUrl] = useState("")
  const [certFileName, setCertFileName] = useState("")

  const certifications = certs ?? []

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayName(profile.displayName)
      setBio(profile.bio ?? "")
      setLocationCity(profile.locationCity ?? "")
      setYearsExperience(String(profile.yearsExperience ?? 0))
      setAvatarUrl(profile.avatarUrl ?? "")
      setSelectedSkills(profile.specialties ?? [])
    }
  }, [profile])

  const verifiedCount = useMemo(
    () => certifications.filter((c) => c.verificationStatus === "VERIFIED").length,
    [certifications]
  )
  const pendingCount = useMemo(
    () => certifications.filter((c) => c.verificationStatus === "PENDING" || c.verificationStatus === "UNVERIFIED").length,
    [certifications]
  )

  const openBasicInfoEditor = () => {
    setDisplayName(profile?.displayName ?? "")
    setBio(profile?.bio ?? "")
    setLocationCity(profile?.locationCity ?? "")
    setYearsExperience(String(profile?.yearsExperience ?? 0))
    setAvatarUrl(profile?.avatarUrl ?? "")
    setAvatarFileName("Chưa tải ảnh mới")
    setIsEditingBasicInfo(true)
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setAvatarUrl(URL.createObjectURL(file))
    setAvatarFileName(file.name)
  }

  const handleBasicInfoSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const expYears = Number(yearsExperience)
    if (Number.isNaN(expYears) || expYears < 0) return

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
    setCertIssuedAt(new Date().toISOString().slice(0, 10))
    setCertFileUrl("")
    setCertFileName("")
    setCertDialogOpen(true)
  }

  const handleCertificationFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setCertFileUrl(URL.createObjectURL(file))
    setCertFileName(file.name)
  }

  const handleCertificationSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = certName.trim()
    const org = certOrg.trim()
    if (!name) return

    addCert.mutate({
      name,
      issuingOrganization: org || undefined,
      issuedAt: certIssuedAt || undefined,
      documentUrl: certFileUrl || undefined,
    })
    setCertDialogOpen(false)
  }

  const handleCertificationDelete = (certId: string) => {
    deleteCert.mutate(certId)
  }

  if (profileLoading || certsLoading) {
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

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border bg-linear-to-br from-primary/15 via-sky-500/10 to-emerald-500/10 p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Hồ sơ chuyên môn huấn luyện viên
              </h2>
              <p className="text-sm text-muted-foreground md:text-base">
                Cập nhật thông tin cơ bản, chứng chỉ, chuyên môn và mô tả phương
                pháp giảng dạy trong một màn hình duy nhất.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-90 lg:grid-cols-2">
            <div className="rounded-2xl border bg-background/80 p-4 backdrop-blur-sm">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                Chứng chỉ đã xác minh
              </p>
              <p className="mt-1 text-2xl font-semibold">{verifiedCount}</p>
            </div>
            <div className="rounded-2xl border bg-background/80 p-4 backdrop-blur-sm">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                Chứng chỉ chờ duyệt
              </p>
              <p className="mt-1 text-2xl font-semibold">{pendingCount}</p>
            </div>
            {profile?.status === "DRAFT" && (
              <Button
                type="button"
                className="rounded-full col-span-full"
                onClick={() => publishProfile.mutate()}
                disabled={publishProfile.isPending}
              >
                <Send className="size-4" />
                {publishProfile.isPending ? "Đang công khai..." : "Công khai hồ sơ"}
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
                  <CardTitle>Thông tin cơ bản</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Hiển thị avatar, tên, khu vực giảng dạy, bio và kinh nghiệm.
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
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={handleBasicInfoCancel}
                  >
                    Hủy
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {!isEditingBasicInfo ? (
                <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
                  <Avatar size="lg" className="size-20 rounded-3xl">
                    <AvatarImage src={profile?.avatarUrl ?? ""} alt={profile?.displayName} />
                    <AvatarFallback className="rounded-3xl text-lg font-semibold">
                      {profile ? getInitials(profile.displayName) : "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold">
                          {profile?.displayName ?? "Chưa có tên"}
                        </h3>
                        <Badge variant="secondary" className="rounded-full">
                          HLV Pickleball
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                          <MapPin className="size-4" />
                          {profile?.locationCity ?? "Chưa cập nhật"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                          <CalendarDays className="size-4" />
                          {profile?.yearsExperience ?? 0} năm kinh nghiệm
                        </span>
                      </div>
                    </div>

                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {profile?.bio ?? "Chưa có mô tả."}
                    </p>
                  </div>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleBasicInfoSave}>
                  <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start">
                    <div className="space-y-3">
                      <Avatar size="lg" className="size-24 rounded-3xl border">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="rounded-3xl text-lg font-semibold">
                          {getInitials(displayName || "?")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-2 rounded-2xl border border-dashed p-4">
                        <Label htmlFor="avatarUpload">Upload avatar</Label>
                        <Input
                          id="avatarUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                        <p className="text-xs text-muted-foreground">
                          {avatarFileName}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="displayName">Tên hiển thị</Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          placeholder="Mô tả ngắn về chuyên môn và phong cách huấn luyện"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="locationCity">Khu vực giảng dạy</Label>
                        <Input
                          id="locationCity"
                          value={locationCity}
                          onChange={(e) => setLocationCity(e.target.value)}
                          placeholder="TP.HCM"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="yearsExperience">
                          Số năm kinh nghiệm
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
                    <Button type="submit" className="rounded-full" disabled={updateProfile.isPending}>
                      <Save className="size-4" />
                      {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={handleBasicInfoCancel}
                    >
                      Hủy chỉnh sửa
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
                  <CardTitle>Chứng chỉ</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Quản lý chứng chỉ, file đính kèm và trạng thái xác minh.
                  </p>
                </div>

                <Button
                  type="button"
                  className="rounded-full"
                  onClick={openCreateCertificationDialog}
                  disabled={addCert.isPending}
                >
                  <Plus className="size-4" />
                  Thêm chứng chỉ
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {certifications.map((certification, index) => {
                const StatusIcon = getCertStatusIcon(certification.verificationStatus)

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
                            variant={getCertStatusColor(certification.verificationStatus) as "default" | "outline" | "destructive"}
                            className="rounded-full"
                          >
                            <StatusIcon className="size-3.5" />
                            {getCertStatusLabel(certification.verificationStatus)}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                            <Award className="size-4" />
                            {certification.issuingOrganization ?? "Không có tổ chức"}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                            <CalendarDays className="size-4" />
                            {certification.issuedAt
                              ? new Date(certification.issuedAt).toLocaleDateString("vi-VN")
                              : "Không có ngày"}
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
                            Xem tài liệu
                          </a>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full text-destructive hover:text-destructive"
                          onClick={() => handleCertificationDelete(certification.id)}
                          disabled={deleteCert.isPending}
                        >
                          <Trash2 className="size-4" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {certifications.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Chưa có chứng chỉ nào. Nhấn \u201CThêm chứng chỉ\u201D để bắt đầu.
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
                  <CardTitle>Kinh nghiệm &amp; chuyên môn</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Chọn chuyên môn bằng checkbox và lưu thay đổi.
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
                  {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">Chuyên môn đang chọn</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      Chưa chọn chuyên môn nào.
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
                  {profile?.bio ?? "Chưa có bio"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Thống kê giảng dạy</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Auto cập nhật từ dữ liệu hệ thống, không chỉnh sửa trực
                    tiếp.
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  Auto cập nhật
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={CalendarDays}
                label="Tổng số buổi đã dạy"
                value={profile ? String(profile.yearsExperience ?? 0) : "0"}
              />
              <StatCard
                icon={Users}
                label="Số học viên đã dạy"
                value={String(profile?.reviewCount ?? 0)}
              />
              <StatCard
                icon={Star}
                label="Rating trung bình"
                value={(profile?.averageRating ?? 0).toFixed(1)}
                suffix="/ 5"
              />
              <StatCard
                icon={CheckCircle2}
                label="Số lượt đánh giá"
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
            setCertFileUrl("")
            setCertFileName("")
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm chứng chỉ</DialogTitle>
            <DialogDescription>
              Nhập thông tin chứng chỉ để gửi lên hệ thống xác minh.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCertificationSave}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="certName">Tên chứng chỉ</Label>
                <Input
                  id="certName"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="IPTPA Level 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certOrg">Tổ chức cấp</Label>
                <Input
                  id="certOrg"
                  value={certOrg}
                  onChange={(e) => setCertOrg(e.target.value)}
                  placeholder="IPTPA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certIssuedAt">Ngày cấp</Label>
                <Input
                  id="certIssuedAt"
                  type="date"
                  value={certIssuedAt}
                  onChange={(e) => setCertIssuedAt(e.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="certFile">File chứng chỉ (URL)</Label>
                <Input
                  id="certFile"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleCertificationFileChange}
                />
                <div className="flex items-center gap-2 rounded-2xl border border-dashed px-3 py-2 text-sm text-muted-foreground">
                  <ImageIcon className="size-4" />
                  <span>{certFileName || "Chưa chọn file"}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCertDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={addCert.isPending || !certName.trim()}>
                <Save className="size-4" />
                {addCert.isPending ? "Đang lưu..." : "Lưu chứng chỉ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {updateProfile.isSuccess && (
        <p className="text-sm font-medium text-green-600">
          Đã cập nhật hồ sơ thành công!
        </p>
      )}

      {publishProfile.isSuccess && (
        <p className="text-sm font-medium text-green-600">
          Hồ sơ đã được công khai!
        </p>
      )}

      {addCert.isSuccess && (
        <p className="text-sm font-medium text-green-600">
          Đã thêm chứng chỉ thành công!
        </p>
      )}

      {deleteCert.isSuccess && (
        <p className="text-sm font-medium text-green-600">
          Đã xóa chứng chỉ!
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
