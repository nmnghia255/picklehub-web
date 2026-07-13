"use client"

import type { LucideIcon } from "lucide-react"
import { MonitorCog, MoonStar, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { PageContainer } from "@/components/page-container"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SettingsAccountSection } from "@/features/auth/components/settings-account-section"
import type { LinkedProvider } from "@/features/auth/types"
import {
  getStoredLanguage,
  setLanguagePreference,
  type SupportedLanguage,
} from "@/i18n/language"

type ThemeValue = "light" | "dark" | "system"

interface SettingsContentProps {
  linkedProviders: LinkedProvider[]
}

export function SettingsContent({ linkedProviders }: SettingsContentProps) {
  const { t, i18n } = useTranslation("common")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState<SupportedLanguage>(() =>
    getStoredLanguage()
  )

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true)
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const handleLanguageChanged = (nextLanguage: string) => {
      if (nextLanguage === "en" || nextLanguage === "vi") {
        setLanguage(nextLanguage)
      }
    }

    i18n.on("languageChanged", handleLanguageChanged)

    return () => {
      i18n.off("languageChanged", handleLanguageChanged)
    }
  }, [i18n])

  const themeOptions: Array<{
    value: ThemeValue
    label: string
    icon: LucideIcon
  }> = [
    {
      value: "light",
      label: t("settingsPage.themeLightLabel"),
      icon: SunMedium,
    },
    {
      value: "dark",
      label: t("settingsPage.themeDarkLabel"),
      icon: MoonStar,
    },
    {
      value: "system",
      label: t("settingsPage.themeSystemLabel"),
      icon: MonitorCog,
    },
  ]

  const themeValue = (mounted ? (theme ?? "system") : "system") as ThemeValue
  const languageValue = mounted ? language : getStoredLanguage()

  const languageOptions: Array<{
    value: SupportedLanguage
    label: string
  }> = [
    {
      value: "vi",
      label: t("settingsPage.languageOptionVi"),
    },
    {
      value: "en",
      label: t("settingsPage.languageOptionEn"),
    },
  ]

  const languageHint =
    !mounted || languageValue === "vi"
      ? t("settingsPage.vietnameseHint")
      : t("settingsPage.englishHint")

  return (
    <PageContainer className="py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("settingsPage.title")}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {t("settingsPage.desc")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4" id="appearance">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {t("settingsPage.themeTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("settingsPage.themeDesc")}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-center">
                <Select
                  value={themeValue}
                  onValueChange={(value) => setTheme(value as ThemeValue)}
                >
                  <SelectTrigger className="w-full sm:max-w-xs">
                    <SelectValue
                      placeholder={t("settingsPage.selectThemePlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((option) => {
                      const Icon = option.icon

                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <Icon className="size-4" />
                            {option.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                <p className="text-sm text-muted-foreground">
                  {!mounted || themeValue === "system"
                    ? t("settingsPage.themeSystemHint")
                    : themeValue === "dark"
                      ? t("settingsPage.themeDarkHint")
                      : t("settingsPage.themeLightHint")}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4" id="language">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {t("settingsPage.languageTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("settingsPage.languageDesc")}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-center">
                <Select
                  value={languageValue}
                  onValueChange={(value) => {
                    if (value === "en" || value === "vi") {
                      setLanguage(value)
                      void setLanguagePreference(value)
                    }
                  }}
                >
                  <SelectTrigger className="w-full sm:max-w-xs">
                    <SelectValue
                      placeholder={t("settingsPage.selectLanguagePlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="text-sm text-muted-foreground">{languageHint}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="lg:col-span-2">
          <SettingsAccountSection linkedProviders={linkedProviders} />
        </div>
      </div>
    </PageContainer>
  )
}
