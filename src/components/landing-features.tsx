"use client"

import {
  Package,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Trophy,
    titleKey: "landing.features.items.tournament.title",
    descriptionKey: "landing.features.items.tournament.description",
  },
  {
    icon: Users,
    titleKey: "landing.features.items.community.title",
    descriptionKey: "landing.features.items.community.description",
  },
  {
    icon: TrendingUp,
    titleKey: "landing.features.items.analytics.title",
    descriptionKey: "landing.features.items.analytics.description",
  },
  {
    icon: Sparkles,
    titleKey: "landing.features.items.ai.title",
    descriptionKey: "landing.features.items.ai.description",
  },
  {
    icon: Package,
    titleKey: "landing.features.items.equipment.title",
    descriptionKey: "landing.features.items.equipment.description",
  },
  {
    icon: Target,
    titleKey: "landing.features.items.groups.title",
    descriptionKey: "landing.features.items.groups.description",
  },
]

export function LandingFeatures() {
  const { t } = useTranslation("common")

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            {t("landing.features.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("landing.features.description")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="flex flex-col gap-4 p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold">{t(feature.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(feature.descriptionKey)}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
