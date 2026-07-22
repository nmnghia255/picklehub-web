"use client"

import { CalendarCheck, Trophy, UserPlus } from "lucide-react"
import { useTranslation } from "react-i18next"

export function LandingHowItWorks() {
  const { t } = useTranslation("common")

  const steps = [
    {
      icon: UserPlus,
      stepNumber: "01",
      titleKey: "landing.howItWorks.step1Title",
      descKey: "landing.howItWorks.step1Desc",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: CalendarCheck,
      stepNumber: "02",
      titleKey: "landing.howItWorks.step2Title",
      descKey: "landing.howItWorks.step2Desc",
      color: "from-teal-500 to-cyan-600",
    },
    {
      icon: Trophy,
      stepNumber: "03",
      titleKey: "landing.howItWorks.step3Title",
      descKey: "landing.howItWorks.step3Desc",
      color: "from-cyan-500 to-emerald-600",
    },
  ]

  return (
    <section
      id="how-it-works"
      className="relative border-t border-border/40 bg-muted/30 py-16 md:py-24"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
            <span>{t("landing.howItWorks.badge")}</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t("landing.howItWorks.title")}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {t("landing.howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className="group relative flex flex-col items-center rounded-2xl border border-border/60 bg-card/70 p-6 text-center shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg"
              >
                <div
                  className={`mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${step.color} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="size-7" />
                </div>
                <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
                  {t("landing.howItWorks.stepLabel", {
                    number: step.stepNumber,
                  })}
                </span>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(step.descKey)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
