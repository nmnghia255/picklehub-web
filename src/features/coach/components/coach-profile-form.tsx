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
  Star,
  Trash2,
  Upload,
  Users,
} from "lucide-react"
import {
  type ChangeEvent,
  type ComponentType,
  type FormEvent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

type CoachCertification = {
  id: string
  name: string
  organization: string
  level: 1 | 2 | 3
  year: number
  verified: boolean
  fileUrl: string
  fileName: string
}

type CoachProfile = {
  id: string
  name: string
  avatar: string
  bio: string
  location: string
  experienceYears: number
  certifications: CoachCertification[]
  skills: string[]
  teachingMethod: string
  stats: {
    totalSessions: number
    totalStudents: number
    rating: number
    totalReviews: number
  }
}

const skillOptions = [
  { value: "Beginner Coaching", label: "Dạy người mới" },
  { value: "Advanced Strategy", label: "Dạy nâng cao" },
  { value: "Kids Coaching", label: "Dạy trẻ em" },
  { value: "Tournament Coaching", label: "Huấn luyện thi đấu" },
] as const

type BasicInfoDraft = {
  avatar: string
  bio: string
  location: string
  experienceYears: string
  avatarFileName: string
}

type CertificationDraft = {
  name: string
  organization: string
  level: "1" | "2" | "3"
  year: string
  verified: "verified" | "pending"
  fileUrl: string
  fileName: string
}

const emptyCertificationDraft: CertificationDraft = {
  name: "",
  organization: "",
  level: "1",
  year: String(new Date().getFullYear()),
  verified: "pending",
  fileUrl: "",
  fileName: "",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function createCertificationDraft(
  certification?: CoachCertification
): CertificationDraft {
  if (!certification) return emptyCertificationDraft

  return {
    name: certification.name,
    organization: certification.organization,
    level: String(certification.level) as CertificationDraft["level"],
    year: String(certification.year),
    verified: certification.verified ? "verified" : "pending",
    fileUrl: certification.fileUrl,
    fileName: certification.fileName,
  }
}

const emptyCoach: CoachProfile = {
  id: "",
  name: "",
  avatar: "",
  bio: "",
  location: "",
  experienceYears: 0,
  certifications: [],
  skills: [],
  teachingMethod: "",
  stats: {
    totalSessions: 0,
    totalStudents: 0,
    rating: 0,
    totalReviews: 0,
  },
}

export function CoachProfileForm() {
  const [coach, setCoach] = useState<CoachProfile>(emptyCoach)
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false)
  const [basicInfoDraft, setBasicInfoDraft] = useState<BasicInfoDraft>({
    avatar: "",
    bio: "",
    location: "",
    experienceYears: "0",
    avatarFileName: "Chưa tải ảnh mới",
  })
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [teachingMethodDraft, setTeachingMethodDraft] = useState("")
  const [certifications, setCertifications] = useState<CoachCertification[]>([])
  const [certDialogOpen, setCertDialogOpen] = useState(false)
  const [certDialogMode, setCertDialogMode] = useState<"create" | "edit">(
    "create"
  )
  const [editingCertificationId, setEditingCertificationId] = useState<
    string | null
  >(null)
  const [certificationDraft, setCertificationDraft] =
    useState<CertificationDraft>(emptyCertificationDraft)

  const verifiedCount = useMemo(
    () => certifications.filter((item) => item.verified).length,
    [certifications]
  )

  const pendingCount = certifications.length - verifiedCount

  const openBasicInfoEditor = () => {
    setBasicInfoDraft({
      avatar: coach.avatar,
      bio: coach.bio,
      location: coach.location,
      experienceYears: String(coach.experienceYears),
      avatarFileName: "Chưa tải ảnh mới",
    })
    setIsEditingBasicInfo(true)
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setBasicInfoDraft((prev) => ({
      ...prev,
      avatar: URL.createObjectURL(file),
      avatarFileName: file.name,
    }))
  }

  const handleBasicInfoSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextExperienceYears = Number(basicInfoDraft.experienceYears)
    if (Number.isNaN(nextExperienceYears) || nextExperienceYears < 0) {
      return
    }

    setCoach((prev) => ({
      ...prev,
      avatar: basicInfoDraft.avatar,
      bio: basicInfoDraft.bio.trim(),
      location: basicInfoDraft.location.trim(),
      experienceYears: nextExperienceYears,
    }))
    setIsEditingBasicInfo(false)
  }

  const handleBasicInfoCancel = () => {
    setIsEditingBasicInfo(false)
  }

  const openCreateCertificationDialog = () => {
    setCertDialogMode("create")
    setEditingCertificationId(null)
    setCertificationDraft(emptyCertificationDraft)
    setCertDialogOpen(true)
  }

  const openEditCertificationDialog = (certification: CoachCertification) => {
    setCertDialogMode("edit")
    setEditingCertificationId(certification.id)
    setCertificationDraft(createCertificationDraft(certification))
    setCertDialogOpen(true)
  }

  const handleCertificationFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setCertificationDraft((prev) => ({
      ...prev,
      fileUrl: URL.createObjectURL(file),
      fileName: file.name,
    }))
  }

  const handleCertificationSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = certificationDraft.name.trim()
    const organization = certificationDraft.organization.trim()
    const year = Number(certificationDraft.year)

    if (!name || !organization || Number.isNaN(year)) {
      return
    }

    const nextCertification: CoachCertification = {
      id: editingCertificationId ?? `cert-${Date.now()}`,
      name,
      organization,
      level: Number(certificationDraft.level) as CoachCertification["level"],
      year,
      verified: certificationDraft.verified === "verified",
      fileUrl: certificationDraft.fileUrl || "",
      fileName: certificationDraft.fileName || "",
    }

    setCertifications((prev) =>
      certDialogMode === "edit"
        ? prev.map((item) =>
            item.id === nextCertification.id ? nextCertification : item
          )
        : [nextCertification, ...prev]
    )

    setCertDialogOpen(false)
    setEditingCertificationId(null)
    setCertificationDraft(emptyCertificationDraft)
  }

  const handleCertificationDelete = (certificationId: string) => {
    setCertifications((prev) =>
      prev.filter((item) => item.id !== certificationId)
    )
  }

  const handleSkillToggle = (value: string) => {
    setSelectedSkills((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }

  const handleTeachingMethodSave = () => {
    setCoach((prev) => ({
      ...prev,
      skills: selectedSkills,
      teachingMethod: teachingMethodDraft.trim(),
    }))
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
                    <AvatarImage src={coach.avatar} alt={coach.name} />
                    <AvatarFallback className="rounded-3xl text-lg font-semibold">
                      {getInitials(coach.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold">{coach.name}</h3>
                        <Badge variant="secondary" className="rounded-full">
                          HLV Pickleball
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                          <MapPin className="size-4" />
                          {coach.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                          <CalendarDays className="size-4" />
                          {coach.experienceYears} năm kinh nghiệm
                        </span>
                      </div>
                    </div>

                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {coach.bio}
                    </p>
                  </div>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleBasicInfoSave}>
                  <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start">
                    <div className="space-y-3">
                      <Avatar size="lg" className="size-24 rounded-3xl border">
                        <AvatarImage
                          src={basicInfoDraft.avatar}
                          alt={coach.name}
                        />
                        <AvatarFallback className="rounded-3xl text-lg font-semibold">
                          {getInitials(coach.name)}
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
                          {basicInfoDraft.avatarFileName}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Họ tên</Label>
                        <Input value={coach.name || ""} disabled />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={basicInfoDraft.bio}
                          onChange={(event) =>
                            setBasicInfoDraft((prev) => ({
                              ...prev,
                              bio: event.target.value,
                            }))
                          }
                          rows={4}
                          placeholder="Mô tả ngắn về chuyên môn và phong cách huấn luyện"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Khu vực giảng dạy</Label>
                        <Input
                          id="location"
                          value={basicInfoDraft.location}
                          onChange={(event) =>
                            setBasicInfoDraft((prev) => ({
                              ...prev,
                              location: event.target.value,
                            }))
                          }
                          placeholder="TP.HCM"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experienceYears">
                          Số năm kinh nghiệm
                        </Label>
                        <Input
                          id="experienceYears"
                          type="number"
                          min={0}
                          value={basicInfoDraft.experienceYears}
                          onChange={(event) =>
                            setBasicInfoDraft((prev) => ({
                              ...prev,
                              experienceYears: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" className="rounded-full">
                      <Save className="size-4" />
                      Lưu thay đổi
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
                >
                  <Plus className="size-4" />
                  Thêm chứng chỉ
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {certifications.map((certification) => (
                <div
                  key={certification.id}
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
                            certification.verified ? "default" : "outline"
                          }
                          className="rounded-full"
                        >
                          {certification.verified ? (
                            <>
                              <CheckCircle2 className="size-3.5" />
                              Verified
                            </>
                          ) : (
                            <>
                              <Clock3 className="size-3.5" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                          <Award className="size-4" />
                          {certification.organization}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                          Level {certification.level}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                          <CalendarDays className="size-4" />
                          {certification.year}
                        </span>
                      </div>

                      <a
                        href={certification.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        <FileText className="size-4" />
                        {certification.fileName}
                      </a>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() =>
                          openEditCertificationDialog(certification)
                        }
                      >
                        <Edit3 className="size-4" />
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full text-destructive hover:text-destructive"
                        onClick={() =>
                          handleCertificationDelete(certification.id)
                        }
                      >
                        <Trash2 className="size-4" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
                    Chọn chuyên môn bằng checkbox và lưu mô tả phương pháp giảng
                    dạy.
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  Dữ liệu cục bộ
                </Badge>
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

              <div className="space-y-2">
                <Label htmlFor="teachingMethod">
                  Mô tả phương pháp giảng dạy
                </Label>
                <Textarea
                  id="teachingMethod"
                  rows={5}
                  value={teachingMethodDraft}
                  onChange={(event) =>
                    setTeachingMethodDraft(event.target.value)
                  }
                  placeholder="Mô tả phong cách huấn luyện, giáo án và cách tương tác với học viên"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="rounded-full"
                  onClick={handleTeachingMethodSave}
                >
                  <Save className="size-4" />
                  Lưu thay đổi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                >
                  <Upload className="size-4" />
                  Tải lên
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
                  {coach.teachingMethod}
                </div>
                <p className="mt-2">
                  Phần này sẽ được kết nối với dữ liệu thực khi có API.
                </p>
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
                value={coach.stats.totalSessions.toString()}
              />
              <StatCard
                icon={Users}
                label="Số học viên đã dạy"
                value={coach.stats.totalStudents.toString()}
              />
              <StatCard
                icon={Star}
                label="Rating trung bình"
                value={coach.stats.rating.toFixed(1)}
                suffix="/ 5"
              />
              <StatCard
                icon={CheckCircle2}
                label="Số lượt đánh giá"
                value={coach.stats.totalReviews.toString()}
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
            setEditingCertificationId(null)
            setCertificationDraft(emptyCertificationDraft)
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {certDialogMode === "create" ? "Thêm chứng chỉ" : "Sửa chứng chỉ"}
            </DialogTitle>
            <DialogDescription>
              Tải file và cập nhật các trường chứng chỉ ngay trong dialog.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCertificationSave}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="certName">Tên chứng chỉ</Label>
                <Input
                  id="certName"
                  value={certificationDraft.name}
                  onChange={(event) =>
                    setCertificationDraft((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="IPTPA Level 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certOrg">Tổ chức cấp</Label>
                <Input
                  id="certOrg"
                  value={certificationDraft.organization}
                  onChange={(event) =>
                    setCertificationDraft((prev) => ({
                      ...prev,
                      organization: event.target.value,
                    }))
                  }
                  placeholder="IPTPA"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Cấp độ</Label>
                <Select
                  value={certificationDraft.level}
                  onValueChange={(value) =>
                    setCertificationDraft((prev) => ({
                      ...prev,
                      level: value as CertificationDraft["level"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certYear">Năm cấp</Label>
                <Input
                  id="certYear"
                  type="number"
                  min={2000}
                  max={2100}
                  value={certificationDraft.year}
                  onChange={(event) =>
                    setCertificationDraft((prev) => ({
                      ...prev,
                      year: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Trạng thái xác minh</Label>
                <Select
                  value={certificationDraft.verified}
                  onValueChange={(value) =>
                    setCertificationDraft((prev) => ({
                      ...prev,
                      verified: value as CertificationDraft["verified"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="certFile">File chứng chỉ</Label>
                <Input
                  id="certFile"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleCertificationFileChange}
                />
                <div className="flex items-center gap-2 rounded-2xl border border-dashed px-3 py-2 text-sm text-muted-foreground">
                  <ImageIcon className="size-4" />
                  <span>{certificationDraft.fileName || "Chưa chọn file"}</span>
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
              <Button type="submit">
                <Save className="size-4" />
                Lưu chứng chỉ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
