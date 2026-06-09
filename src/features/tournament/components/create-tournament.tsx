"use client"

import { ArrowLeft, ArrowRight, Check, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

export function CreateTournament() {
  const router = useRouter()
  const { t } = useTournamentTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const steps = [
    { number: 1, title: t("create.steps.basicInfo") },
    { number: 2, title: t("create.steps.registration") },
    { number: 3, title: t("create.steps.financial") },
    { number: 4, title: t("create.steps.prizes") },
    { number: 5, title: t("create.steps.review") },
  ]

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/tournaments/1")
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("create.back")}
          </Button>
          <h1 className="mb-2 text-3xl font-semibold text-gray-900">
            {t("create.title")}
          </h1>
          <p className="text-gray-600">{t("create.subtitle")}</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors ${
                      step.number < currentStep
                        ? "bg-emerald-600 text-white"
                        : step.number === currentStep
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.number < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-2 text-center text-xs whitespace-nowrap text-gray-600">
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="mx-2 -mt-8 h-px flex-1 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && <Step1BasicInfo />}
            {currentStep === 2 && <Step2Registration />}
            {currentStep === 3 && <Step3Financial />}
            {currentStep === 4 && <Step4Prizes />}
            {currentStep === 5 && <Step5Review />}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between border-t pt-6">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("create.buttons.previous")}
              </Button>
              <Button
                onClick={goToNextStep}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {currentStep === totalSteps
                  ? t("create.buttons.publish")
                  : t("create.buttons.next")}
                {currentStep < totalSteps && (
                  <ArrowRight className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Step1BasicInfo() {
  const { t } = useTournamentTranslation()
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="tournament-name">{t("create.step1.nameLabel")}</Label>
        <Input
          id="tournament-name"
          placeholder={t("create.step1.namePlaceholder")}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="description">
          {t("create.step1.descriptionLabel")}
        </Label>
        <Textarea
          id="description"
          placeholder={t("create.step1.descriptionPlaceholder")}
          className="mt-1.5 min-h-24"
        />
      </div>

      <div>
        <Label htmlFor="banner">{t("create.step1.bannerLabel")}</Label>
        <div className="mt-1.5 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-emerald-400">
          <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            {t("create.step1.bannerUploadHint")}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {t("create.step1.bannerSizeHint")}
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="venue">{t("create.step1.venueLabel")}</Label>
        <Input
          id="venue"
          placeholder={t("create.step1.venuePlaceholder")}
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-date">{t("create.step1.startDateLabel")}</Label>
          <Input id="start-date" type="date" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="end-date">{t("create.step1.endDateLabel")}</Label>
          <Input id="end-date" type="date" className="mt-1.5" />
        </div>
      </div>
    </div>
  )
}

function Step2Registration() {
  const { t } = useTournamentTranslation()
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reg-open">{t("create.step2.regOpenLabel")}</Label>
          <Input id="reg-open" type="date" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="reg-close">{t("create.step2.regCloseLabel")}</Label>
          <Input id="reg-close" type="date" className="mt-1.5" />
        </div>
      </div>

      <div>
        <Label htmlFor="max-participants">
          {t("create.step2.maxParticipantsLabel")}
        </Label>
        <Input
          id="max-participants"
          type="number"
          placeholder="200"
          className="mt-1.5"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
        <div>
          <div className="font-medium text-gray-900">
            {t("create.step2.enableWaitlist")}
          </div>
          <div className="text-sm text-gray-600">
            {t("create.step2.enableWaitlistDesc")}
          </div>
        </div>
        <Switch />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
        <div>
          <div className="font-medium text-gray-900">
            {t("create.step2.requirePartner")}
          </div>
          <div className="text-sm text-gray-600">
            {t("create.step2.requirePartnerDesc")}
          </div>
        </div>
        <Switch />
      </div>
    </div>
  )
}

function Step3Financial() {
  const { t } = useTournamentTranslation()
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="entry-fee">{t("create.step3.entryFeeLabel")}</Label>
          <Input
            id="entry-fee"
            type="number"
            placeholder="145"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="currency">{t("create.step3.currencyLabel")}</Label>
          <Select defaultValue="usd">
            <SelectTrigger id="currency" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">
                {t("create.step3.currencies.usd")}
              </SelectItem>
              <SelectItem value="cad">
                {t("create.step3.currencies.cad")}
              </SelectItem>
              <SelectItem value="eur">
                {t("create.step3.currencies.eur")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="refund-policy">
          {t("create.step3.refundPolicyLabel")}
        </Label>
        <Select defaultValue="full">
          <SelectTrigger id="refund-policy" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">
              {t("create.step3.refundPolicies.full")}
            </SelectItem>
            <SelectItem value="partial">
              {t("create.step3.refundPolicies.partial")}
            </SelectItem>
            <SelectItem value="none">
              {t("create.step3.refundPolicies.none")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="late-fee">{t("create.step3.lateFeeLabel")}</Label>
        <Input
          id="late-fee"
          type="number"
          placeholder="25"
          className="mt-1.5"
        />
      </div>
    </div>
  )
}

function Step4Prizes() {
  const { t } = useTournamentTranslation()
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="champion-prize">
          {t("create.step4.championLabel")}
        </Label>
        <Input
          id="champion-prize"
          type="number"
          placeholder="1000"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="runner-up-prize">
          {t("create.step4.runnerUpLabel")}
        </Label>
        <Input
          id="runner-up-prize"
          type="number"
          placeholder="500"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="third-prize">{t("create.step4.thirdPrizeLabel")}</Label>
        <Input
          id="third-prize"
          type="number"
          placeholder="250"
          className="mt-1.5"
        />
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">{t("create.step4.prizeHint")}</p>
      </div>
    </div>
  )
}

function Step5Review() {
  const { t } = useTournamentTranslation()
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900">
          {t("create.step5.summaryTitle")}
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="mb-1 text-gray-600">{t("create.step5.name")}</div>
            <div className="font-medium text-gray-900">
              San Diego Summer Slam 2026
            </div>
          </div>
          <div>
            <div className="mb-1 text-gray-600">{t("create.step5.venue")}</div>
            <div className="font-medium text-gray-900">
              Balboa Park Tennis & Pickleball Center
            </div>
          </div>
          <div>
            <div className="mb-1 text-gray-600">{t("create.step5.dates")}</div>
            <div className="font-medium text-gray-900">June 15-17, 2026</div>
          </div>
          <div>
            <div className="mb-1 text-gray-600">
              {t("create.step5.maxParticipants")}
            </div>
            <div className="font-medium text-gray-900">200</div>
          </div>
          <div>
            <div className="mb-1 text-gray-600">
              {t("create.step5.entryFee")}
            </div>
            <div className="font-medium text-gray-900">$145</div>
          </div>
          <div>
            <div className="mb-1 text-gray-600">
              {t("create.step5.championPrize")}
            </div>
            <div className="font-medium text-gray-900">$1,000</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm text-emerald-900">
          {t("create.step5.reviewHint")}
        </p>
      </div>
    </div>
  )
}
