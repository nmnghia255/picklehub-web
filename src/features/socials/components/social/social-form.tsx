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

import { mockSocials } from "../../mockData"
import type {
  AgeGroup,
  GenderPolicy,
  HostRole,
  SocialFormat,
  SocialStatus,
} from "../../types"

export function SocialForm() {
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

  const [playSessions, setPlaySessions] = useState<
    Array<{
      title: string
      startTime: string
      endTime: string
      maxSlots: number
    }>
  >([])

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
    alert(`Social ${isEditMode ? "updated" : "created"} successfully!`)
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

  const removePlaySession = (index: number) => {
    setPlaySessions(playSessions.filter((_, itemIndex) => itemIndex !== index))
  }

  const updatePlaySession = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...playSessions]
    updated[index] = { ...updated[index], [field]: value }
    setPlaySessions(updated)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {isEditMode ? "Edit Social" : "Create New Social"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure the event details, rules, and publishing settings.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="p-0">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <div className="space-y-4">
                <Field label="Social Title">
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Sunday Morning Pickleball Social"
                    required
                  />
                </Field>

                <Field label="Description">
                  <Textarea
                    rows={4}
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    placeholder="Describe your social event..."
                    required
                  />
                </Field>

                <Field label="Format">
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
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOCIAL">Social</SelectItem>
                      <SelectItem value="TOURNAMENT">Tournament</SelectItem>
                      <SelectItem value="TRAINING">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">Schedule</h2>
              <div className="space-y-4">
                <Field label="Start Time">
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                  />
                </Field>

                <Field label="End Time">
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
                        End time must be after start time.
                      </AlertDescription>
                    </Alert>
                  )}

                <Field label="Cancellation Freeze (hours before event)">
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
              <h2 className="text-lg font-semibold">Participation Rules</h2>
              <div className="space-y-4">
                <Field label="Maximum Participants">
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
                  <Field label="Gender Policy">
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
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MIXED">Mixed</SelectItem>
                        <SelectItem value="MALE_ONLY">Men Only</SelectItem>
                        <SelectItem value="FEMALE_ONLY">Women Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Age Group">
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
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JUNIOR">Junior</SelectItem>
                        <SelectItem value="ADULT">Adult</SelectItem>
                        <SelectItem value="SENIOR">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Minimum Skill Level">
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
                  <Field label="Maximum Skill Level">
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

                <Field label="Host Role">
                  <Select
                    value={formData.hostRole}
                    onValueChange={(value) =>
                      setFormData({ ...formData, hostRole: value as HostRole })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select host role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOST_ONLY">
                        Host Only (not playing)
                      </SelectItem>
                      <SelectItem value="HOST_AND_PLAY">
                        Host and Play
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <ToggleRow
                  label="Submit to DUPR"
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
                Payment Setup (Optional)
              </h2>
              <div className="space-y-4">
                <Field label="Total Expense per Person">
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

                <Field label="Payment Code">
                  <Input
                    value={formData.paymentCode}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentCode: e.target.value })
                    }
                    placeholder="e.g., Venmo code, reference number"
                  />
                </Field>

                <Field label="Payment Instructions">
                  <Textarea
                    rows={2}
                    value={formData.paymentNote}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentNote: e.target.value })
                    }
                    placeholder="e.g., Venmo @username or Cash at venue"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  Play Sessions ({playSessions.length})
                </h2>
                <Button variant="outline" onClick={addPlaySession}>
                  <Plus className="size-4" />
                  Add Session
                </Button>
              </div>

              {playSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-sm text-muted-foreground">
                  Add play sessions to organize your social into specific time
                  slots and courts.
                </div>
              ) : (
                <div className="space-y-4">
                  {playSessions.map((session, index) => (
                    <Card key={index} className="p-0">
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold">
                            Session {index + 1}
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

                        <Field label="Session Title">
                          <Input
                            value={session.title}
                            onChange={(e) =>
                              updatePlaySession(index, "title", e.target.value)
                            }
                            placeholder="e.g., Morning Session - Courts 1 & 2"
                          />
                        </Field>

                        <div className="grid gap-4 md:grid-cols-3">
                          <Field label="Max Slots">
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
                          <Field label="Start Time">
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
                          <Field label="End Time">
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
            <h2 className="text-lg font-semibold">Settings & Publish</h2>

            <div className="space-y-3">
              <Field label="Status">
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as SocialStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Separator />

              <ToggleRow
                label="Private Event"
                checked={formData.isPrivate}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPrivate: checked })
                }
              />

              <ToggleRow
                label="Auto-approve Join Requests"
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
                {isEditMode ? "Update Social" : "Create Social"}
              </Button>

              {isEditMode && (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to delete this social?")
                    ) {
                      alert("Social deleted!")
                      router.push("/socials")
                    }
                  }}
                >
                  Delete Social
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
