"use client"

import { ArrowRight, Globe, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useLayoutEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { setLanguagePreference } from "@/i18n/language"
import { cn } from "@/lib/utils"

export function LandingPageHeader() {
  const { t, i18n } = useTranslation("common")
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const currentLang = i18n.language || "vi"
  const isDark = mounted && resolvedTheme === "dark"

  const toggleLanguage = () => {
    const nextLang = currentLang === "vi" ? "en" : "vi"
    setLanguagePreference(nextLang)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 font-semibold text-foreground transition-all"
        >
          {mounted ? (
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 p-1 shadow-xs transition-transform duration-300 group-hover:scale-105",
                isDark ? "bg-white" : "bg-muted/20"
              )}
            >
              <img
                src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                alt={t("brand")}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="size-9 rounded-xl bg-muted/40" />
          )}
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            {t("brand")}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a
            href="#features"
            className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {t("landing.header.features")}
          </a>
          <a
            href="#how-it-works"
            className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {t("landing.howItWorks.title")}
          </a>
          <Link
            href="/socials"
            className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {t("landing.header.socials")}
          </Link>
          <Link
            href="/tournaments"
            className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {t("landing.header.tournaments")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-9 gap-1.5 rounded-full px-2.5 text-xs font-bold tracking-wider text-muted-foreground uppercase hover:text-foreground"
            title={t("landing.header.languageToggle")}
          >
            <Globe className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{currentLang === "vi" ? "VI" : "EN"}</span>
          </Button>

          {/* Theme Toggle */}
          {mounted ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={t("landing.header.themeToggle")}
              title={
                isDark
                  ? t("landing.header.switchToLight")
                  : t("landing.header.switchToDark")
              }
            >
              {isDark ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-slate-700" />
              )}
            </Button>
          ) : (
            <div className="size-9" />
          )}

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden font-medium sm:inline-flex"
          >
            <Link href="/login">{t("landing.header.signIn")}</Link>
          </Button>

          <Button
            size="sm"
            asChild
            className="group rounded-full bg-emerald-600 px-4 font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-95"
          >
            <Link href="/register">
              <span>{t("landing.header.getStarted")}</span>
              <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
