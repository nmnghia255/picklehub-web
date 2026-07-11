"use client"

import { Languages } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getStoredLanguage,
  setLanguagePreference,
  type SupportedLanguage,
} from "@/i18n/language"

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation("common")
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

  const handleLanguageChange = (value: string) => {
    if (value === "en" || value === "vi") {
      setLanguage(value)
      void setLanguagePreference(value)
    }
  }

  if (!mounted) {
    return <div className="h-10 w-10" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={t("header.language")}
          aria-label={t("header.language")}
        >
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={handleLanguageChange}
        >
          <DropdownMenuRadioItem value="en">
            {t("header.languageEnglish")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="vi">
            {t("header.languageVietnamese")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
