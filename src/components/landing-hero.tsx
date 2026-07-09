"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

export function LandingHero() {
  const { t } = useTranslation("common")

  return (
    <section className="py-20 md:py-28 lg:py-32">
      <div className="container mx-auto max-w-4xl px-6 text-center md:px-10">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {t("landing.hero.titlePrefix")}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {" "}
              {t("landing.hero.titleHighlight")}
            </span>
          </h1>

          <p className="text-lg text-muted-foreground md:text-xl">
            {t("landing.hero.description")}
          </p>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/register">{t("landing.hero.cta")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
