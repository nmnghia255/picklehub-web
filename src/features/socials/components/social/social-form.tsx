"use client"

import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { startTransition, useEffect, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useSocialsTranslation } from "@/features/socials/use-socials-translation"

import { mockSocials } from "../../mockData"
import type {
  AgeGroup,
  GenderPolicy,
  HostRole,
  SocialFormat,
  SocialStatus,
} from "../../types"
export function SocialForm() {
  const { t } = useSocialsTranslation()
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params.id as string | undefined
  const isEditMode = Boolean(id)
  const social = isEditMode ? mockSocials.find((s) => s.id === id) : null

  const [formData, setFormData] = useState({
    title: "",
    note: "",
    format: "SOCIAL" as SocialFormat,
    startTime: "",
    endTime: "",
    genderPolicy: "MIXED" as GenderPolicy,
    ageGroup: "ADULT" as AgeGroup,
    minimumLevel: 2.0,
    maximumLevel: 4.0,
    maxSlots: 24,
    hostRole: "HOST_AND_PLAY" as HostRole,
    isPrivate: false,
    autoApproveJoinRequests: true,
    submitDupr: false,
    cancellationFreezeHours: 24,
    totalExpense: 0,
    paymentCode: "",
    paymentNote: "",
    status: "DRAFT" as SocialStatus,
  })

  type PlaySessionDraft = {
    title: string
    startTime: string
    endTime: string
    maxSlots: number
  }

  const [playSessions, setPlaySessions] = useState<PlaySessionDraft[]>([])

  useEffect(() => {
    if (!social) return

    startTransition(() => {
      setFormData({
        title: social.title,
        note: social.note,
        format: social.format,
        startTime: new Date(social.startTime).toISOString().slice(0, 16),
        endTime: new Date(social.endTime).toISOString().slice(0, 16),
        genderPolicy: social.genderPolicy,
        ageGroup: social.ageGroup,
        minimumLevel: social.minimumLevel || 2.0,
        maximumLevel: social.maximumLevel || 4.0,
        maxSlots: social.maxSlots,
        hostRole: social.hostRole,
        isPrivate: social.isPrivate,
        autoApproveJoinRequests: social.autoApproveJoinRequests,
        submitDupr: social.submitDupr,
        cancellationFreezeHours: social.cancellationFreezeHours,
        totalExpense: social.totalExpense || 0,
        paymentCode: social.paymentCode || "",
        paymentNote: social.paymentNote || "",
        status: social.status,
      })
    })
  }, [social])

  const handleSubmit = () => {
    console.log("Saving social:", formData, playSessions)
    alert(isEditMode ? t("form.updateSuccess") : t("form.createSuccess"))
    router.push("/socials")
  }

  const addPlaySession = () => {
    setPlaySessions([
      ...playSessions,
      {
        title: "",
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxSlots: 16,
      },
    ])
  }

  const removePlaySession = (index: number) =>
    setPlaySessions(playSessions.filter((_, i) => i !== index))

  const updatePlaySession = (
    index: number,
    field: keyof PlaySessionDraft,
    value: string | number
  ) => {
    setPlaySessions((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {isEditMode ? t("form.editTitle") : t("form.createTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("form.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="p-0">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">
                {t("form.basicInformation")}
              </h2>
              <div className="space-y-4">
                <Field label={t("form.socialTitle")}>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder={t("form.socialTitlePlaceholder")}
                    required
                  />
                </Field>

                <Field label={t("form.description")}>
                  <Textarea
                    rows={4}
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    placeholder={t("form.descriptionPlaceholder")}
                    required
                  />
                </Field>

                <Field label={t("form.format")}>
                  <Select
                    value={formData.format}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        format: value as SocialFormat,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.format")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOCIAL">
                        {t("labels.social")}
                      </SelectItem>
                      <SelectItem value="TOURNAMENT">
                        {t("labels.tournament")}
                      </SelectItem>
                      <SelectItem value="TRAINING">
                        {t("labels.training")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">{t("form.schedule")}</h2>
              <div className="space-y-4">
                <Field label={t("form.startTime")}>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                  />
                </Field>

                <Field label={t("form.endTime")}>
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                  />
                </Field>

                {formData.startTime &&
                  formData.endTime &&
                  new Date(formData.endTime) <=
                    new Date(formData.startTime) && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {t("form.validationEndAfterStart")}
                      </AlertDescription>
                    </Alert>
                  )}

                <Field label={t("form.cancellationFreeze")}>
                  <Input
                    type="number"
                    value={formData.cancellationFreezeHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cancellationFreezeHours: parseInt(e.target.value) || 0,
                      })
                    }
                    min={0}
                    max={168}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">
                {t("form.participationRules")}
              </h2>
              <div className="space-y-4">
                <Field label={t("form.maximumParticipants")}>
                  <Input
                    type="number"
                    value={formData.maxSlots}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxSlots: parseInt(e.target.value) || 0,
                      })
                    }
                    min={1}
                    max={200}
                    required
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("form.genderPolicy")}>
                    <Select
                      value={formData.genderPolicy}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          genderPolicy: value as GenderPolicy,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("filters.selectGenderPolicy")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MIXED">
                          {t("labels.mixed")}
                        </SelectItem>
                        <SelectItem value="MALE_ONLY">
                          {t("labels.menOnly")}
                        </SelectItem>
                        <SelectItem value="FEMALE_ONLY">
                          {t("labels.womenOnly")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label={t("form.ageGroup")}>
                    <Select
                      value={formData.ageGroup}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          ageGroup: value as AgeGroup,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("filters.selectAgeGroup")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JUNIOR">
                          {t("labels.junior")}
                        </SelectItem>
                        <SelectItem value="ADULT">
                          {t("labels.adult")}
                        </SelectItem>
                        <SelectItem value="SENIOR">
                          {t("labels.senior")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("form.minimumSkillLevel")}>
                    <Input
                      type="number"
                      value={formData.minimumLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minimumLevel: parseFloat(e.target.value) || 0,
                        })
                      }
                      min={1}
                      max={5.5}
                      step={0.5}
                    />
                  </Field>
                  <Field label={t("form.maximumSkillLevel")}>
                    <Input
                      type="number"
                      value={formData.maximumLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maximumLevel: parseFloat(e.target.value) || 0,
                        })
                      }
                      min={1}
                      max={5.5}
                      step={0.5}
                    />
                  </Field>
                </div>

                <Field label={t("form.hostRole")}>
                  <Select
                    value={formData.hostRole}
                    onValueChange={(value) =>
                      setFormData({ ...formData, hostRole: value as HostRole })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.hostRole")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOST_ONLY">
                        {t("sidebar.hostRoleHostOnly")}
                      </SelectItem>
                      <SelectItem value="HOST_AND_PLAY">
                        {t("sidebar.hostRoleHostAndPlay")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <ToggleRow
                  label={t("form.submitDupr")}
                  checked={formData.submitDupr}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, submitDupr: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">
                {t("form.paymentSetup")}
              </h2>
              <div className="space-y-4">
                <Field label={t("form.totalExpensePerPerson")}>
                  <div className="flex items-center gap-2 rounded-md border border-input bg-transparent px-3">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      className="border-0 px-0 shadow-none focus-visible:ring-0"
                      type="number"
                      value={formData.totalExpense}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalExpense: parseFloat(e.target.value) || 0,
                        })
                      }
                      min={0}
                      step={1}
                    />
                  </div>
                </Field>

                <Field label={t("form.paymentCode")}>
                  <Input
                    value={formData.paymentCode}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentCode: e.target.value })
                    }
                    placeholder={t("form.paymentCodePlaceholder")}
                  />
                </Field>

                <Field label={t("form.paymentInstructions")}>
                  <Textarea
                    rows={2}
                    value={formData.paymentNote}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentNote: e.target.value })
                    }
                    placeholder={t("form.paymentInstructionsPlaceholder")}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {t("form.playSessions")} ({playSessions.length})
                </h2>
                <Button variant="outline" onClick={addPlaySession}>
                  <Plus className="size-4" />
                  {t("form.addPlaySession")}
                </Button>
              </div>

              {playSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-sm text-muted-foreground">
                  {t("form.addPlaySessionsHint")}
                </div>
              ) : (
                <div className="space-y-4">
                  {playSessions.map((session, index) => (
                    <Card key={index} className="p-0">
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold">
                            {t("form.sessionTitle")} {index + 1}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removePlaySession(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>

                        <Field label={t("form.sessionTitle")}>
                          <Input
                            value={session.title}
                            onChange={(e) =>
                              updatePlaySession(index, "title", e.target.value)
                            }
                            placeholder={t("form.sessionTitlePlaceholder")}
                          />
                        </Field>

                        <div className="grid gap-4 md:grid-cols-3">
                          <Field label={t("form.maxSlots")}>
                            <Input
                              type="number"
                              value={session.maxSlots}
                              onChange={(e) =>
                                updatePlaySession(
                                  index,
                                  "maxSlots",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min={1}
                            />
                          </Field>
                          <Field label={t("form.startTime")}>
                            <Input
                              type="datetime-local"
                              value={session.startTime}
                              onChange={(e) =>
                                updatePlaySession(
                                  index,
                                  "startTime",
                                  e.target.value
                                )
                              }
                            />
                          </Field>
                          <Field label={t("form.endTime")}>
                            <Input
                              type="datetime-local"
                              value={session.endTime}
                              onChange={(e) =>
                                updatePlaySession(
                                  index,
                                  "endTime",
                                  e.target.value
                                )
                              }
                            />
                          </Field>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="sticky top-6 h-fit p-0">
          <CardContent className="space-y-5 p-6">
            <h2 className="text-lg font-semibold">
              {t("form.settingsAndPublish")}
            </h2>

            <div className="space-y-3">
              <Field label={t("form.status")}>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as SocialStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("filters.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">{t("labels.draft")}</SelectItem>
                    <SelectItem value="PUBLISHED">
                      {t("labels.published")}
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                      {t("labels.completed")}
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                      {t("labels.cancelled")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Separator />

              <ToggleRow
                label={t("form.privateEvent")}
                checked={formData.isPrivate}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPrivate: checked })
                }
              />

              <ToggleRow
                label={t("form.autoApproveJoinRequests")}
                checked={formData.autoApproveJoinRequests}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, autoApproveJoinRequests: checked })
                }
              />

              <Separator />

              <Button
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={
                  !formData.title ||
                  !formData.note ||
                  !formData.startTime ||
                  !formData.endTime ||
                  formData.maxSlots < 1 ||
                  new Date(formData.endTime) <= new Date(formData.startTime)
                }
              >
                <Save className="size-4" />
                {isEditMode ? t("form.update") : t("form.create")}
              </Button>

              {isEditMode && (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm(t("form.confirmDeleteSocial"))) {
                      alert(t("form.deleteSocial"))
                      router.push("/socials")
                    }
                  }}
                >
                  {t("form.deleteSocial")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

export default function Page() {
  return <SocialForm />
}
