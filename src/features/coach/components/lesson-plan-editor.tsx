"use client"

import {
  ArrowDown,
  ArrowUp,
  Check,
  Edit3,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  type DrillDifficulty,
  drills,
  type LessonLevel,
  type LessonPlan,
  type LessonSection,
} from "@/features/coach/data/mockLessonPlan"
import {
  createLessonPlanId,
  findLessonPlanById,
  getLessonPlansFromStorage,
  saveLessonPlansToStorage,
} from "@/features/coach/lib/lesson-plan-storage"

type LessonPlanDraft = {
  name: string
  level: LessonLevel
  duration: string
  description: string
  sections: LessonSection[]
}

type SectionDraft = {
  title: string
  duration: string
  description: string
}

const emptySectionDraft: SectionDraft = {
  title: "",
  duration: "10",
  description: "",
}

function createPlanDraft(plan?: LessonPlan): LessonPlanDraft {
  if (!plan) {
    return {
      name: "",
      level: "Beginner",
      duration: "60",
      description: "",
      sections: [],
    }
  }

  return {
    name: plan.name,
    level: plan.level,
    duration: String(plan.duration),
    description: plan.description,
    sections: plan.sections.map((section) => ({
      ...section,
      drillIds: [...section.drillIds],
    })),
  }
}

function createSectionId() {
  return `section-${Date.now()}`
}

function difficultyVariant(difficulty: DrillDifficulty) {
  if (difficulty === "Easy") return "secondary"
  if (difficulty === "Medium") return "outline"
  return "default"
}

interface LessonPlanEditorProps {
  lessonPlanId?: string
}

