"use client"

import {
  Languages,
  LogOut,
  MonitorCog,
  MoonStar,
  SunMedium,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

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

const LANGUAGE_STORAGE_KEY = "picklehub-language"

const languageOptions = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
]

const themeOptions = [
  { value: "light", label: "Sáng", icon: SunMedium },
  { value: "dark", label: "Tối", icon: MoonStar },
  { value: "system", label: "Theo hệ thống", icon: MonitorCog },
] as const

type ThemeValue = (typeof themeOptions)[number]["value"]
type LanguageValue = (typeof languageOptions)[number]["value"]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState<LanguageValue>(() => {
    if (typeof window === "undefined") {
      return "vi"
    }

    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return storedLanguage === "vi" || storedLanguage === "en"
      ? storedLanguage
      : "vi"
  })

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  const themeValue = (theme ?? "system") as ThemeValue

  return (
    <PageContainer className="py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Cài đặt</h1>
        <p className="max-w-2xl text-muted-foreground">
          Chỉnh ngôn ngữ, giao diện và quản lý phiên đăng nhập của bạn ngay tại
          đây.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="size-4" />
                Ngôn ngữ
              </CardTitle>
              <CardDescription>
                Chọn ngôn ngữ hiển thị cho giao diện ứng dụng.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-center">
                <Select
                  value={language}
                  onValueChange={(value) => setLanguage(value as LanguageValue)}
                >
                  <SelectTrigger className="w-full sm:max-w-xs">
                    <SelectValue placeholder="Chọn ngôn ngữ" />
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
                    ? "Giao diện ưu tiên tiếng Việt."
                    : "Interface is set to English."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SunMedium className="size-4" />
                Giao diện
              </CardTitle>
              <CardDescription>
                Điều chỉnh chế độ sáng, tối hoặc theo thiết bị của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-center">
                <Select
                  value={themeValue}
                  onValueChange={(value) => setTheme(value as ThemeValue)}
                >
                  <SelectTrigger className="w-full sm:max-w-xs">
                    <SelectValue placeholder="Chọn giao diện" />
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
                    ? "Bạn đang dùng giao diện tối."
                    : themeValue === "light"
                      ? "Bạn đang dùng giao diện sáng."
                      : "Giao diện sẽ tự theo cài đặt của hệ điều hành."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="size-4" />
              Phiên đăng nhập
            </CardTitle>
            <CardDescription>
              Đăng xuất khỏi thiết bị này khi bạn không còn sử dụng nữa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={logoutAction}>
              <Button type="submit" variant="destructive" className="w-full">
                Đăng xuất
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
