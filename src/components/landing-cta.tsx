"use client"

import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

export function LandingCTA() {
  const { t } = useTranslation("common")

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 px-6 py-16 text-center text-white shadow-2xl sm:px-12 md:py-20">
          {/* Ambient Glow background */}
          <div className="pointer-events-none absolute -top-20 -left-20 size-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 size-80 rounded-full bg-teal-500/20 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-4 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <Sparkles className="size-3.5 text-emerald-400" />
              <span>{t("landing.ctaSection.badge")}</span>
            </div>

            <h2 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              {t("landing.ctaSection.title")}
            </h2>

            <p className="mt-4 text-base text-emerald-100/80 sm:text-lg">
              {t("landing.ctaSection.description")}
            </p>

            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                asChild
                className="group h-13 rounded-xl bg-emerald-500 px-8 text-base font-bold text-slate-950 shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:bg-emerald-400 active:scale-95"
              >
                <Link href="/register">
                  <span>{t("landing.ctaSection.button")}</span>
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