export function LessonPlanEditor({ lessonPlanId }: LessonPlanEditorProps) {
  const [plans, setPlans] = useState<LessonPlan[]>(() =>
    getLessonPlansFromStorage()
  )
  const [draft, setDraft] = useState<LessonPlanDraft>(() => {
    const storedPlans = getLessonPlansFromStorage()
    const plan = lessonPlanId
      ? findLessonPlanById(storedPlans, lessonPlanId)
      : undefined

    return createPlanDraft(plan)
  })
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [sectionDialogMode, setSectionDialogMode] = useState<"create" | "edit">(
    "create"
  )
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [sectionDraft, setSectionDraft] =
    useState<SectionDraft>(emptySectionDraft)
  const [drillDialogOpen, setDrillDialogOpen] = useState(false)
  const [drillTargetSectionId, setDrillTargetSectionId] = useState<
    string | null
  >(null)
  const [drillSearch, setDrillSearch] = useState("")
  const [drillDifficulty, setDrillDifficulty] = useState<
    DrillDifficulty | "all"
  >("all")

  const isEditMode = Boolean(lessonPlanId)

  const currentPlan = useMemo(() => {
    if (!lessonPlanId) {
      return null
    }

    return findLessonPlanById(plans, lessonPlanId) ?? null
  }, [lessonPlanId, plans])

  const filteredDrills = useMemo(() => {
    return drills.filter((drill) => {
      const matchesSearch = drill.name
        .toLowerCase()
        .includes(drillSearch.toLowerCase())
      const matchesDifficulty =
        drillDifficulty === "all" || drill.difficulty === drillDifficulty

      return matchesSearch && matchesDifficulty
    })
  }, [drillDifficulty, drillSearch])

  const handleFieldChange = (field: keyof LessonPlanDraft, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSectionSave = () => {
    const title = sectionDraft.title.trim()
    const duration = Number(sectionDraft.duration)

    if (!title || Number.isNaN(duration) || duration <= 0) {
      return
    }

    if (sectionDialogMode === "create") {
      const nextSection: LessonSection = {
        id: createSectionId(),
        title,
        duration,
        description: sectionDraft.description.trim(),
        drillIds: [],
      }

      setDraft((prev) => ({
        ...prev,
        sections: [...prev.sections, nextSection],
      }))
    } else if (editingSectionId) {
      setDraft((prev) => ({
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === editingSectionId
            ? {
                ...section,
                title,
                duration,
                description: sectionDraft.description.trim(),
              }
            : section
        ),
      }))
    }

    setSectionDialogOpen(false)
    setEditingSectionId(null)
    setSectionDraft(emptySectionDraft)
  }

  const openSectionCreateDialog = () => {
    setSectionDialogMode("create")
    setEditingSectionId(null)
    setSectionDraft(emptySectionDraft)
    setSectionDialogOpen(true)
  }

  const openSectionEditDialog = (section: LessonSection) => {
    setSectionDialogMode("edit")
    setEditingSectionId(section.id)
    setSectionDraft({
      title: section.title,
      duration: String(section.duration),
      description: section.description,
    })
    setSectionDialogOpen(true)
  }

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    setDraft((prev) => {
      const index = prev.sections.findIndex(
        (section) => section.id === sectionId
      )
      if (index < 0) return prev

      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.sections.length) return prev

      const nextSections = [...prev.sections]
      const [item] = nextSections.splice(index, 1)
      nextSections.splice(targetIndex, 0, item)

      return {
        ...prev,
        sections: nextSections,
      }
    })
  }

  const removeSection = (sectionId: string) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }))
  }

  const openDrillDialog = (sectionId: string) => {
    setDrillTargetSectionId(sectionId)
    setDrillSearch("")
    setDrillDifficulty("all")
    setDrillDialogOpen(true)
  }

  const addDrillToSection = (drillId: string) => {
    if (!drillTargetSectionId) return

    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id !== drillTargetSectionId) {
          return section
        }

        if (section.drillIds.includes(drillId)) {
          return section
        }

        return {
          ...section,
          drillIds: [...section.drillIds, drillId],
        }
      }),
    }))
  }

  const removeDrillFromSection = (sectionId: string, drillId: string) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              drillIds: section.drillIds.filter((id) => id !== drillId),
            }
          : section
      ),
    }))
  }

  const handleSave = () => {
    const name = draft.name.trim()
    const duration = Number(draft.duration)

    if (!name || Number.isNaN(duration) || duration <= 0) {
      return
    }

    const nextPlan: LessonPlan = {
      id: currentPlan?.id ?? createLessonPlanId(),
      name,
      level: draft.level,
      duration,
      description: draft.description.trim(),
      usageCount: currentPlan?.usageCount ?? 0,
      sections: draft.sections,
    }

    setPlans((prev) => {
      const nextPlans = isEditMode
        ? prev.map((plan) => (plan.id === nextPlan.id ? nextPlan : plan))
        : [nextPlan, ...prev]

      saveLessonPlansToStorage(nextPlans)
      return nextPlans
    })

    window.location.assign(`/coach/curriculum/${nextPlan.id}`)
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>
                {isEditMode ? "Chỉnh sửa giáo án" : "Tạo giáo án mới"}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Nhập thông tin chung, thêm sections và gắn drills cho từng phần.
              </p>
            </div>

            <Button asChild variant="outline" className="rounded-full">
              <Link href="/coach/curriculum">Quay lại danh sách</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="planName">Tên giáo án</Label>
              <Input
                id="planName"
                value={draft.name}
                onChange={(event) =>
                  handleFieldChange("name", event.target.value)
                }
                placeholder="Beginner Session 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={draft.level}
                onValueChange={(value) => handleFieldChange("level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planDuration">Thời lượng (phút)</Label>
              <Input
                id="planDuration"
                type="number"
                min={1}
                value={draft.duration}
                onChange={(event) =>
                  handleFieldChange("duration", event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="planDescription">Mô tả</Label>
              <Textarea
                id="planDescription"
                rows={4}
                value={draft.description}
                onChange={(event) =>
                  handleFieldChange("description", event.target.value)
                }
                placeholder="Buổi học cơ bản cho người mới"
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Sections</h3>
              <p className="text-sm text-muted-foreground">
                Thêm section, sắp xếp lại thứ tự và gắn drills vào từng phần.
              </p>
            </div>

            <Button
              type="button"
              className="rounded-full"
              onClick={openSectionCreateDialog}
            >
              <Plus className="size-4" />
              Thêm section
            </Button>
          </div>

          <div className="space-y-4">
            {draft.sections.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Chưa có section nào. Thêm section đầu tiên để bắt đầu.
              </div>
            ) : (
              draft.sections.map((section, index) => {
                const sectionDrills = section.drillIds
                  .map((drillId) => drills.find((item) => item.id === drillId))
                  .filter(Boolean)

                return (
                  <Card key={section.id} className="rounded-2xl border">
                    <CardHeader className="space-y-3">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-base">
                              {index + 1}. {section.title}
                            </CardTitle>
                            <Badge variant="secondary" className="rounded-full">
                              {section.duration} phút
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {section.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => moveSection(section.id, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => moveSection(section.id, "down")}
                            disabled={index === draft.sections.length - 1}
                          >
                            <ArrowDown className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => openSectionEditDialog(section)}
                          >
                            <Edit3 className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full text-destructive hover:text-destructive"
                            onClick={() => removeSection(section.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex flex-col gap-3 rounded-2xl border bg-muted/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">
                              Drills trong section
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Đang có {section.drillIds.length} drill.
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => openDrillDialog(section.id)}
                          >
                            <Plus className="size-4" />
                            Thêm drill
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {sectionDrills.length === 0 ? (
                            <span className="text-sm text-muted-foreground">
                              Chưa gắn drill nào.
                            </span>
                          ) : (
                            sectionDrills.map((drill) => (
                              <Badge
                                key={drill!.id}
                                variant="secondary"
                                className="rounded-full px-3 py-1"
                              >
                                {drill!.name}
                                <button
                                  type="button"
                                  className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-background/60 text-[10px]"
                                  onClick={() =>
                                    removeDrillFromSection(
                                      section.id,
                                      drill!.id
                                    )
                                  }
                                  aria-label={`Xóa drill ${drill!.name}`}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" className="rounded-full" onClick={handleSave}>
              <Save className="size-4" />
              Lưu giáo án
            </Button>
            <Button
              asChild
              type="button"
              variant="outline"
              className="rounded-full"
            >
              <Link href="/coach/curriculum">Hủy</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={sectionDialogOpen}
        onOpenChange={(open) => {
          setSectionDialogOpen(open)
          if (!open) {
            setEditingSectionId(null)
            setSectionDraft(emptySectionDraft)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {sectionDialogMode === "create" ? "Thêm section" : "Sửa section"}
            </DialogTitle>
            <DialogDescription>
              Nhập tên, thời lượng và mô tả cho nội dung buổi học.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sectionTitle">Tên section</Label>
              <Input
                id="sectionTitle"
                value={sectionDraft.title}
                onChange={(event) =>
                  setSectionDraft((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                placeholder="Khởi động"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectionDuration">Thời lượng (phút)</Label>
              <Input
                id="sectionDuration"
                type="number"
                min={1}
                value={sectionDraft.duration}
                onChange={(event) =>
                  setSectionDraft((prev) => ({
                    ...prev,
                    duration: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectionDescription">Mô tả</Label>
              <Textarea
                id="sectionDescription"
                rows={4}
                value={sectionDraft.description}
                onChange={(event) =>
                  setSectionDraft((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Giãn cơ và làm nóng"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSectionDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleSectionSave}>
              Lưu section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={drillDialogOpen}
        onOpenChange={(open) => {
          setDrillDialogOpen(open)
          if (!open) {
            setDrillTargetSectionId(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chọn drill</DialogTitle>
            <DialogDescription>
              Tìm theo tên, lọc theo độ khó và click để thêm vào section.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={drillSearch}
                  onChange={(event) => setDrillSearch(event.target.value)}
                  className="pl-9"
                  placeholder="Tìm drill theo tên"
                />
              </div>

              <Select
                value={drillDifficulty}
                onValueChange={(value) =>
                  setDrillDifficulty(value as DrillDifficulty | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lọc độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {filteredDrills.map((drill) => {
                const alreadyAdded =
                  drillTargetSectionId !== null &&
                  draft.sections.some(
                    (section) =>
                      section.id === drillTargetSectionId &&
                      section.drillIds.includes(drill.id)
                  )

                return (
                  <button
                    key={drill.id}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors hover:bg-muted/30"
                    onClick={() => addDrillToSection(drill.id)}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{drill.name}</span>
                        <Badge
                          variant={difficultyVariant(drill.difficulty)}
                          className="rounded-full"
                        >
                          {drill.difficulty}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {drill.players} người chơi
                      </p>
                    </div>

                    {alreadyAdded ? (
                      <Badge variant="secondary" className="rounded-full">
                        <Check className="size-3.5" />
                        Đã thêm
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full">
                        Thêm
                      </Badge>
                    )}
                  </button>
                )
              })}

              {filteredDrills.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Không tìm thấy drill phù hợp.
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrillDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
