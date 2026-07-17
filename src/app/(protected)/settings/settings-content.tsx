"use client"

import {
  KeyRound,
  type LucideIcon,
  MonitorCog,
  MoonStar,
  Settings,
  SunMedium,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { PageContainer } from "@/components/page-container"
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
import { Separator } from "@/components/ui/separator"
import {
  LinkedAccountsCard,
  PasswordSecuritySection,
  SessionActionsCard,
} from "@/features/auth/components/settings-account-section"
import type { LinkedProvider } from "@/features/auth/types"
import type { User } from "@/features/profile/types"
import {
  getStoredLanguage,
  setLanguagePreference,
  type SupportedLanguage,
} from "@/i18n/language"

type ThemeValue = "light" | "dark" | "system"

interface SettingsContentProps {
  linkedProviders: LinkedProvider[]
  user: User | null
}

export function SettingsContent({
  linkedProviders,
  user,
}: SettingsContentProps) {
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
        {/* Left Column: Theme, Language, Security inside a single Card */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-4" />
              {t("settingsPage.generalSettingsAndSecurityTitle", {
                defaultValue: "Cài đặt chung & Bảo mật",
              })}
            </CardTitle>
            <CardDescription>
              {t("settingsPage.generalSettingsAndSecurityDesc", {
                defaultValue:
                  "Cấu hình giao diện, ngôn ngữ hiển thị và quản lý bảo mật mật khẩu của bạn.",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Section */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm leading-none font-medium">
                  {t("settingsPage.themeTitle")}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("settingsPage.themeDesc")}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-center">
                <Select
                  value={themeValue}
                  onValueChange={(value) => setTheme(value as ThemeValue)}
                >
                  <SelectTrigger className="w-full">
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

                <p className="text-xs text-muted-foreground">
                  {!mounted || themeValue === "system"
                    ? t("settingsPage.themeSystemHint")
                    : themeValue === "dark"
                      ? t("settingsPage.themeDarkHint")
                      : t("settingsPage.themeLightHint")}
                </p>
              </div>
            </div>

            <Separator />

            {/* Language Section */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm leading-none font-medium">
                  {t("settingsPage.languageTitle")}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("settingsPage.languageDesc")}
                </p>
              </div>
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
                  <SelectTrigger className="w-full">
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

                <p className="text-xs text-muted-foreground">{languageHint}</p>
              </div>
            </div>

            <Separator />

            {/* Security Section */}
            <div className="space-y-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm leading-none font-medium">
                  <KeyRound className="size-4" />
                  {t("settingsPage.securityTitle")}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("settingsPage.securityDesc")}
                </p>
              </div>
              <PasswordSecuritySection user={user} />
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Social Accounts Link */}
        <LinkedAccountsCard
          linkedProviders={linkedProviders}
          className="h-full"
        />

        {/* Full Width Bottom: Logout Section */}
        <div className="lg:col-span-2">
          <SessionActionsCard />
        </div>
      </div>
    </PageContainer>
  )
}
