"use client"

import {
  Activity,
  Building2,
  GraduationCap,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Trophy,
    colorClass:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    titleKey: "landing.features.items.tournament.title",
    descriptionKey: "landing.features.items.tournament.description",
  },
  {
    icon: Users,
    colorClass:
      "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400",
    badgeColor: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
    titleKey: "landing.features.items.community.title",
    descriptionKey: "landing.features.items.community.description",
  },
  {
    icon: Activity,
    colorClass:
      "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
    badgeColor: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    titleKey: "landing.features.items.analytics.title",
    descriptionKey: "landing.features.items.analytics.description",
  },
  {
    icon: Sparkles,
    colorClass:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    titleKey: "landing.features.items.ai.title",
    descriptionKey: "landing.features.items.ai.description",
  },
  {
    icon: Building2,
    colorClass:
      "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
    badgeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    titleKey: "landing.features.items.equipment.title",
    descriptionKey: "landing.features.items.equipment.description",
  },
  {
    icon: GraduationCap,
    colorClass:
      "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400",
    badgeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
    titleKey: "landing.features.items.groups.title",
    descriptionKey: "landing.features.items.groups.description",
  },
]

export function LandingFeatures() {
  const { t } = useTranslation("common")

  return (
    <section id="features" className="relative py-16 md:py-24 lg:py-28">
      {/* Background ambient blur */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="size-3.5 text-emerald-500" />
            <span>{t("landing.features.badge")}</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {t("landing.features.title")}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {t("landing.features.description")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="group relative flex flex-col justify-between overflow-hidden border-border/60 bg-card/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div>
                  <div
                    className={`mb-5 flex size-12 items-center justify-center rounded-xl border ${feature.colorClass} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(feature.descriptionKey)}
                  </p>
                </div>

                {/* <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>{t("landing.features.learnMore")}</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div> */}
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
