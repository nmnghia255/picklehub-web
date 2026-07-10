"use client"

import type { LucideIcon } from "lucide-react"
import {
  Languages,
  LogOut,
  MonitorCog,
  MoonStar,
  SunMedium,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { logoutAction } from "@/features/auth/actions"
import { languageStorageKey } from "@/i18n/settings"

type ThemeValue = "light" | "dark" | "system"
type LanguageValue = "vi" | "en"

export default function SettingsPage() {
  const { t, i18n } = useTranslation("common")
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState<LanguageValue>("vi")

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(languageStorageKey)
    if (storedLanguage === "vi" || storedLanguage === "en") {
      queueMicrotask(() => {
        setLanguage(storedLanguage)
        document.documentElement.lang = storedLanguage
        void i18n.changeLanguage(storedLanguage)
      })
    }
  }, [i18n])

  const languageOptions = [
    {
      value: "vi" as const,
      label: t("settingsPage.languageOptionVi", {
        defaultValue: "Tiếng Việt",
      }),
    },
    {
      value: "en" as const,
      label: t("settingsPage.languageOptionEn", {
        defaultValue: "English",
      }),
    },
  ]

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

  const handleLanguageChange = (value: LanguageValue) => {
    setLanguage(value)
    window.localStorage.setItem(languageStorageKey, value)
    document.documentElement.lang = value
    void i18n.changeLanguage(value).then(() => {
      window.location.reload()
    })
  }

  const themeValue = (theme ?? "system") as ThemeValue

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="size-4" />
                {t("settingsPage.languageTitle")}
              </CardTitle>
              <CardDescription>
                {t("settingsPage.languageDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-center">
                <Select
                  value={language}
                  onValueChange={(value) =>
                    handleLanguageChange(value as LanguageValue)
                  }
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

                <p className="text-sm text-muted-foreground">
                  {language === "vi"
                    ? t("settingsPage.vietnameseHint")
                    : t("settingsPage.englishHint")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SunMedium className="size-4" />
                {t("settingsPage.themeTitle")}
              </CardTitle>
              <CardDescription>{t("settingsPage.themeDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {themeValue === "dark"
                    ? t("settingsPage.themeDarkHint")
                    : themeValue === "light"
                      ? t("settingsPage.themeLightHint")
                      : t("settingsPage.themeSystemHint")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="size-4" />
              {t("settingsPage.sessionTitle")}
            </CardTitle>
            <CardDescription>{t("settingsPage.sessionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={logoutAction}>
              <Button type="submit" variant="destructive" className="w-full">
                {t("settingsPage.logoutBtn")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
