import { Check } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { WizardStep } from "./types"

type StepItem = {
  number: WizardStep
  title: string
}

export function WizardStepper({
  currentStep,
  totalSteps,
  steps,
  onStepClick,
}: {
  currentStep: WizardStep
  totalSteps: number
  steps: StepItem[]
  onStepClick: (step: WizardStep) => void
}) {
  const { t } = useSportCenterManagementTranslation()
  const progressPercent = (currentStep / totalSteps) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <span>
          {t("createCenter.stepLabel", { defaultValue: "Step" })} {currentStep}{" "}
          / {totalSteps}
        </span>
        <span className="font-semibold text-foreground">
          {Math.round(progressPercent)}%
        </span>
      </div>
      <Progress value={progressPercent} className="h-2 rounded-full" />

      {/* Desktop Vertical Stepper */}
      <div className="hidden space-y-2 lg:block">
        {steps.map((step) => {
          const isActive = step.number === currentStep
          const isDone = step.number < currentStep
          const isNavigable =
            step.number <= currentStep || (currentStep > 3 && step.number <= 3)

          return (
            <button
              key={step.number}
              type="button"
              disabled={!isNavigable}
              onClick={() => isNavigable && onStepClick(step.number)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                isActive
                  ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20"
                  : isDone
                    ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                    : "border-border/60 bg-card text-muted-foreground opacity-60"
              }`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="size-4 stroke-[3]" /> : step.number}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  {t("createCenter.stepLabel", { defaultValue: "Bước" })}{" "}
                  {step.number}
                </p>
                <p className="truncate text-sm leading-tight font-medium">
                  {step.title}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Mobile Horizontal Stepper */}
      <div className="grid grid-cols-6 gap-1.5 lg:hidden">
        {steps.map((step) => {
          const isActive = step.number === currentStep
          const isDone = step.number < currentStep
          const isNavigable =
            step.number <= currentStep || (currentStep > 3 && step.number <= 3)

          return (
            <button
              key={step.number}
              type="button"
              disabled={!isNavigable}
              onClick={() => isNavigable && onStepClick(step.number)}
              className={`flex h-10 flex-col items-center justify-center rounded-lg border text-xs transition-colors ${
                isActive
                  ? "border-primary bg-primary font-semibold text-primary-foreground"
                  : isDone
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-border/60 bg-muted/30 text-muted-foreground"
              }`}
              title={step.title}
            >
              {isDone ? <Check className="size-3.5" /> : step.number}
            </button>
          )
        })}
      </div>
    </div>
  )
}
