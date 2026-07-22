"use client"

import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

export function LandingHero() {
  const { t } = useTranslation("common")

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background ambient glowing mesh gradients */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-indigo-500/20 opacity-70 blur-3xl dark:opacity-40" />
      <div className="pointer-events-none absolute top-1/2 right-0 -z-10 size-[350px] rounded-full bg-emerald-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -z-10 size-[300px] rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Grid Pattern overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:36px_36px]" />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Animated Top Pill Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-700 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/15 dark:text-emerald-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("landing.hero.badge")}</span>
          </div>

          {/* Main Title */}
          <h1 className="max-w-4xl text-4xl leading-[1.1] font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            {t("landing.hero.titlePrefix")}{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
              {t("landing.hero.titleHighlight")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            {t("landing.hero.description")}
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-8 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row sm:justify-center">
            <Button
              size="lg"
              asChild
              className="group h-13 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 text-base font-bold text-white shadow-xl shadow-emerald-600/25 transition-all duration-300 hover:scale-[1.02] hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-600/35 active:scale-[0.98]"
            >
              <Link href="/register">
                <span>{t("landing.hero.cta")}</span>
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-13 rounded-xl border-border/80 bg-background/60 px-8 text-base font-semibold backdrop-blur-md transition-all hover:bg-muted/80 hover:text-foreground active:scale-[0.98]"
            >
              <Link href="/socials">{t("landing.hero.secondaryCta")}</Link>
            </Button>
          </div>

          {/* Impact Stats Strip */}
          <div className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-4 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-xl sm:grid-cols-4 sm:p-6">
            <div className="flex flex-col items-center gap-1 border-r border-border/40 p-2 last:border-r-0 sm:last:border-r-0">
              <span className="text-2xl font-extrabold tracking-tight text-emerald-600 sm:text-3xl dark:text-emerald-400">
                10K+
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {t("landing.hero.stats.players")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 sm:border-r sm:border-border/40">
              <span className="text-2xl font-extrabold tracking-tight text-teal-600 sm:text-3xl dark:text-teal-400">
                500+
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {t("landing.hero.stats.tournaments")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 border-r border-border/40 p-2 last:border-r-0">
              <span className="text-2xl font-extrabold tracking-tight text-cyan-600 sm:text-3xl dark:text-cyan-400">
                120+
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {t("landing.hero.stats.courts")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2">
              <span className="text-2xl font-extrabold tracking-tight text-amber-500 sm:text-3xl">
                4.9/5
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {t("landing.hero.stats.rating")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
