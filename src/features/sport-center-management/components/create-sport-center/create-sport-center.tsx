"use client"

import { useMutation } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { sportCenterWizardClient } from "../../api/sport-center-wizard-client"
import type {
  ProductType,
  ServiceType,
} from "../../services-products-management/types"
import type { CancellationTier } from "../../types/cancellation-policy"
import type { CourtLifecycleStatus, CourtType } from "../../types/court"

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

type CenterDraft = {
  name: string
  address: string
  phone: string
  email: string
  description: string
  openTime: string
  closeTime: string
  basePrice: string
  paymentAccountName: string
  paymentAccountNumber: string
  paymentBankName: string
  paymentQrUrl: string
  imagesText: string
  amenitiesText: string
  rulesText: string
}

type PriceSlotDraft = {
  id: string
  startTime: string
  endTime: string
  pricePerHour: string
}

type CourtDraft = {
  id: string
  name: string
  type: CourtType
  status: CourtLifecycleStatus
  serverId?: string
  error?: string
}

type ServiceDraft = {
  id: string
  name: string
  type: ServiceType
  price: string
  unit: string
  description: string
  imageUrl: string
  serverId?: string
  error?: string
}

type ProductDraft = {
  id: string
  name: string
  type: ProductType
  price: string
  unit: string
  stock: string
  description: string
  imageUrl: string
  serverId?: string
  error?: string
}

