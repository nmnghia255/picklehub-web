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
  const [language, setLanguage] = useState<LanguageValue>(() => {
    if (typeof window === "undefined") {
      return "vi"
    }

    const storedLanguage = window.localStorage.getItem(languageStorageKey)
    return storedLanguage === "vi" || storedLanguage === "en"
      ? storedLanguage
      : "vi"
  })

  const languageOptions = [
    { value: "vi" as const, label: t("settings.language.options.vi") },
    { value: "en" as const, label: t("settings.language.options.en") },
  ]

  const themeOptions: Array<{
    value: ThemeValue
    label: string
    icon: LucideIcon
  }> = [
    {
      value: "light",
      label: t("settings.theme.options.light"),
      icon: SunMedium,
    },
    { value: "dark", label: t("settings.theme.options.dark"), icon: MoonStar },
    {
      value: "system",
      label: t("settings.theme.options.system"),
      icon: MonitorCog,
    },
  ]

  useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language)
    document.documentElement.lang = language
    void i18n.changeLanguage(language)
  }, [i18n, language])

  const themeValue = (theme ?? "system") as ThemeValue
  const currentLanguageLabel =
    language === "vi"
      ? t("settings.language.options.vi")
      : t("settings.language.options.en")
  const currentThemeMessage =
    themeValue === "dark"
      ? t("settings.theme.current.dark")
      : themeValue === "light"
        ? t("settings.theme.current.light")
        : t("settings.theme.current.system")

  return (
    <PageContainer className="py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {t("settings.description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="size-4" />
                {t("settings.language.title")}
              </CardTitle>
              <CardDescription>
                {t("settings.language.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-center">
                <Select
                  value={language}
                  onValueChange={(value) => setLanguage(value as LanguageValue)}
                >
                  <SelectTrigger className="w-full sm:max-w-xs">
                    <SelectValue
                      placeholder={t("settings.language.placeholder")}
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
                  {t("settings.language.current", {
                    language: currentLanguageLabel,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SunMedium className="size-4" />
                {t("settings.theme.title")}
              </CardTitle>
              <CardDescription>
                {t("settings.theme.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-center">
                <Select
                  value={themeValue}
                  onValueChange={(value) => setTheme(value as ThemeValue)}
                >
                  <SelectTrigger className="w-full sm:max-w-xs">
                    <SelectValue
                      placeholder={t("settings.theme.placeholder")}
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
                  {currentThemeMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="size-4" />
              {t("settings.session.title")}
            </CardTitle>
            <CardDescription>
              {t("settings.session.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={logoutAction}>
              <Button type="submit" variant="destructive" className="w-full">
                {t("settings.session.logout")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