type PolicyDraft = {
  allowCancellation: boolean
  tiers: Array<CancellationTier & { id: string }>
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

function isValidHttpUrl(value: string) {
  if (!value.trim()) return true
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function draftCourtLabel(index: number) {
  return `Court ${index + 1}`
}

function draftServiceLabel(index: number) {
  return `Service ${index + 1}`
}

function draftProductLabel(index: number) {
  return `Product ${index + 1}`
}

export function CreateSportCenterWizard() {
  const router = useRouter()
  const { t } = useSportCenterManagementTranslation()

  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [centerId, setCenterId] = useState<string | null>(null)

  const [centerSnapshot, setCenterSnapshot] = useState<{
    id: string
    name: string
    address: string
    openTime: string
    closeTime: string
    basePrice: number
    paymentAccountName: string
    paymentAccountNumber: string
    paymentBankName: string
    paymentQrUrl?: string | null
    images?: string[]
    amenities?: string[]
    rules?: string[]
    description?: string | null
    status?: string
  } | null>(null)

  const [centerDraft, setCenterDraft] = useState<CenterDraft>({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    openTime: "06:00",
    closeTime: "22:00",
    basePrice: "",
    paymentAccountName: "",
    paymentAccountNumber: "",
    paymentBankName: "",
    paymentQrUrl: "",
    imagesText: "",
    amenitiesText: "",
    rulesText: "",
  })

  const [priceSlots, setPriceSlots] = useState<PriceSlotDraft[]>([
    {
      id: createId(),
      startTime: "06:00",
      endTime: "22:00",
      pricePerHour: "",
    },
  ])

  const [policy, setPolicy] = useState<PolicyDraft>({
    allowCancellation: true,
    tiers: [
      {
        id: createId(),
        minDaysBeforeStart: 2,
        refundPercent: 100,
      },
      {
        id: createId(),
        minDaysBeforeStart: 1,
        refundPercent: 75,
      },
    ],
  })

  const [courtDraft, setCourtDraft] = useState({
    name: "",
    type: "INDOOR" as CourtType,
    status: "ACTIVE" as CourtLifecycleStatus,
  })
  const [courtDrafts, setCourtDrafts] = useState<CourtDraft[]>([])

  const [serviceTab, setServiceTab] = useState<"service" | "product">("service")
  const [serviceDraft, setServiceDraft] = useState({
    name: "",
    type: "EQUIPMENT_RENTAL" as ServiceType,
    price: "",
    unit: "",
    description: "",
    imageUrl: "",
  })
  const [serviceDrafts, setServiceDrafts] = useState<ServiceDraft[]>([])

  const [productDraft, setProductDraft] = useState({
    name: "",
    type: "BEVERAGE" as ProductType,
    price: "",
    unit: "",
    stock: "",
    description: "",
    imageUrl: "",
  })
  const [productDrafts, setProductDrafts] = useState<ProductDraft[]>([])

  const [globalError, setGlobalError] = useState<string | null>(null)

  const priceSlotDefaults = useMemo(
    () => ({
      startTime: centerDraft.openTime || "06:00",
      endTime: centerDraft.closeTime || "22:00",
      pricePerHour: centerDraft.basePrice || "0",
    }),
    [centerDraft.basePrice, centerDraft.closeTime, centerDraft.openTime]
  )

  const centerMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: centerDraft.name.trim(),
        address: centerDraft.address.trim(),
        phone: centerDraft.phone.trim(),
        email: centerDraft.email.trim() || undefined,
        description: centerDraft.description.trim() || undefined,
        images: splitLines(centerDraft.imagesText),
        rules: splitLines(centerDraft.rulesText),
        openTime: centerDraft.openTime,
        closeTime: centerDraft.closeTime,
        basePrice: Number(centerDraft.basePrice),
        amenities: splitLines(centerDraft.amenitiesText),
        paymentAccountName: centerDraft.paymentAccountName.trim(),
        paymentAccountNumber: centerDraft.paymentAccountNumber.trim(),
        paymentBankName: centerDraft.paymentBankName.trim(),
        paymentQrUrl: centerDraft.paymentQrUrl.trim() || undefined,
      }

      if (centerId) {
        return sportCenterWizardClient.updateSportCenter(centerId, payload)
      }

      return sportCenterWizardClient.createSportCenter(payload)
    },
    onSuccess: (data) => {
      setCenterId(data.id)
      setCenterSnapshot(data)
      toast.success(
        centerId
          ? t("createCenter.toast.centerUpdated", {
              defaultValue: "Sport center saved successfully.",
            })
          : t("createCenter.toast.centerCreated", {
              defaultValue: "Sport center created successfully.",
            })
      )
      setCurrentStep(2)
    },
    onError: (error) => {
      setGlobalError(
        error instanceof Error
          ? error.message
          : t("createCenter.validation.centerSaveFailed", {
              defaultValue: "Could not save the sport center.",
            })
      )
    },
  })

  const priceSlotsMutation = useMutation({
    mutationFn: async () => {
      if (!centerId) throw new Error(t("createCenter.validation.centerMissing"))

      const normalized = priceSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        pricePerHour: Number(slot.pricePerHour),
      }))

      return sportCenterWizardClient.updatePriceSlots(centerId, {
        priceSlots: normalized,
      })
    },
    onSuccess: () => {
      toast.success(
        t("createCenter.toast.priceSlotsSaved", {
          defaultValue: "Price slots saved.",
        })
      )
      setCurrentStep(3)
    },
    onError: (error) => {
      setGlobalError(error instanceof Error ? error.message : "Failed to save")
    },
  })

  const policyMutation = useMutation({
    mutationFn: async () => {
      if (!centerId) throw new Error(t("createCenter.validation.centerMissing"))
      return sportCenterWizardClient.updateCancellationPolicy(centerId, {
        allowCancellation: policy.allowCancellation,
        tiers: policy.tiers.map((tier) => ({
          minDaysBeforeStart: Number(tier.minDaysBeforeStart),
          refundPercent: Number(tier.refundPercent),
        })),
      })
    },
    onSuccess: () => {
      toast.success(
        t("createCenter.toast.policySaved", {
          defaultValue: "Cancellation policy saved.",
        })
      )
      setCurrentStep(4)
    },
    onError: (error) => {
      setGlobalError(error instanceof Error ? error.message : "Failed to save")
    },
  })

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      if (!centerId) throw new Error(t("createCenter.validation.centerMissing"))

      const failures: string[] = []
      for (const court of courtDrafts) {
        if (court.serverId) continue
        try {
          const created = await sportCenterWizardClient.createCourt(centerId, {
            name: court.name.trim(),
            type: court.type,
            status: court.status,
          })
          setCourtDrafts((current) =>
            current.map((item) =>
              item.id === court.id
                ? { ...item, serverId: created.id, error: undefined }
                : item
            )
          )
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed"
          failures.push(`${court.name || draftCourtLabel(0)}: ${message}`)
          setCourtDrafts((current) =>
            current.map((item) =>
              item.id === court.id ? { ...item, error: message } : item
            )
          )
        }
      }

      for (const service of serviceDrafts) {
        if (service.serverId) continue
        try {
          const created = await sportCenterWizardClient.createService(
            centerId,
            {
              name: service.name.trim(),
              type: service.type,
              price: Number(service.price),
              description: service.description.trim() || undefined,
              unit: service.unit.trim() || undefined,
              imageUrl: service.imageUrl.trim() || undefined,
            }
          )
          setServiceDrafts((current) =>
            current.map((item) =>
              item.id === service.id
                ? { ...item, serverId: created.id, error: undefined }
                : item
            )
          )
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed"
          failures.push(`${service.name || draftServiceLabel(0)}: ${message}`)
          setServiceDrafts((current) =>
            current.map((item) =>
              item.id === service.id ? { ...item, error: message } : item
            )
          )
        }
      }

      for (const product of productDrafts) {
        if (product.serverId) continue
        try {
          const created = await sportCenterWizardClient.createProduct(
            centerId,
            {
              name: product.name.trim(),
              type: product.type,
              price: Number(product.price),
              description: product.description.trim() || undefined,
              unit: product.unit.trim() || undefined,
              imageUrl: product.imageUrl.trim() || undefined,
              stock: Number(product.stock || 0),
            }
          )
          setProductDrafts((current) =>
            current.map((item) =>
              item.id === product.id
                ? { ...item, serverId: created.id, error: undefined }
                : item
            )
          )
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed"
          failures.push(`${product.name || draftProductLabel(0)}: ${message}`)
          setProductDrafts((current) =>
            current.map((item) =>
              item.id === product.id ? { ...item, error: message } : item
            )
          )
        }
      }

      if (failures.length > 0) {
        throw new Error(failures.join(" | "))
      }

      return {
        center: await sportCenterWizardClient.getSportCenter(centerId),
        courts: await sportCenterWizardClient.listCourts(centerId),
        priceSlots: await sportCenterWizardClient.listPriceSlots(centerId),
        policy: await sportCenterWizardClient.getCancellationPolicy(centerId),
        services: await sportCenterWizardClient.listServices(centerId),
        products: await sportCenterWizardClient.listProducts(centerId),
      }
    },
    onSuccess: (result) => {
      setCenterSnapshot(result.center)
      toast.success(
        t("createCenter.toast.finalSuccess", {
          defaultValue: "Sport center setup completed.",
        })
      )
      router.push(`/sport-center-management/${result.center.id}`)
    },
    onError: (error) => {
      setGlobalError(
        error instanceof Error
          ? error.message
          : t("createCenter.validation.finalSaveFailed", {
              defaultValue: "Could not complete setup.",
            })
      )
    },
  })

  const totalSteps = 6

  const steps = [
    {
      number: 1,
      title: t("createCenter.steps.center", { defaultValue: "Center info" }),
    },
    {
      number: 2,
      title: t("createCenter.steps.pricing", { defaultValue: "Price slots" }),
    },
    {
      number: 3,
      title: t("createCenter.steps.policy", {
        defaultValue: "Cancellation policy",
      }),
    },
    {
      number: 4,
      title: t("createCenter.steps.courts", { defaultValue: "Courts" }),
    },
    {
      number: 5,
      title: t("createCenter.steps.inventory", {
        defaultValue: "Products & services",
      }),
    },
    {
      number: 6,
      title: t("createCenter.steps.review", { defaultValue: "Review" }),
    },
  ]

  const centerPayloadReady =
    centerDraft.name.trim() &&
    centerDraft.address.trim() &&
    centerDraft.phone.trim() &&
    centerDraft.openTime &&
    centerDraft.closeTime &&
    centerDraft.basePrice &&
    centerDraft.paymentAccountName.trim() &&
    centerDraft.paymentAccountNumber.trim() &&
    centerDraft.paymentBankName.trim()

  const validateCenterStep = () => {
    if (!centerPayloadReady) {
      setGlobalError(
        t("createCenter.validation.requiredFields", {
          defaultValue: "Please fill in all required fields.",
        })
      )
      return false
    }

    const open = timeToMinutes(centerDraft.openTime)
    const close = timeToMinutes(centerDraft.closeTime)
    if (open === null || close === null || open >= close) {
      setGlobalError(
        t("createCenter.validation.timeOrder", {
          defaultValue: "Opening time must be earlier than closing time.",
        })
      )
      return false
    }

    if (Number(centerDraft.basePrice) < 0) {
      setGlobalError(
        t("createCenter.validation.priceInvalid", {
          defaultValue: "Base price is invalid.",
        })
      )
      return false
    }

    if (!isValidHttpUrl(centerDraft.paymentQrUrl)) {
      setGlobalError(
        t("createCenter.validation.invalidUrl", {
          defaultValue: "Please enter a valid URL.",
        })
      )
      return false
    }

    return true
  }

  const validatePriceSlots = () => {
    if (!priceSlots.length) {
      setGlobalError(
        t("createCenter.validation.atLeastOneSlot", {
          defaultValue: "Please add at least one price slot.",
        })
      )
      return false
    }

    const rows = priceSlots.map((slot) => ({
      ...slot,
      startMinutes: timeToMinutes(slot.startTime),
      endMinutes: timeToMinutes(slot.endTime),
      price: Number(slot.pricePerHour),
    }))

    for (const slot of rows) {
      if (slot.startMinutes === null || slot.endMinutes === null) {
        setGlobalError(
          t("createCenter.validation.invalidTime", {
            defaultValue: "Please enter a valid time.",
          })
        )
        return false
      }
      if (slot.startMinutes >= slot.endMinutes) {
        setGlobalError(
          t("createCenter.validation.timeOrder", {
            defaultValue: "Start time must be earlier than end time.",
          })
        )
        return false
      }
      if (!Number.isFinite(slot.price) || slot.price < 0) {
        setGlobalError(
          t("createCenter.validation.priceInvalid", {
            defaultValue: "Price is invalid.",
          })
        )
        return false
      }
    }

    const sorted = [...rows].sort((a, b) => a.startMinutes! - b.startMinutes!)
    for (let index = 1; index < sorted.length; index += 1) {
      if (sorted[index].startMinutes! < sorted[index - 1].endMinutes!) {
        setGlobalError(
          t("createCenter.validation.noOverlap", {
            defaultValue: "Price slots cannot overlap.",
          })
        )
        return false
      }
    }

    return true
  }

  const validatePolicy = () => {
    if (!policy.allowCancellation) return true
    const rows = policy.tiers.map((tier) => ({
      minDaysBeforeStart: Number(tier.minDaysBeforeStart),
      refundPercent: Number(tier.refundPercent),
    }))

    for (const row of rows) {
      if (
        !Number.isInteger(row.minDaysBeforeStart) ||
        row.minDaysBeforeStart < 0 ||
        !Number.isFinite(row.refundPercent) ||
        row.refundPercent < 0 ||
        row.refundPercent > 100
      ) {
        setGlobalError(
          t("createCenter.validation.invalidTier", {
            defaultValue: "Please correct the cancellation policy tiers.",
          })
        )
        return false
      }
    }

    const sorted = [...rows].sort(
      (a, b) => b.minDaysBeforeStart - a.minDaysBeforeStart
    )
    for (let index = 1; index < sorted.length; index += 1) {
      if (
        sorted[index].minDaysBeforeStart ===
        sorted[index - 1].minDaysBeforeStart
      ) {
        setGlobalError(
          t("createCenter.validation.tierOrder", {
            defaultValue:
              "Cancellation policy tiers must not duplicate thresholds.",
          })
        )
        return false
      }
    }

    return true
  }

  const goToNextStep = async () => {
    setGlobalError(null)

    if (currentStep === 1) {
      if (!validateCenterStep()) return
      await centerMutation.mutateAsync()
      return
    }

    if (currentStep === 2) {
      if (!validatePriceSlots()) return
      await priceSlotsMutation.mutateAsync()
      return
    }

    if (currentStep === 3) {
      if (!validatePolicy()) return
      await policyMutation.mutateAsync()
      return
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => (prev + 1) as WizardStep)
      return
    }

    await finalizeMutation.mutateAsync()
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep)
    }
  }

  const addPriceSlot = () => {
    setPriceSlots((current) => [
      ...current,
      {
        id: createId(),
        startTime: priceSlotDefaults.startTime,
        endTime: priceSlotDefaults.endTime,
        pricePerHour: priceSlotDefaults.pricePerHour,
      },
    ])
  }

  const addCourtDraft = () => {
    if (!courtDraft.name.trim()) {
      setGlobalError(
        t("createCenter.validation.courtNameRequired", {
          defaultValue: "Please enter a court name.",
        })
      )
      return
    }
    setCourtDrafts((current) => [...current, { id: createId(), ...courtDraft }])
    setCourtDraft((current) => ({ ...current, name: "" }))
  }

  const addServiceDraft = () => {
    if (
      !serviceDraft.name.trim() ||
      !serviceDraft.price ||
      !Number.isFinite(Number(serviceDraft.price))
    ) {
      setGlobalError(
        t("createCenter.validation.serviceRequired", {
          defaultValue: "Please enter a valid service name and price.",
        })
      )
      return
    }
    setServiceDrafts((current) => [
      ...current,
      { id: createId(), ...serviceDraft },
    ])
    setServiceDraft((current) => ({ ...current, name: "", price: "" }))
  }

  const addProductDraft = () => {
    if (
      !productDraft.name.trim() ||
      !productDraft.price ||
      !productDraft.stock ||
      !Number.isFinite(Number(productDraft.price)) ||
      !Number.isFinite(Number(productDraft.stock))
    ) {
      setGlobalError(
        t("createCenter.validation.productRequired", {
          defaultValue: "Please enter a valid product name, price and stock.",
        })
      )
      return
    }
    setProductDrafts((current) => [
      ...current,
      { id: createId(), ...productDraft },
    ])
    setProductDraft((current) => ({
      ...current,
      name: "",
      price: "",
      stock: "",
    }))
  }

  const renderStepTitle = () => {
    if (currentStep === 1)
      return t("createCenter.sections.centerInfo", {
        defaultValue: "Center information",
      })
    if (currentStep === 2)
      return t("createCenter.sections.priceSlots", {
        defaultValue: "Price slots",
      })
    if (currentStep === 3)
      return t("createCenter.sections.policy", {
        defaultValue: "Cancellation policy",
      })
    if (currentStep === 4)
      return t("createCenter.sections.courts", { defaultValue: "Courts" })
    if (currentStep === 5)
      return t("createCenter.sections.inventory", {
        defaultValue: "Products & services",
      })
    return t("createCenter.sections.review", {
      defaultValue: "Review and finish",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border bg-card/90 p-6 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary">
              {t("createCenter.page.badge", {
                defaultValue: "Sport center management",
              })}
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">
              {t("createCenter.page.title", {
                defaultValue: "Create Sport Center",
              })}
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              {t("createCenter.page.subtitle", {
                defaultValue:
                  "Create the center first, then configure pricing, policy, courts, services, and products in a guided wizard.",
              })}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              {t("common.back")}
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border bg-card/80 p-4 shadow-sm">
          <div className="mb-4 grid gap-3 md:grid-cols-6">
            {steps.map((step) => {
              const isActive = step.number === currentStep
              const isDone = step.number < currentStep
              return (
                <button
                  key={step.number}
                  type="button"
                  disabled={step.number > currentStep && step.number > 3}
                  onClick={() => {
                    if (
                      step.number <= currentStep ||
                      (currentStep > 3 && step.number <= 3)
                    ) {
                      setCurrentStep(step.number as WizardStep)
                    }
                  }}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : isDone
                        ? "border-emerald-300 bg-emerald-50/70"
                        : "border-border bg-background"
                  }`}
                >
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="size-4" /> : step.number}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {t("createCenter.stepLabel", { defaultValue: "Step" })}{" "}
                      {step.number}
                    </p>
                    <p className="truncate text-sm font-medium">{step.title}</p>
                  </div>
                </button>
              )
            })}
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {globalError ? (
          <Alert variant="destructive">
            <AlertTitle>
              {t("createCenter.errorTitle", {
                defaultValue: "Could not continue",
              })}
            </AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="overflow-hidden rounded-3xl">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle>{renderStepTitle()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {currentStep === 1 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.name", {
                        defaultValue: "Center name",
                      })}
                    </Label>
                    <Input
                      value={centerDraft.name}
                      onChange={(e) =>
                        setCenterDraft((current) => ({
                          ...current,
                          name: e.target.value,
                        }))
                      }
                      placeholder={t("createCenter.placeholders.name", {
                        defaultValue: "PickleHub District 1",
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.address", {
                        defaultValue: "Address",
                      })}
                    </Label>
                    <Input
                      value={centerDraft.address}
                      onChange={(e) =>
                        setCenterDraft((current) => ({
                          ...current,
                          address: e.target.value,
                        }))
                      }
                      placeholder={t("createCenter.placeholders.address", {
                        defaultValue: "123 Nguyen Hue, District 1",
                      })}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>
                        {t("createCenter.fields.phone", {
                          defaultValue: "Phone",
                        })}
                      </Label>
                      <Input
                        value={centerDraft.phone}
                        onChange={(e) =>
                          setCenterDraft((current) => ({
                            ...current,
                            phone: e.target.value,
                          }))
                        }
                        placeholder={t("createCenter.placeholders.phone", {
                          defaultValue: "+84901234567",
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t("createCenter.fields.email", {
                          defaultValue: "Email",
                        })}
                      </Label>
                      <Input
                        type="email"
                        value={centerDraft.email}
                        onChange={(e) =>
                          setCenterDraft((current) => ({
                            ...current,
                            email: e.target.value,
                          }))
                        }
                        placeholder={t("createCenter.placeholders.email", {
                          defaultValue: "hello@example.com",
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.description", {
                        defaultValue: "Description",
                      })}
                    </Label>
                    <Textarea
                      value={centerDraft.description}
                      onChange={(e) =>
                        setCenterDraft((current) => ({
                          ...current,
                          description: e.target.value,
                        }))
                      }
                      placeholder={t("createCenter.placeholders.description", {
                        defaultValue: "Short center description",
                      })}
                      className="min-h-32"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>
                        {t("createCenter.fields.openTime", {
                          defaultValue: "Opening time",
                        })}
                      </Label>
                      <Input
                        type="time"
                        value={centerDraft.openTime}
                        onChange={(e) =>
                          setCenterDraft((current) => ({
                            ...current,
                            openTime: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t("createCenter.fields.closeTime", {
                          defaultValue: "Closing time",
                        })}
                      </Label>
                      <Input
                        type="time"
                        value={centerDraft.closeTime}
                        onChange={(e) =>
                          setCenterDraft((current) => ({
                            ...current,
                            closeTime: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.basePrice", {
                        defaultValue: "Base price per hour",
                      })}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={centerDraft.basePrice}
                      onChange={(e) =>
                        setCenterDraft((current) => ({
                          ...current,
                          basePrice: e.target.value,
                        }))
                      }
                      placeholder="80000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.paymentAccountName", {
                        defaultValue: "Account holder name",
                      })}
                    </Label>
                    <Input
                      value={centerDraft.paymentAccountName}
                      onChange={(e) =>
                        setCenterDraft((current) => ({
                          ...current,
                          paymentAccountName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.paymentAccountNumber", {
                        defaultValue: "Account number",
                      })}
                    </Label>
                    <Input
                      value={centerDraft.paymentAccountNumber}
                      onChange={(e) =>
                        setCenterDraft((current) => ({
                          ...current,
                          paymentAccountNumber: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.paymentBankName", {
                        defaultValue: "Bank name",
                      })}
                    </Label>
                    <Input
                      value={centerDraft.paymentBankName}
                      onChange={(e) =>
                        setCenterDraft((current) => ({
                          ...current,
                          paymentBankName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.paymentQrUrl", {
                        defaultValue: "Payment QR URL",
                      })}
                    </Label>
                    <Input
                      value={centerDraft.paymentQrUrl}
                      onChange={(e) =>
                        setCenterDraft((current) => ({
                          ...current,
                          paymentQrUrl: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <Separator className="lg:col-span-2" />

                <div className="grid gap-4 lg:col-span-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.images", {
                        defaultValue: "Image URLs",
                      })}
                    </Label>
                    <Textarea
                      value={centerDraft.imagesText}
                      onChange={(e) =>
                        setCenterDraft((current) => ({
                          ...current,
                          imagesText: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                      className="min-h-28"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.amenities", {
                        defaultValue: "Amenities",
                      })}
                    </Label>
                    <Textarea
                      value={centerDraft.amenitiesText}
                      onChange={(e) =>
                        setCenterDraft((current) => ({
                          ...current,
                          amenitiesText: e.target.value,
                        }))
                      }
                      placeholder={t("createCenter.placeholders.listHint", {
                        defaultValue: "One item per line",
                      })}
                      className="min-h-28"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.rules", {
                        defaultValue: "Rules",
                      })}
                    </Label>
                    <Textarea
                      value={centerDraft.rulesText}
                      onChange={(e) =>
                        setCenterDraft((current) => ({
                          ...current,
                          rulesText: e.target.value,
                        }))
                      }
                      placeholder={t("createCenter.placeholders.listHint", {
                        defaultValue: "One item per line",
                      })}
                      className="min-h-28"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                {priceSlots.map((slot, index) => (
                  <div
                    key={slot.id}
                    className="grid gap-3 rounded-2xl border bg-muted/20 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <div className="space-y-2">
                      <Label>
                        {t("createCenter.fields.startTime", {
                          defaultValue: "Start time",
                        })}
                      </Label>
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          setPriceSlots((current) =>
                            current.map((item) =>
                              item.id === slot.id
                                ? { ...item, startTime: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t("createCenter.fields.endTime", {
                          defaultValue: "End time",
                        })}
                      </Label>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          setPriceSlots((current) =>
                            current.map((item) =>
                              item.id === slot.id
                                ? { ...item, endTime: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t("createCenter.fields.pricePerHour", {
                          defaultValue: "Price per hour",
                        })}
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={slot.pricePerHour}
                        onChange={(e) =>
                          setPriceSlots((current) =>
                            current.map((item) =>
                              item.id === slot.id
                                ? { ...item, pricePerHour: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setPriceSlots((current) =>
                            current.filter((item) => item.id !== slot.id)
                          )
                        }
                        disabled={priceSlots.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                      <Badge variant="secondary">
                        {t("createCenter.labels.slot", {
                          defaultValue: `Slot ${index + 1}`,
                        })}
                      </Badge>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addPriceSlot}>
                  <Plus className="mr-2 size-4" />
                  {t("createCenter.actions.addSlot", {
                    defaultValue: "Add price slot",
                  })}
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-2xl border bg-muted/20 p-4">
                  <div>
                    <p className="font-medium">
                      {t("createCenter.fields.allowCancellation", {
                        defaultValue: "Allow cancellation",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("createCenter.help.allowCancellation", {
                        defaultValue:
                          "Enable preservation credit refund tiers for confirmed bookings.",
                      })}
                    </p>
                  </div>
                  <Switch
                    checked={policy.allowCancellation}
                    onCheckedChange={(checked) =>
                      setPolicy((current) => ({
                        ...current,
                        allowCancellation: checked,
                      }))
                    }
                  />
                </div>

                <div className="space-y-4">
                  {policy.tiers.map((tier, index) => (
                    <div
                      key={tier.id}
                      className="grid gap-3 rounded-2xl border bg-muted/20 p-4 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.minDaysBeforeStart", {
                            defaultValue: "Minimum days before start",
                          })}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={tier.minDaysBeforeStart}
                          onChange={(e) =>
                            setPolicy((current) => ({
                              ...current,
                              tiers: current.tiers.map((item) =>
                                item.id === tier.id
                                  ? {
                                      ...item,
                                      minDaysBeforeStart: Number(
                                        e.target.value
                                      ),
                                    }
                                  : item
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.refundPercent", {
                            defaultValue: "Refund percent",
                          })}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={tier.refundPercent}
                          onChange={(e) =>
                            setPolicy((current) => ({
                              ...current,
                              tiers: current.tiers.map((item) =>
                                item.id === tier.id
                                  ? {
                                      ...item,
                                      refundPercent: Number(e.target.value),
                                    }
                                  : item
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setPolicy((current) => ({
                              ...current,
                              tiers: current.tiers.filter(
                                (item) => item.id !== tier.id
                              ),
                            }))
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <Badge variant="secondary">
                          {t("createCenter.labels.tier", {
                            defaultValue: `Tier ${index + 1}`,
                          })}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setPolicy((current) => ({
                        ...current,
                        tiers: [
                          ...current.tiers,
                          {
                            id: createId(),
                            minDaysBeforeStart: 1,
                            refundPercent: 50,
                          },
                        ],
                      }))
                    }
                  >
                    <Plus className="mr-2 size-4" />
                    {t("createCenter.actions.addTier", {
                      defaultValue: "Add tier",
                    })}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.courtName", {
                        defaultValue: "Court name",
                      })}
                    </Label>
                    <Input
                      value={courtDraft.name}
                      onChange={(e) =>
                        setCourtDraft((current) => ({
                          ...current,
                          name: e.target.value,
                        }))
                      }
                      placeholder={t("createCenter.placeholders.courtName", {
                        defaultValue: draftCourtLabel(courtDrafts.length),
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.courtType", {
                        defaultValue: "Court type",
                      })}
                    </Label>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={courtDraft.type}
                      onChange={(e) =>
                        setCourtDraft((current) => ({
                          ...current,
                          type: e.target.value as CourtType,
                        }))
                      }
                    >
                      <option value="INDOOR">
                        {t("createCenter.enums.courtType.indoor", {
                          defaultValue: "Indoor",
                        })}
                      </option>
                      <option value="OUTDOOR">
                        {t("createCenter.enums.courtType.outdoor", {
                          defaultValue: "Outdoor",
                        })}
                      </option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("createCenter.fields.courtStatus", {
                        defaultValue: "Status",
                      })}
                    </Label>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={courtDraft.status}
                      onChange={(e) =>
                        setCourtDraft((current) => ({
                          ...current,
                          status: e.target.value as CourtLifecycleStatus,
                        }))
                      }
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={addCourtDraft}>
                    <Plus className="mr-2 size-4" />
                    {t("createCenter.actions.addCourt", {
                      defaultValue: "Add court",
                    })}
                  </Button>
                </div>

                <div className="space-y-3">
                  {courtDrafts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                      {t("createCenter.review.skippedCourts", {
                        defaultValue:
                          "No courts added yet. You can skip this step.",
                      })}
                    </div>
                  ) : (
                    courtDrafts.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border bg-muted/20 p-4"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.type} • {item.status}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setCourtDrafts((current) =>
                              current.filter((draft) => draft.id !== item.id)
                            )
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <Tabs
                  value={serviceTab}
                  onValueChange={(value) =>
                    setServiceTab(value as typeof serviceTab)
                  }
                >
                  <TabsList>
                    <TabsTrigger value="service">
                      {t("createCenter.tabs.services", {
                        defaultValue: "Services",
                      })}
                    </TabsTrigger>
                    <TabsTrigger value="product">
                      {t("createCenter.tabs.products", {
                        defaultValue: "Products",
                      })}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="service" className="space-y-4 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.serviceName", {
                            defaultValue: "Service name",
                          })}
                        </Label>
                        <Input
                          value={serviceDraft.name}
                          onChange={(e) =>
                            setServiceDraft((current) => ({
                              ...current,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.serviceType", {
                            defaultValue: "Service type",
                          })}
                        </Label>
                        <select
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={serviceDraft.type}
                          onChange={(e) =>
                            setServiceDraft((current) => ({
                              ...current,
                              type: e.target.value as ServiceType,
                            }))
                          }
                        >
                          <option value="EQUIPMENT_RENTAL">
                            {t(
                              "createCenter.enums.serviceType.equipmentRental",
                              {
                                defaultValue: "Equipment rental",
                              }
                            )}
                          </option>
                          <option value="COACHING">
                            {t("createCenter.enums.serviceType.coaching", {
                              defaultValue: "Coaching",
                            })}
                          </option>
                          <option value="FACILITY_ADD_ON">
                            {t("createCenter.enums.serviceType.facilityAddOn", {
                              defaultValue: "Facility add-on",
                            })}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.price", {
                            defaultValue: "Price",
                          })}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={serviceDraft.price}
                          onChange={(e) =>
                            setServiceDraft((current) => ({
                              ...current,
                              price: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.unit", {
                            defaultValue: "Unit",
                          })}
                        </Label>
                        <Input
                          value={serviceDraft.unit}
                          onChange={(e) =>
                            setServiceDraft((current) => ({
                              ...current,
                              unit: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.imageUrl", {
                            defaultValue: "Image URL",
                          })}
                        </Label>
                        <Input
                          value={serviceDraft.imageUrl}
                          onChange={(e) =>
                            setServiceDraft((current) => ({
                              ...current,
                              imageUrl: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t("createCenter.fields.description", {
                          defaultValue: "Description",
                        })}
                      </Label>
                      <Textarea
                        value={serviceDraft.description}
                        onChange={(e) =>
                          setServiceDraft((current) => ({
                            ...current,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" onClick={addServiceDraft}>
                        <Plus className="mr-2 size-4" />
                        {t("createCenter.actions.addService", {
                          defaultValue: "Add service",
                        })}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {serviceDrafts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                          {t("createCenter.review.skippedInventory", {
                            defaultValue: "No services added yet.",
                          })}
                        </div>
                      ) : (
                        serviceDrafts.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-2xl border bg-muted/20 p-4"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.type} • {item.price}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setServiceDrafts((current) =>
                                  current.filter(
                                    (draft) => draft.id !== item.id
                                  )
                                )
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="product" className="space-y-4 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.productName", {
                            defaultValue: "Product name",
                          })}
                        </Label>
                        <Input
                          value={productDraft.name}
                          onChange={(e) =>
                            setProductDraft((current) => ({
                              ...current,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.productType", {
                            defaultValue: "Product type",
                          })}
                        </Label>
                        <select
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={productDraft.type}
                          onChange={(e) =>
                            setProductDraft((current) => ({
                              ...current,
                              type: e.target.value as ProductType,
                            }))
                          }
                        >
                          <option value="BEVERAGE">
                            {t("createCenter.enums.productType.beverage", {
                              defaultValue: "Beverage",
                            })}
                          </option>
                          <option value="CONSUMABLE">
                            {t("createCenter.enums.productType.consumable", {
                              defaultValue: "Consumable",
                            })}
                          </option>
                          <option value="EQUIPMENT">
                            {t("createCenter.enums.productType.equipment", {
                              defaultValue: "Equipment",
                            })}
                          </option>
                          <option value="CLOTHING">
                            {t("createCenter.enums.productType.clothing", {
                              defaultValue: "Clothing",
                            })}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.price", {
                            defaultValue: "Price",
                          })}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={productDraft.price}
                          onChange={(e) =>
                            setProductDraft((current) => ({
                              ...current,
                              price: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.stock", {
                            defaultValue: "Stock",
                          })}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={productDraft.stock}
                          onChange={(e) =>
                            setProductDraft((current) => ({
                              ...current,
                              stock: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.unit", {
                            defaultValue: "Unit",
                          })}
                        </Label>
                        <Input
                          value={productDraft.unit}
                          onChange={(e) =>
                            setProductDraft((current) => ({
                              ...current,
                              unit: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.imageUrl", {
                            defaultValue: "Image URL",
                          })}
                        </Label>
                        <Input
                          value={productDraft.imageUrl}
                          onChange={(e) =>
                            setProductDraft((current) => ({
                              ...current,
                              imageUrl: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {t("createCenter.fields.description", {
                            defaultValue: "Description",
                          })}
                        </Label>
                        <Textarea
                          value={productDraft.description}
                          onChange={(e) =>
                            setProductDraft((current) => ({
                              ...current,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" onClick={addProductDraft}>
                        <Plus className="mr-2 size-4" />
                        {t("createCenter.actions.addProduct", {
                          defaultValue: "Add product",
                        })}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {productDrafts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                          {t("createCenter.review.skippedInventory", {
                            defaultValue: "No products added yet.",
                          })}
                        </div>
                      ) : (
                        productDrafts.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-2xl border bg-muted/20 p-4"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.type} • {item.price}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setProductDrafts((current) =>
                                  current.filter(
                                    (draft) => draft.id !== item.id
                                  )
                                )
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("createCenter.review.center", {
                          defaultValue: "Center",
                        })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>{centerSnapshot?.name ?? centerDraft.name}</p>
                      <p className="text-muted-foreground">
                        {centerSnapshot?.address ?? centerDraft.address}
                      </p>
                      <p>
                        {centerSnapshot?.openTime ?? centerDraft.openTime} -{" "}
                        {centerSnapshot?.closeTime ?? centerDraft.closeTime}
                      </p>
                      <p>
                        {centerSnapshot?.paymentBankName ??
                          centerDraft.paymentBankName}
                      </p>
                      <p>
                        {centerSnapshot?.paymentAccountName ??
                          centerDraft.paymentAccountName}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("createCenter.review.pricing", {
                          defaultValue: "Price slots",
                        })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {priceSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between"
                        >
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span>{slot.pricePerHour}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("createCenter.review.policy", {
                          defaultValue: "Cancellation policy",
                        })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>
                        {t("createCenter.fields.allowCancellation", {
                          defaultValue: "Allow cancellation",
                        })}
                        :{" "}
                        {policy.allowCancellation
                          ? t("common.yes")
                          : t("common.no")}
                      </p>
                      {policy.tiers.map((tier) => (
                        <div
                          key={tier.id}
                          className="flex items-center justify-between"
                        >
                          <span>{tier.minDaysBeforeStart}d</span>
                          <span>{tier.refundPercent}%</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("createCenter.review.courts", {
                          defaultValue: "Courts",
                        })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {courtDrafts.length === 0 ? (
                        <p className="text-muted-foreground">
                          {t("createCenter.review.skippedCourts", {
                            defaultValue: "Courts will be configured later.",
                          })}
                        </p>
                      ) : (
                        courtDrafts.map((court) => (
                          <div
                            key={court.id}
                            className="flex items-center justify-between"
                          >
                            <span>{court.name}</span>
                            <span>{court.type}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("createCenter.review.services", {
                          defaultValue: "Services",
                        })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {serviceDrafts.length === 0 ? (
                        <p className="text-muted-foreground">
                          {t("createCenter.review.skippedInventory", {
                            defaultValue: "Services will be configured later.",
                          })}
                        </p>
                      ) : (
                        serviceDrafts.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between"
                          >
                            <span>{service.name}</span>
                            <span>{service.price}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("createCenter.review.products", {
                          defaultValue: "Products",
                        })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {productDrafts.length === 0 ? (
                        <p className="text-muted-foreground">
                          {t("createCenter.review.skippedInventory", {
                            defaultValue: "Products will be configured later.",
                          })}
                        </p>
                      ) : (
                        productDrafts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between"
                          >
                            <span>{product.name}</span>
                            <span>{product.price}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <AlertTitle>
                    {t("createCenter.review.noteTitle", {
                      defaultValue: "Review before finishing",
                    })}
                  </AlertTitle>
                  <AlertDescription>
                    {t("createCenter.review.note", {
                      defaultValue:
                        "The wizard will sync the latest server state before navigating to the management detail page.",
                    })}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={
                  currentStep === 1 ||
                  centerMutation.isPending ||
                  priceSlotsMutation.isPending ||
                  policyMutation.isPending ||
                  finalizeMutation.isPending
                }
              >
                <ArrowLeft className="mr-2 size-4" />
                {t("common.previous")}
              </Button>

              <div className="flex items-center gap-3">
                {currentStep === 4 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(5)}
                  >
                    {t("createCenter.actions.skip", { defaultValue: "Skip" })}
                  </Button>
                )}
                {currentStep === 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(6)}
                  >
                    {t("createCenter.actions.skip", { defaultValue: "Skip" })}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={goToNextStep}
                  disabled={
                    centerMutation.isPending ||
                    priceSlotsMutation.isPending ||
                    policyMutation.isPending ||
                    finalizeMutation.isPending
                  }
                >
                  {(centerMutation.isPending ||
                    priceSlotsMutation.isPending ||
                    policyMutation.isPending ||
                    finalizeMutation.isPending) && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  {currentStep === 6
                    ? t("createCenter.actions.finish", {
                        defaultValue: "Finish",
                      })
                    : t("common.next")}
                  {currentStep < 6 && <ArrowRight className="ml-2 size-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
